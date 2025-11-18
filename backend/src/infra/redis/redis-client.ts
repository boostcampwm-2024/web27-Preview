import Redis from "ioredis";

export const redisClient = new Redis(process.env.REDIS_HOST || "127.0.0.1");
