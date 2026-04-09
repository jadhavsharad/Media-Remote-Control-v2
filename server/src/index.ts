import "dotenv/config";
import fastifyWebsocket from "@fastify/websocket";
import fastify from "fastify";
import { Redis } from "@upstash/redis";
import logger from "./config/logger";
import config from "./config/config";
import router from "./router/router";
import createStore from "./store/store";
import ConnectionManager from "./connection/connection";


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
