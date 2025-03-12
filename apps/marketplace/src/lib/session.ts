import { createSessionConfig } from "@krain/session";
import { SESSION_SECRET } from "./constants";

// Export the createSessionConfig function for direct usage
export function getSessionConfig() {
  return createSessionConfig(SESSION_SECRET);
}
