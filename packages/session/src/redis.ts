import { Redis } from "@upstash/redis";
import { log } from "@krain/utils";

let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
  if (!redisClient) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url) {
      throw new Error("KV_REST_API_URL is not defined");
    }

    if (!token) {
      throw new Error("KV_REST_API_TOKEN is not defined");
    }

    try {
      redisClient = new Redis({
        url,
        token,
        automaticDeserialization: false, // Required for Edge Runtime
      });

      // Test connection
      await redisClient.ping();
      log.info("Redis connection established successfully", {
        operation: "redis_connect",
        entity: "REDIS",
      });
    } catch (error) {
      log.error("Failed to connect to Redis", {
        operation: "redis_connect",
        entity: "REDIS",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  return redisClient;
}
