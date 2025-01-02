// Core types and utilities
export type { SessionOptions, User, Session as SessionType } from "./types";
export {
  getSession,
  getCurrentUser,
  setUserSession,
  clearUserSession,
  withAuth,
} from "./server";
export { createSessionConfig, defaultSessionConfig } from "./config";

// Redis utilities
export { getRedisClient } from "./redis";
export type { Redis } from "@upstash/redis";

// Core session class
export { Session } from "./session";

// Protection middleware
export {
  withRateLimit,
  getRateLimitHeaders,
  withServerActionProtection,
  validateOrigin,
} from "./middleware";

// Rate limiting
export { RateLimiter } from "./rate-limit";

// Callback handler
export { handleAuthCallback } from "./routes/callback";
