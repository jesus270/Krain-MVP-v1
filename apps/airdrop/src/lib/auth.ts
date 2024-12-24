import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { LRUCache } from "lru-cache";
import { SessionOptions } from "iron-session";

// Cache for rate limiting
const rateLimitCache = new LRUCache<string, number[]>({
  max: 500,
  ttl: 60000, // 1 minute
});

// Cache for IP-based rate limiting
const ipRateLimitCache = new LRUCache<string, number[]>({
  max: 1000,
  ttl: 60000, // 1 minute
});

// Cache for user sessions
const userSessionCache = new LRUCache<string, PrivyUser>({
  max: 100,
  ttl: 300000, // 5 minutes
});

export type PrivyUser = {
  id: string;
  wallet: {
    address: string;
  };
};

export interface PrivySession {
  user?: PrivyUser;
  id: string;
}

const sessionOptions: SessionOptions = {
  cookieName: "privy_session",
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 7200, // 2 hours
    domain:
      process.env.NODE_ENV === "production"
        ? process.env.NEXT_PUBLIC_APP_DOMAIN
        : "localhost",
  },
};

// Rate limiting function
function checkRateLimit(key: string, ip?: string): boolean {
  const now = Date.now();
  const requests = rateLimitCache.get(key) || [];
  const ipRequests = ip ? ipRateLimitCache.get(ip) || [] : [];
  const windowMs = 60000; // 1 minute window

  // Remove old requests
  const recentRequests = requests.filter((time) => now - time < windowMs);
  const recentIpRequests = ipRequests.filter((time) => now - time < windowMs);

  // Check if under session limit (50 requests per minute)
  if (recentRequests.length >= 50) {
    console.error("[SERVER] Session rate limit exceeded:", key);
    return false;
  }

  // Check if under IP limit (100 requests per minute)
  if (ip && recentIpRequests.length >= 100) {
    console.error("[SERVER] IP rate limit exceeded:", ip);
    return false;
  }

  // Add current request
  recentRequests.push(now);
  rateLimitCache.set(key, recentRequests);

  if (ip) {
    recentIpRequests.push(now);
    ipRateLimitCache.set(ip, recentIpRequests);
  }

  return true;
}

function generateSessionId(): string {
  return Math.random().toString(36).substring(2);
}

async function getSession() {
  const cookieStore = await cookies();
  // @ts-ignore - Next.js cookies() is compatible with iron-session
  return getIronSession<PrivySession>(cookieStore, sessionOptions);
}

export async function getPrivyUser(): Promise<PrivyUser | null> {
  try {
    const cookieStore = cookies();
    const session = await getSession();

    // Ensure we have a session ID
    if (!session.id) {
      session.id = generateSessionId();
      await session.save();
    }

    console.log("[SERVER] Session state:", {
      id: session.id,
      hasUser: !!session.user,
      cookies: Object.fromEntries(
        Object.entries(cookieStore).filter(
          ([key]) => key !== "get" && key !== "has",
        ),
      ),
    });

    // Check cache first with validation
    const cachedUser = userSessionCache.get(session.id);
    if (cachedUser) {
      if (cachedUser.id && cachedUser.wallet?.address) {
        console.log("[SERVER] Using cached user data:", {
          userId: cachedUser.id,
          walletAddress: cachedUser.wallet.address,
          sessionId: session.id,
        });
        return cachedUser;
      } else {
        console.log("[SERVER] Invalid cached user data, clearing cache");
        userSessionCache.delete(session.id);
      }
    }

    // Check rate limit
    if (!checkRateLimit(session.id)) {
      console.error("[SERVER] Rate limit exceeded for session:", session.id);
      throw new Error("Too many requests. Please try again later.");
    }

    // Get user from session with validation
    if (!session.user) {
      console.log("[SERVER] No user in session:", {
        sessionId: session.id,
        cookies: Object.fromEntries(
          Object.entries(cookieStore).filter(
            ([key]) => key !== "get" && key !== "has",
          ),
        ),
      });
      return null;
    }

    // Validate user data thoroughly
    if (!session.user.id || !session.user.wallet?.address) {
      console.error("[SERVER] Invalid user data in session:", {
        sessionId: session.id,
        user: session.user,
      });
      await session.destroy();
      return null;
    }

    // Cache the validated user data
    console.log("[SERVER] Setting user in cache:", {
      userId: session.user.id,
      walletAddress: session.user.wallet.address,
      sessionId: session.id,
    });

    userSessionCache.set(session.id, session.user);
    return session.user;
  } catch (error) {
    console.error("[SERVER] Error getting Privy user:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      cookies: Object.fromEntries(
        Object.entries(cookies()).filter(
          ([key]) => key !== "get" && key !== "has",
        ),
      ),
    });
    return null;
  }
}

export async function setPrivyUser(user: PrivyUser): Promise<void> {
  try {
    // Validate user data thoroughly
    if (!user.id || !user.wallet?.address) {
      throw new Error("Invalid user data");
    }

    const session = await getSession();
    const cookieStore = cookies();

    // Ensure we have a session ID
    if (!session.id) {
      session.id = generateSessionId();
    }

    // Set user in session
    session.user = user;

    // Update cache with validated data
    userSessionCache.set(session.id, user);

    console.log("[SERVER] Setting user session:", {
      userId: user.id,
      walletAddress: user.wallet.address,
      sessionId: session.id,
      cookies: Object.fromEntries(
        Object.entries(cookieStore).filter(
          ([key]) => key !== "get" && key !== "has",
        ),
      ),
    });

    // Save session
    await session.save();
    console.log("[SERVER] User session saved successfully");
  } catch (error) {
    console.error("[SERVER] Error setting Privy user:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      cookies: Object.fromEntries(
        Object.entries(cookies()).filter(
          ([key]) => key !== "get" && key !== "has",
        ),
      ),
    });
    throw error;
  }
}

export async function clearPrivyUser(): Promise<void> {
  try {
    const session = await getSession();
    const cookieStore = cookies();

    if (session.id) {
      // Clear cache
      userSessionCache.delete(session.id);
    }

    console.log("[SERVER] Clearing user session:", {
      sessionId: session.id,
      cookies: Object.fromEntries(
        Object.entries(cookieStore).filter(
          ([key]) => key !== "get" && key !== "has",
        ),
      ),
    });

    await session.destroy();

    console.log("[SERVER] User session cleared successfully");
  } catch (error) {
    console.error("[SERVER] Error clearing Privy user:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      cookies: Object.fromEntries(
        Object.entries(cookies()).filter(
          ([key]) => key !== "get" && key !== "has",
        ),
      ),
    });
    throw error;
  }
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
