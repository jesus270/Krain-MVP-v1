import { createSessionConfig } from "@krain/session";

// Create session config with a fallback for production
const sessionSecret =
  process.env.SESSION_SECRET || "marketplace-production-secret";
// This will be used by any components that need the session config
export const sessionConfig = createSessionConfig(sessionSecret);
