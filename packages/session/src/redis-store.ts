import { Redis } from "@upstash/redis";
import { SessionData, SessionOptions } from "./types";
import { log } from "@krain/utils";

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
    try {
      const data = await this.withTimeout(
        this.redis.get<string>(this.getKey(userId)),
        "get_session",
      );

      if (data) {
        log.info("Session retrieved", {
          operation: "get_session",
          entity: "REDIS",
          userId,
        });

        try {
          return JSON.parse(data);
        } catch (parseError) {
          log.error("Failed to parse session data", {
            operation: "get_session",
            entity: "REDIS",
            userId,
            error:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
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
      });
      await this.withTimeout(
        this.redis.set(this.getKey(userId), stringifiedData), // Use stringified data
        "set_session",
      );
      log.info(
        "RedisStore.set: redis.set command successful (Session stored)",
        {
          operation: "redis_store_set_redis_ok", // Changed operation code
          entity: "REDIS",
          userId,
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
