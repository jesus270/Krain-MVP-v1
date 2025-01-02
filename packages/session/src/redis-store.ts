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
    try {
      if (data === null) {
        await this.delete(userId);
      } else {
        await this.withTimeout(
          this.redis.set(this.getKey(userId), JSON.stringify(data)),
          "set_session",
        );
        log.info("Session stored", {
          operation: "set_session",
          entity: "REDIS",
          userId,
        });
      }
    } catch (error) {
      log.error("Failed to set session", {
        operation: "set_session",
        entity: "REDIS",
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
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
