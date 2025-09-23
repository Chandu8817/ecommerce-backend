import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();


export const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, 
  enableReadyCheck: false, 
  retryStrategy: (times) => {
    if (times > 10) return null; 
    return Math.min(times * 200, 2000); 
  },
});


redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redis;
