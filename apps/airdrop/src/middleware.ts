import { NextResponse, NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./lib/auth";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { IronSessionCookieStore } from "./lib/cookie-store";
import { getClientIp, checkRateLimit } from "./lib/redis";

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
  "/error",
];

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for public paths - this check needs to be first
    const isPublicPath = PUBLIC_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Rate limiting check
    const clientIp = getClientIp(request.headers);
    const rateLimit = await checkRateLimit(clientIp);

    // Create base response
    const response = NextResponse.next();

    // Add rate limit headers
    response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimit.reset));

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many requests, please try again later." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.reset),
            "Retry-After": String(
              Math.ceil((rateLimit.reset - Date.now()) / 1000),
            ),
          },
        },
      );
    }

    const geo = geolocation(request);

    if (!geo?.country) {
      console.warn("No geolocation data available");
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
      const cookieHeaders = cookieStore.getCookieHeaders();
      for (const header of cookieHeaders) {
        response.headers.append("Set-Cookie", header);
      }
      return response;
    }

    if (process.env.NODE_ENV === "development") {
      console.info("[MIDDLEWARE] Traffic allowed", {
        operation: "geo_check",
        country: geo?.country,
        status: "success",
      });
    }
    return response;
  } catch (error) {
    console.error("[MIDDLEWARE] Request failed", {
      operation: "middleware",
      status: "error",
      path: request.nextUrl.pathname,
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
