interface Config {
  PORT: number;
  isDev: boolean;
  rateLimit: number;
  pairCodeTtlMs: number;
  tokenTtlMs: number;
  upstashRedisRestUrl: string | undefined;
  upstashRedisRestToken: string | undefined;
}

 const config: Config = Object.freeze({
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  isDev: process.env.NODE_ENV !== "production",
  rateLimit: process.env.RATE_LIMITING_MS ? parseInt(process.env.RATE_LIMITING_MS, 10) : 200,
  pairCodeTtlMs: 60 * 1000,                     // 1 minute
  tokenTtlMs: 30 * 24 * 60 * 60 * 1000,         // 30 days
  upstashRedisRestUrl: process.env.UPSTASH_REDIS_REST_URL,
  upstashRedisRestToken: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default config;
