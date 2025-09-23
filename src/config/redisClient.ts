import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

// Connect to Redis (default port 6379)
export const redis = new Redis(process.env.REDIS_URL!);

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redis;
