"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisManager = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class RedisManager {
    constructor() {
        this.client = null;
    }
    static getInstance() {
        if (!RedisManager.instance) {
            RedisManager.instance = new RedisManager();
        }
        return RedisManager.instance;
    }
    async getClient() {
        if (!this.client || !this.client.status || this.client.status === 'end') {
            this.client = new ioredis_1.default(process.env.REDIS_URL, {
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
    async closeConnection() {
        if (this.client) {
            await this.client.quit();
            this.client = null;
        }
    }
}
exports.redisManager = RedisManager.getInstance();
exports.default = exports.redisManager;
