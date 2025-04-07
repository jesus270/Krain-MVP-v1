import { Redis } from "@upstash/redis";
import { Session } from "./session";
import { SessionOptions, User } from "./types";
import { getRedisClient } from "./redis";
import { defaultSessionConfig } from "./config";
import { log } from "@krain/utils";

export async function getSession(userId: string): Promise<Session | null> {
  if (!userId) return null;

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
        await session.save();
        return session;
      }
    }
    return null;
  } catch (error) {
    log.error("Error getting session", {
      operation: "get_session",
      entity: "SESSION",
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Return null on error - will trigger fallback mechanisms
    return null;
  }
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
    const redisClient = await getRedisClient();
    const session = await Session.create({
      userId: user.id,
      data: {
        user,
        isLoggedIn: true,
      },
      redis: redisClient,
      options: defaultSessionConfig,
    });
    await session.save();
  } catch (error) {
    log.error("Error setting user session", {
      operation: "set_user_session",
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
  try {
    const session = await getSession(userId);

    if (!session) {
      // Try to create a minimal session if one doesn't exist
      try {
        const redisClient = await getRedisClient();
        const newSession = await Session.create({
          userId: userId,
          data: {
            user: {
              id: userId,
              createdAt: new Date(),
              role: "user",
            },
            isLoggedIn: true,
          },
          redis: redisClient,
          options: defaultSessionConfig,
        });

        return await handler(newSession);
      } catch (sessionError) {
        log.error("Error creating minimal session", {
          operation: "with_auth_create_session",
          entity: "SESSION",
          userId,
          error:
            sessionError instanceof Error
              ? sessionError.message
              : String(sessionError),
          stack: sessionError instanceof Error ? sessionError.stack : undefined,
        });
        throw new Error("Authentication required");
      }
    }

    // If session exists but isLoggedIn is not set, set it
    if (!session.get("isLoggedIn")) {
      session.set("isLoggedIn", true);
      await session.save();
    }

    try {
      const result = await handler(session);
      await session.save();
      return result;
    } catch (handlerError) {
      // Still try to save session even if handler fails
      try {
        await session.save();
      } catch (saveError) {
        log.error("Error saving session after handler failure", {
          operation: "with_auth_save_after_error",
          entity: "SESSION",
          userId,
          error:
            saveError instanceof Error ? saveError.message : String(saveError),
        });
      }
      throw handlerError;
    }
  } catch (error) {
    log.error("Error in withAuth", {
      operation: "with_auth",
      entity: "SESSION",
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
}
