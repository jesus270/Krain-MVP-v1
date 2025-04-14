import { createSessionConfig } from "@krain/session/server";
import type { SessionOptions } from "@krain/session";
import { SESSION_SECRET } from "./constants";

// Export the createSessionConfig function for direct usage
export function getSessionConfig(): SessionOptions {
  return createSessionConfig(SESSION_SECRET);
}
