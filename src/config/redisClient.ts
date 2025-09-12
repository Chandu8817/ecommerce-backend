import Redis from "ioredis";

// Connect to Redis (default port 6379)
export const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  // password: "yourpassword" // only if Redis is password protected
});

redis.on("connect", () => {
  console.log("✅ Connected to Redis");
});

redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redis;
