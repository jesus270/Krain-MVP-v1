import { Redis } from "@upstash/redis";
import { Session } from "./session";
import { SessionOptions, User } from "./types";
import { getRedisClient } from "./redis";

export async function getSession(
  redis: Redis,
  options: SessionOptions,
  userId?: string,
): Promise<Session | null> {
  if (!userId) return null;
  const session = await Session.get(userId, redis, options);
  if (session) {
    const isActive = await session.checkActivity();
    if (isActive) {
      return session;
    }
  }
  return null;
}

export async function getCurrentUser(
  redis: Redis,
  options: SessionOptions,
  userId?: string,
): Promise<User | null> {
  const session = await getSession(redis, options, userId);
  return session?.get("user") || null;
}

export async function setUserSession(
  redis: Redis,
  options: SessionOptions,
  user: User,
): Promise<void> {
  const session = await Session.create(user.id, redis, options);
  session.set("user", user);
  session.set("isLoggedIn", true);
  await session.save();
}

export async function clearUserSession(
  redis: Redis,
  options: SessionOptions,
  userId: string,
): Promise<void> {
  const session = await Session.get(userId, redis, options);
  if (session) {
    await session.destroy();
  }
}

// Helper for server actions to validate auth
export async function withAuth<T>(
  redis: Redis,
  options: SessionOptions,
  userId: string,
  handler: (session: Session) => Promise<T>,
): Promise<T> {
  const session = await getSession(redis, options, userId);
  if (!session?.get("isLoggedIn")) {
    throw new Error("Authentication required");
  }
  try {
    return await handler(session);
  } finally {
    await session.save();
  }
}
