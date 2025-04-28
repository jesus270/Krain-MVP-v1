import { Redis } from "@upstash/redis";
import { SessionData, SessionOptions, sessionDataSchema } from "./types";
import { log } from "@krain/utils";
import { ZodError } from "zod";

const OPERATION_TIMEOUT = 5000; // 5 seconds

export class RedisSessionStore {
  constructor(
    private redis: Redis,
    private options: SessionOptions,
  ) {}

  private async withTimeout<T>(
    operation: Promise<T>,
    operationName: string,
  ): Promise<T> {
    try {
      const result = await Promise.race([
        operation,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`${operationName} operation timed out`)),
            OPERATION_TIMEOUT,
          ),
        ),
      ]);
      return result as T;
    } catch (error) {
      log.error(`Redis operation failed: ${operationName}`, {
        operation: operationName,
        entity: "REDIS",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async get(userId: string): Promise<SessionData | null> {
    const redisKey = this.getKey(userId);
    try {
      const data = await this.withTimeout(
        this.redis.get<string>(redisKey),
        "get_session",
      );

      if (data) {
        log.info("RedisStore.get: Retrieved raw data from Redis", {
          operation: "redis_store_get_raw",
          entity: "REDIS",
          userId,
          redisKey,
          rawData: data,
        });

        try {
          const jsonData = JSON.parse(data);
          log.info("RedisStore.get: JSON parsed data successfully", {
            operation: "redis_store_get_json_parsed",
            entity: "REDIS",
            userId,
            // Avoid logging potentially large/sensitive data here unless needed for debug
          });

          try {
            const validatedData = sessionDataSchema.parse(jsonData);
            log.info("RedisStore.get: Zod parsed data successfully", {
              operation: "redis_store_get_zod_parsed",
              entity: "REDIS",
              userId,
            });
            return validatedData;
          } catch (zodError) {
            log.error("RedisStore.get: Failed to parse session data with Zod", {
              operation: "redis_store_get_zod_error",
              entity: "REDIS",
              userId,
              error:
                zodError instanceof Error ? zodError.message : String(zodError),
              issues:
                zodError instanceof ZodError ? zodError.issues : undefined,
              jsonDataString: data, // Log the raw string that failed Zod parse
            });
            // Decide if we should return null or throw. Returning null might be safer.
            return null;
          }
        } catch (jsonParseError) {
          log.error("RedisStore.get: Failed to JSON.parse session data", {
            operation: "redis_store_get_json_error",
            entity: "REDIS",
            userId,
            error:
              jsonParseError instanceof Error
                ? jsonParseError.message
                : String(jsonParseError),
            rawData: data, // Log the raw string that failed JSON parse
          });
          return null;
        }
      }

      return null;
    } catch (error) {
      log.error("Failed to get session", {
        operation: "get_session",
        entity: "REDIS",
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async set(userId: string, data: SessionData | null): Promise<void> {
    log.info("RedisStore.set: Called", {
      operation: "redis_store_set_start",
      entity: "REDIS",
      userId,
    });
    let stringifiedData: string | null = null;
    const redisKey = this.getKey(userId);
    try {
      if (data === null) {
        log.info("RedisStore.set: Data is null, deleting key", {
          operation: "redis_store_set_delete",
          entity: "REDIS",
          userId,
        });
        await this.delete(userId);
        return; // Exit early if deleting
      }

      // Attempt to stringify
      try {
        stringifiedData = JSON.stringify(data);
        log.info("RedisStore.set: Data stringified successfully", {
          operation: "redis_store_set_stringify_ok",
          entity: "REDIS",
          userId,
          dataSize: stringifiedData.length,
        });
      } catch (stringifyError) {
        log.error("RedisStore.set: JSON.stringify failed", {
          operation: "redis_store_set_stringify_error",
          entity: "REDIS",
          userId,
          error:
            stringifyError instanceof Error
              ? stringifyError.message
              : String(stringifyError),
          // Avoid logging raw data object here as it caused the error
        });
        throw stringifyError; // Rethrow stringify error
      }

      // Attempt Redis set command
      log.info("RedisStore.set: Attempting redis.set command", {
        operation: "redis_store_set_redis_attempt",
        entity: "REDIS",
        userId,
        redisKey,
      });
      await this.withTimeout(
        this.redis.set(redisKey, stringifiedData),
        "set_session",
      );
      log.info(
        "RedisStore.set: redis.set command successful (Session stored)",
        {
          operation: "redis_store_set_redis_ok", // Changed operation code
          entity: "REDIS",
          userId,
          redisKey,
          dataBeingSet: stringifiedData,
          userBeingSet: data?.user ? JSON.stringify(data.user) : "undefined",
        },
      );
    } catch (error) {
      // Catch errors from delete, stringify rethrow, or redis.set
      log.error("RedisStore.set: Failed operation", {
        operation: "redis_store_set_error", // General error for the set operation
        entity: "REDIS",
        userId,
        errorSource:
          stringifiedData === null ? "stringify" : "redis.set/delete",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error; // Rethrow the underlying error
    }
  }

  async delete(userId: string): Promise<void> {
    try {
      await this.withTimeout(
        this.redis.del(this.getKey(userId)),
        "delete_session",
      );
      log.info("Session deleted", {
        operation: "delete_session",
        entity: "REDIS",
        userId,
      });
    } catch (error) {
      log.error("Failed to delete session", {
        operation: "delete_session",
        entity: "REDIS",
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  private getKey(userId: string): string {
    return `user:${userId}`;
  }
}
