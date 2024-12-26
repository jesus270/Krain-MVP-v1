import { NextResponse, NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./lib/auth";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { IronSessionCookieStore } from "./lib/cookie-store";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/api/auth",
  "/_next",
  "/static",
  "/favicon.ico",
  "/blocked",
  "/terms",
];

// Add rate limiting configuration
const rateLimit = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: "Too many requests, please try again later." },
  keyGenerator: (req: NextRequest) =>
    req.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous",
};

// Rate limit tracking (in-memory for now - should use Redis in production)
const ipRequests = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest) {
  try {
    // Rate limiting check
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "anonymous";
    const now = Date.now();
    const requestData = ipRequests.get(ip) || {
      count: 0,
      resetTime: now + rateLimit.windowMs,
    };

    if (now > requestData.resetTime) {
      // Reset if window has passed
      requestData.count = 1;
      requestData.resetTime = now + rateLimit.windowMs;
    } else if (requestData.count >= rateLimit.max) {
      return NextResponse.json(rateLimit.message, { status: 429 });
    } else {
      requestData.count++;
    }
    ipRequests.set(ip, requestData);

    const geo = geolocation(request);

    if (!geo?.country) {
      console.warn("No geolocation data available");
    }

    // Skip middleware for public paths
    const isPublicPath = PUBLIC_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );
    if (isPublicPath) {
      return NextResponse.next();
    }

    // List of blocked countries (using ISO country codes)
    const blockedCountries = [
      "US", // United States
      "KP", // North Korea
      "IR", // Iran
      "SY", // Syria
      "CU", // Cuba
      "RU", // Russia
      "BY", // Belarus
    ];

    // Check if user's country is in the blocked list
    if (geo?.country && blockedCountries.includes(geo.country)) {
      console.info(`Blocking traffic from: ${geo.country}`);
      return NextResponse.redirect(new URL("/blocked", request.url));
    }

    // Special handling for Ukraine regions (Crimea, Donetsk, Luhansk)
    if (geo?.country === "UA") {
      const restrictedRegions = ["Crimea", "Donetsk", "Luhansk"];
      if (geo.region && restrictedRegions.includes(geo.region)) {
        console.info(
          `Blocking traffic from restricted region: ${geo.region}, Ukraine`,
        );
        return NextResponse.redirect(new URL("/blocked", request.url));
      }
    }

    // Check if this is a protected route
    const isProtectedPath = PROTECTED_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );

    // Only check authentication for protected paths
    if (isProtectedPath) {
      const cookieStore = new IronSessionCookieStore(
        request.cookies as unknown as ReadonlyRequestCookies,
      );
      const session = await getIronSession<SessionData>(
        cookieStore,
        sessionOptions,
      );

      // Check if session exists and is valid
      if (!session.isLoggedIn || !session.user) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Add session cookie headers to response
      const response = NextResponse.next();
      const cookieHeaders = cookieStore.getCookieHeaders();
      for (const header of cookieHeaders) {
        response.headers.append("Set-Cookie", header);
      }
      return response;
    }

    console.info("Allowing traffic from:", geo?.country);
    return NextResponse.next();
  } catch (error) {
    console.error("[SERVER] Middleware error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
