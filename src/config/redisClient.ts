import Redis, { Redis as RedisClient } from "ioredis";
import dotenv from "dotenv";
dotenv.config();

class RedisManager {
  private static instance: RedisManager;
  private client: RedisClient | null = null;

  private constructor() {}

  public static getInstance(): RedisManager {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisManager();
    }
    return RedisManager.instance;
  }

  public async getClient(): Promise<RedisClient> {
    if (!this.client || !this.client.status || this.client.status === 'end') {
      this.client = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: 10,
        enableReadyCheck: true,
        connectTimeout: 10000,
        commandTimeout: 5000,
        retryStrategy: (times) => {
          if (times > 5) {
            console.log('Max Redis reconnection attempts reached');
            return null;
          }
          return Math.min(times * 200, 2000);
        }
      });

      this.client.on("connect", () => {
        console.log("✅ Connected to Redis");
      });

      this.client.on("error", (err) => {
        console.error("❌ Redis connection error:", err.message);
      });
    }
    return this.client;
  }

  public async closeConnection(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.client = null;
    }
  }
}

export const redisManager = RedisManager.getInstance();
export default redisManager;