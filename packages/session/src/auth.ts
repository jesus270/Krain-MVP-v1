import { Session } from "./session";
import { SessionOptions, User } from "./types";
import { getSession as getRedisSession } from "./next";
import { log } from "@krain/utils";
import { getRedisClient } from "./redis";

export async function getSession(
  options: SessionOptions,
  userId?: string,
): Promise<Session | null> {
  return getRedisSession(await getRedisClient(), options, userId);
}

export async function getCurrentUser(
  options: SessionOptions,
  userId?: string,
): Promise<User | null> {
  const session = await getSession(options, userId);
  return session?.get("user") || null;
}

export async function setUserSession(
  options: SessionOptions,
  user: User,
  request: Request,
): Promise<void> {
  const session = await Session.create({
    userId: user.id,
    data: {
      user,
      isLoggedIn: true,
    },
    redis: await getRedisClient(),
    options,
  });

  // Check login attempts
  const canLogin = await session.checkLoginAttempts();
  if (!canLogin) {
    throw new Error("Too many login attempts. Please try again later.");
  }

  // Set session data
  session.set("user", user);
  session.set("isLoggedIn", true);
  session.generateCsrfToken();
  session.setFingerprint(
    request.headers.get("user-agent") || "unknown",
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
  );

  session.resetLoginAttempts();
  await session.save();
}

export async function clearUserSession(
  options: SessionOptions,
  userId: string,
): Promise<void> {
  const session = await getSession(options, userId);
  if (session) {
    log.info("Clearing user session", {
      operation: "clear_session",
      entity: "AUTH",
      userId: session.get("user")?.id,
    });
    await session.destroy();
  }
}

export function verifyCsrfToken(session: Session, token: string): boolean {
  return session.verifyCsrfToken(token);
}

export function verifyFingerprint(session: Session, request: Request): boolean {
  return session.verifyFingerprint(
    request.headers.get("user-agent") || "unknown",
    request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
  );
}
