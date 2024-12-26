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
    maxAge: 24 * 60 * 60, // 24 hours
  },
};

// Get the current session
export async function getSession(cookieStore?: ReadonlyRequestCookies) {
  const store = new IronSessionCookieStore(cookieStore || (await cookies()));
  return getIronSession<SessionData>(store, sessionOptions);
}

// Get the current user
export async function getCurrentUser(
  cookieStore?: ReadonlyRequestCookies,
): Promise<User | null> {
  const session = await getSession(cookieStore);
  return session.user || null;
}

// Set user session
export async function setUserSession(
  user: User,
  cookieStore?: ReadonlyRequestCookies,
): Promise<void> {
  const session = await getSession(cookieStore);
  session.user = user;
  session.isLoggedIn = true;
  await session.save();
}

// Clear user session
export async function clearUserSession(
  cookieStore?: ReadonlyRequestCookies,
): Promise<void> {
  const session = await getSession(cookieStore);
  session.destroy();
}
