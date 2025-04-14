// Type re-exports (safe for server/client)
export type {
  SessionOptions,
  User,
  SessionData,
  Session as SessionType,
} from "./types";
export type { Redis } from "@upstash/redis";

// Core session management
export { Session } from "./session";
export type { User as SessionUser } from "./types"; // Corrected: Use export type
export {
  getSession,
  getCurrentUser,
  setUserSession,
  clearUserSession,
} from "./server";

// Client-side hook
export { useSession } from "./use-session";

// Client-side Auth handler (needed by @krain/ui)
// Assuming handlePrivyAuth is defined in ./auth-handler.ts
export { handlePrivyAuth } from "./auth-handler";

// Rate limiting utilities (optional export)
export { RateLimiter } from "./rate-limit";

// Middleware helpers
export {
  validateOrigin,
  withServerActionProtection,
  withRateLimit,
  getRateLimitHeaders, // Correctly export from here
} from "./middleware";

// DO NOT export any server functions/classes/configs from here.
