import { SessionOptions } from "./types";

export const createSessionConfig = (secret?: string): SessionOptions => {
  // Check if we're on the client side
  if (typeof window !== "undefined") {
    // Return a safe placeholder for client side
    return {
      secret: "client-side-placeholder",
    };
  }

  const sessionSecret =
    secret ||
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "complex_password_at_least_32_characters_long_dev_only"
      : (() => {
          throw new Error("SESSION_SECRET must be set in production");
        })());

  // Server-side configuration
  return {
    secret: sessionSecret,
    name: "session",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    cookiePath: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    httpOnly: true,
  };
};

export const defaultSessionConfig = createSessionConfig();
