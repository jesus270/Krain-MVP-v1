import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { IronSessionCookieStore } from "./cookie-store";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

// Simple user type with required fields
export type User = {
  id: string;
  walletAddress: string;
};

// Define session data structure
export interface SessionData {
  user?: User;
  isLoggedIn: boolean;
  csrfToken?: string;
  fingerprint?: {
    userAgent: string;
    ip: string;
  };
  lastActivity?: number;
  loginAttempts?: number;
}

// Extend iron-session types
declare module "iron-session" {
  interface IronSessionData extends SessionData {}
}

// Session configuration
export const sessionOptions = {
  password:
    process.env.SESSION_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "complex_password_at_least_32_characters_long_dev_only"
      : (() => {
          throw new Error("SESSION_SECRET must be set in production");
        })()),
  cookieName: "user-session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 4 * 60 * 60, // 4 hours
    // In development, domain is undefined to work with localhost
    domain: undefined,
  },
};

// Helper to determine cookie domain based on host
export function getCookieDomain(host: string): string | undefined {
  if (process.env.NODE_ENV !== "production") {
    return undefined;
  }

  if (host.endsWith(".krain.ai")) {
    return ".krain.ai";
  }

  // For Vercel preview deployments, use the exact domain
  if (host.endsWith(".vercel.app")) {
    return host; // Return the full domain instead of just .vercel.app
  }

  return undefined;
}

// Constants for security
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
const SESSION_ACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

// Handle failed login attempts
export async function handleFailedLoginAttempt(
  cookieStore?: ReadonlyRequestCookies,
): Promise<void> {
  const session = await getSession(cookieStore);
  session.loginAttempts = (session.loginAttempts || 0) + 1;
  session.lastActivity = Date.now();
  await session.save();

  if (session.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    throw new Error("Too many login attempts. Please try again later.");
  }
}

// Get the current session with additional security checks
export async function getSession(cookieStore?: ReadonlyRequestCookies) {
  const store = new IronSessionCookieStore(cookieStore || (await cookies()));
  const session = await getIronSession<SessionData>(store, sessionOptions);

  // Check session activity timeout
  if (
    session.lastActivity &&
    Date.now() - session.lastActivity > SESSION_ACTIVITY_TIMEOUT
  ) {
    await session.destroy();
    throw new Error("Session expired due to inactivity");
  }

  // Update last activity
  session.lastActivity = Date.now();
  await session.save();

  return session;
}

// Get the current user
export async function getCurrentUser(
  cookieStore?: ReadonlyRequestCookies,
): Promise<User | null> {
  const session = await getSession(cookieStore);
  return session.user || null;
}

// Enhanced set user session with security features
export async function setUserSession(
  user: User,
  request: Request,
  cookieStore?: ReadonlyRequestCookies,
): Promise<void> {
  const session = await getSession(cookieStore);

  // Check login attempts
  if (session.loginAttempts && session.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
    const lastAttempt = session.lastActivity || 0;
    if (Date.now() - lastAttempt < LOGIN_BLOCK_DURATION) {
      throw new Error("Too many login attempts. Please try again later.");
    }
  }

  // Set session data
  session.user = user;
  session.isLoggedIn = true;
  session.csrfToken = crypto.randomUUID();
  session.fingerprint = {
    userAgent: request.headers.get("user-agent") || "unknown",
    ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
  };
  session.lastActivity = Date.now();
  session.loginAttempts = 0; // Reset login attempts on successful login

  await session.save();
}

// Verify CSRF token
export function verifyCsrfToken(session: SessionData, token: string): boolean {
  return session.csrfToken === token;
}

// Verify session fingerprint
export function verifyFingerprint(
  session: SessionData,
  request: Request,
): boolean {
  if (!session.fingerprint) return false;

  const currentFingerprint = {
    userAgent: request.headers.get("user-agent") || "unknown",
    ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
  };

  return (
    session.fingerprint.userAgent === currentFingerprint.userAgent &&
    session.fingerprint.ip === currentFingerprint.ip
  );
}

// Clear user session
export async function clearUserSession(
  cookieStore?: ReadonlyRequestCookies,
): Promise<void> {
  const session = await getSession(cookieStore);
  session.destroy();
}

// Add session rotation logic
export async function rotateSession(cookieStore?: ReadonlyRequestCookies) {
  const session = await getSession(cookieStore);
  if (session.user) {
    const newSession = { ...session };
    await session.destroy();
    await newSession.save();
  }
}
