import { SessionOptions } from "./types";

export const createSessionConfig = (secret?: string): SessionOptions => {
  // Check if we're on the client side
  if (typeof window !== "undefined") {
    // Return a safe placeholder for client side
    return {
      password: "client-side-placeholder",
    };
  }

  // Server-side code
  return {
    password:
      secret ||
      process.env.SESSION_SECRET ||
      (process.env.NODE_ENV === "development"
        ? "complex_password_at_least_32_characters_long_dev_only"
        : (() => {
            throw new Error("SESSION_SECRET must be set in production");
          })()),
  };
};

export const defaultSessionConfig = createSessionConfig();
