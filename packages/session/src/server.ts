import { Redis } from "@upstash/redis";
import { Session } from "./session";
import { SessionOptions, User } from "./types";
import { getRedisClient } from "./redis";
import { defaultSessionConfig } from "./config";

export async function getSession(userId: string): Promise<Session | null> {
  if (!userId) return null;
  const redisClient = await getRedisClient();
  const session = await Session.get(userId, redisClient, defaultSessionConfig);
  if (session) {
    const isActive = await session.checkActivity();
    if (isActive) {
      return session;
    }
  }
  return null;
}

export async function getCurrentUser(userId: string): Promise<User | null> {
  const session = await getSession(userId);
  return session?.get("user") || null;
}

export async function setUserSession(user: User): Promise<void> {
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
}

export async function clearUserSession(userId: string): Promise<void> {
  const session = await getSession(userId);
  if (session) {
    await session.destroy();
  }
}

// Helper for server actions to validate auth
export async function withAuth<T>(
  userId: string,
  handler: (session: Session) => Promise<T>,
): Promise<T> {
  const session = await getSession(userId);
  if (!session?.get("isLoggedIn")) {
    throw new Error("Authentication required");
  }
  try {
    return await handler(session);
  } finally {
    await session.save();
  }
}
