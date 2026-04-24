import "dotenv/config";
import fastifyWebsocket from "@fastify/websocket";
import fastify from "fastify";
import { Redis } from "@upstash/redis";
import logger from "./config/logger.js";
import config from "./config/config.js";
import router from "./router/router.js";
import createStore from "./store/store.js";
import ConnectionManager from "./connection/connection.js";


async function boot() {
  const app = fastify({ logger: false });

  const redis = new Redis({ url: config.upstashRedisRestUrl!, token: config.upstashRedisRestToken!, });
  await redis.ping();
  logger.info("Redis connected");

  const store = createStore(redis);
  const connection = ConnectionManager(store);

  await app.register(fastifyWebsocket);

  app.get("/", { websocket: true }, (socket, _req) => {
    connection.attach(socket as WebSocket);

    socket.on("message", (raw: object) => {
      const message = raw.toString();
      router.handle(socket as WebSocket, message, store);
    });

    socket.on("close", () => {
      connection.onClose(socket as WebSocket);
    });
  });

  app.get("/ping", (_req, reply) => {
    reply.send("pong");
  });

  app.get("/health", async (_req, reply) => {
    const checks: Record<string, { status: string; latencyMs?: number; message?: string }> = {};

    // Redis check
    const redisStart = performance.now();
    try {
      await redis.ping();
      checks.redis = { status: "up", latencyMs: Math.round(performance.now() - redisStart) };
    } catch (err) {
      checks.redis = {
        status: "down",
        latencyMs: Math.round(performance.now() - redisStart),
        message: err instanceof Error ? err.message : "Unknown error",
      };
    }

    const mem = process.memoryUsage();
    const isHealthy = Object.values(checks).every((c) => c.status === "up");

    reply.status(isHealthy ? 200 : 503).send({
      status: isHealthy ? "healthy" : "degraded",
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version ?? "1.0.0",
      node: process.version,
      memory: {
        rssMB: (mem.rss / 1024 / 1024).toFixed(2),
        heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
        heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2),
      },
      checks,
    });
  });

  app.listen({ port: config.PORT, host: "0.0.0.0" }, (err) => {
    if (err) {
      logger.error(err, "Failed to start server");
      process.exit(1);
    }
    logger.info(`🚀 Server listening on: ${config.PORT}`);
  });
}

boot().catch((err) => {
  console.error("❌ Server failed to start:", err);
  process.exit(1);
});
