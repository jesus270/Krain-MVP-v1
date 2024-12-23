import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export type PrivyUser = {
  id: string;
  wallet: {
    address: string;
  };
};

const sessionOptions = {
  cookieName: "privy_session",
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  },
};

export async function getPrivyUser(): Promise<PrivyUser | null> {
  const session = await getIronSession(cookies(), sessionOptions);
  return session.user || null;
}

export async function setPrivyUser(user: PrivyUser): Promise<void> {
  const session = await getIronSession(cookies(), sessionOptions);
  session.user = user;
  await session.save();
}

export async function clearPrivyUser(): Promise<void> {
  const session = await getIronSession(cookies(), sessionOptions);
  session.destroy();
}

export function validateOrigin(
  origin: string | null,
  host: string | null,
): boolean {
  if (!origin || !host) return false;

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost",
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);

  const originHost = new URL(origin).host;
  return allowedOrigins.includes(origin) && originHost === host;
}
