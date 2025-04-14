import { Redis } from "@upstash/redis";
import { Session } from "./session";
import { SessionOptions, User } from "./types";
import { getRedisClient } from "./redis";
import { defaultSessionConfig } from "./config";
import { log } from "@krain/utils";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 100;

export async function getSession(userId: string): Promise<Session | null> {
  if (!userId) return null;

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      const redisClient = await getRedisClient();
      const session = await Session.get(
        userId,
        redisClient,
        defaultSessionConfig,
      );
      if (session) {
        const isActive = await session.checkActivity();
        if (isActive) {
          // Session found and active, save and return
          await session.save();
          return session;
        }
        // Session found but inactive/expired
        return null;
      }
      // Session not found, prepare for retry
    } catch (error) {
      log.error("Error getting session (attempt ${retries + 1})", {
        operation: "get_session_attempt",
        entity: "SESSION",
        userId,
        attempt: retries + 1,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      // If error is critical (e.g., Redis connection), don't retry unnecessarily
      if (retries >= MAX_RETRIES - 1) {
        log.error("Max retries reached for getSession", {
          operation: "get_session_max_retries",
          entity: "SESSION",
          userId,
        });
        return null; // Give up after max retries
      }
    }

    // Wait before retrying
    retries++;
    if (retries < MAX_RETRIES) {
      log.info("Session not found, retrying getSession...", {
        operation: "get_session_retry",
        entity: "SESSION",
        userId,
        attempt: retries + 1,
        delay: RETRY_DELAY_MS,
      });
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  // Should not be reached if MAX_RETRIES > 0, but return null as fallback
  log.warn("getSession failed after all retries", {
    operation: "get_session_failed",
    entity: "SESSION",
    userId,
  });
  return null;
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  try {
    const session = await getSession(userId);
    return session?.get("user") || null;
  } catch (error) {
    log.error("Error getting current user", {
      operation: "get_current_user",
      entity: "SESSION",
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return null;
  }
}

export async function setUserSession(user: User): Promise<void> {
  try {
    // Log the userId being used to create the session
    log.info("setUserSession: Start", {
      operation: "set_user_session_start",
      entity: "SESSION",
      userId: user.id,
    });

    const redisClient = await getRedisClient();
    // Log after getting redis client
    log.info("setUserSession: Got Redis client", {
      operation: "set_user_session_got_redis",
      entity: "SESSION",
      userId: user.id,
    });
    const session = await Session.create({
      userId: user.id,
      data: {
        user,
        isLoggedIn: true,
      },
      redis: redisClient,
      options: defaultSessionConfig,
    });
    // Log after creating session object
    log.info("setUserSession: Session object created", {
      operation: "set_user_session_created_object",
      entity: "SESSION",
      userId: user.id,
    });
    await session.save();
    // Log after saving session
    log.info("setUserSession: Session saved successfully", {
      operation: "set_user_session_saved",
      entity: "SESSION",
      userId: user.id,
    });
  } catch (error) {
    log.error("setUserSession: Error", {
      operation: "set_user_session_error",
      entity: "SESSION",
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error; // Rethrow as this is critical
  }
}

export async function clearUserSession(userId: string): Promise<void> {
  try {
    const session = await getSession(userId);
    if (session) {
      await session.destroy();
    }
  } catch (error) {
    log.error("Error clearing user session", {
      operation: "clear_user_session",
      entity: "SESSION",
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Don't throw - session clearing is not critical
  }
}

// Helper for server actions to validate auth
export async function withAuth<T>(
  userId: string,
  handler: (session: Session) => Promise<T>,
): Promise<T> {
  // Log the userId received by withAuth
  log.info("withAuth: Received call for userId", {
    operation: "with_auth_start",
    entity: "SESSION",
    userId,
  });

  let session: Session | null = null;
  try {
    // Log the userId JUST BEFORE calling getSession
    log.info("withAuth: Calling getSession with userId", {
      operation: "with_auth_get_session_call",
      entity: "SESSION",
      userId,
    });
    session = await getSession(userId);

    if (!session) {
      // If no session is found, authentication has failed upstream.
      // Do not attempt to create a new one here.
      log.warn("withAuth failed: No session found for user", {
        operation: "with_auth_no_session",
        entity: "SESSION",
        userId,
      });
      throw new Error("Authentication required: Session not found");
    }

    // If session exists but isLoggedIn is not explicitly true, treat as logged in
    // This handles cases where older sessions might not have this flag
    if (!session.get("isLoggedIn")) {
      session.set("isLoggedIn", true);
      // No need to await save here, will be saved after handler
    }

    try {
      const result = await handler(session);
      // Save session *after* successful handler execution
      try {
        log.info("withAuth: Attempting final session save...", {
          operation: "with_auth_save_attempt",
          entity: "SESSION",
          userId,
        });
        await session.save();
        log.info("withAuth: Final session save successful", {
          operation: "with_auth_save_success",
          entity: "SESSION",
          userId,
        });
      } catch (saveError) {
        log.error("withAuth: Error during final session.save()", {
          operation: "with_auth_save_error",
          entity: "SESSION",
          userId,
          error:
            saveError instanceof Error ? saveError.message : String(saveError),
          stack: saveError instanceof Error ? saveError.stack : undefined,
        });
        // Decide whether to rethrow or handle. Rethrowing might be safer
        // to indicate the action didn't fully complete its state persistence.
        throw new Error(
          `Failed to save session after action: ${saveError instanceof Error ? saveError.message : String(saveError)}`,
        );
      }
      return result;
    } catch (handlerError) {
      // Log handler error, but don't save session state if handler failed
      log.error("Error executing withAuth handler", {
        operation: "with_auth_handler_error",
        entity: "SESSION",
        userId,
        error:
          handlerError instanceof Error
            ? handlerError.message
            : String(handlerError),
        stack: handlerError instanceof Error ? handlerError.stack : undefined,
      });
      throw handlerError; // Rethrow the handler's specific error
    }
  } catch (error) {
    // Catch errors from getSession or the handler rethrow
    log.error("Error in withAuth execution", {
      operation: "with_auth_error",
      entity: "SESSION",
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Ensure consistent error type is thrown
    if (
      error instanceof Error &&
      error.message.startsWith("Authentication required")
    ) {
      throw error; // Rethrow specific auth error
    } else if (error instanceof Error) {
      // Wrap other errors
      throw new Error(`Authentication failed: ${error.message}`);
    } else {
      throw new Error("Authentication failed: Unknown error");
    }
  }
}

// --- Re-export necessary server functions/classes ---

// From ./config.ts
export { createSessionConfig, defaultSessionConfig } from "./config";

// From ./redis.ts
export { getRedisClient } from "./redis";

// From ./session.ts
export { Session } from "./session";

// From ./middleware.ts
export {
  withRateLimit,
  getRateLimitHeaders,
  withServerActionProtection,
  validateOrigin, // Make sure this is intended to be exported
} from "./middleware";

// From ./rate-limit.ts
export { RateLimiter } from "./rate-limit";

// From ./routes/callback.ts
export { handleAuthCallback } from "./routes/callback";

// From ./server-auth-handler.ts (Corrected path)
export { handlePrivyAuthServer } from "./server-auth-handler";
export { handlePrivyAuthServer as createOrUpdateUser } from "./server-auth-handler";

// Add any other server-specific exports needed by your apps here
