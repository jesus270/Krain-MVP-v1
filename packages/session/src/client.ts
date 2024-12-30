import { Redis } from "@upstash/redis";
import { Session } from "./session";
import { SessionOptions } from "./types";

export async function getSession(
  redis: Redis,
  options: SessionOptions,
  userId: string,
): Promise<Session | null> {
  return Session.get(userId, redis, options);
}

export { Session, type SessionOptions };
