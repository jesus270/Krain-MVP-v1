import { Redis } from "@upstash/redis";
import { headers } from "next/headers";
import { Session } from "./session";
import { SessionOptions } from "./types";
import { getRedisClient } from "./redis";

export async function getSession(
  redis: Redis,
  options: SessionOptions,
  userId?: string,
): Promise<Session | null> {
  if (!userId) return null;
  return Session.get(userId, redis, options);
}

export function getClientIp(headers: Headers): string {
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0] ?? "unknown";
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return "unknown";
}

export async function validateCsrf(userId: string, options: SessionOptions) {
  const headersList = await headers();
  const csrfToken = headersList.get("x-csrf-token");
  const userAgent = headersList.get("user-agent") || "unknown";
  const clientIp = getClientIp(headersList);

  if (!csrfToken) {
    throw new Error("CSRF token is required");
  }

  const session = await getSession(await getRedisClient(), options, userId);
  if (!session) {
    throw new Error("No valid session found");
  }

  // Verify CSRF token
  const storedToken = session.get("csrfToken");
  if (!storedToken || storedToken !== csrfToken) {
    throw new Error("Invalid CSRF token");
  }

  // Verify fingerprint for additional security
  if (!session.verifyFingerprint(userAgent, clientIp)) {
    throw new Error("Invalid session fingerprint");
  }

  return session;
}
