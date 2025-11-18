import "dotenv/config";

export const gatewayConfig = {
    cors: {
        origin: process.env.DOMAIN || "*",
    },
};

export const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    password: process.env.REDIS_PASSWORD || "",
};
