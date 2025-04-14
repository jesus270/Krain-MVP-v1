import { Redis } from "@upstash/redis";
import { log } from "@krain/utils";

// Cache the Redis client instance
let redisClient: Redis | null = null;

export async function getRedisClient(): Promise<Redis> {
  // Return cached client if it exists and is connected (implicitly checked by reuse)
  // Note: Upstash Redis client handles reconnections internally.
  if (redisClient) {
    // log.info("Reusing existing Redis client instance", {
    //   operation: "redis_connect_reuse",
    //   entity: "REDIS",
    // });
    return redisClient;
  }

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url) {
    throw new Error("KV_REST_API_URL is not defined");
  }

  if (!token) {
    throw new Error("KV_REST_API_TOKEN is not defined");
  }

  try {
    log.info("Creating new Redis client instance", {
      operation: "redis_connect_new_create",
      entity: "REDIS",
    });
    const newRedisClient = new Redis({
      url,
      token,
      automaticDeserialization: false, // Required for Edge Runtime
    });

    // Perform an initial operation (like PING) to ensure connection
    // await newRedisClient.ping(); // Ping might not be necessary, client connects lazily

    log.info("New Redis client instance created successfully", {
      operation: "redis_connect_new_success",
      entity: "REDIS",
    });

    // Cache the client
    redisClient = newRedisClient;
    return redisClient;
  } catch (error) {
    log.error("Failed to create new Redis client instance", {
      operation: "redis_connect_new_error",
      entity: "REDIS",
      error: error instanceof Error ? error.message : String(error),
    });
    // Clear the potentially bad client from cache
    redisClient = null;
    throw error;
  }
}
