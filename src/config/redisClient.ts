import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,    // avoids "max retries per request" errors
  enableReadyCheck: false,       // important for cloud/managed Redis
  reconnectOnError: (err) => {
    const targetErrors = ["READONLY", "EPIPE", "ECONNRESET"];
    if (targetErrors.some((msg) => err.message.includes(msg))) {
      return true; // force reconnect
    }
    return false;
  },
  tls: process.env.REDIS_URL?.startsWith("rediss://") ? {} : undefined, // enable TLS if URL is rediss://
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redis;
