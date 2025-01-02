import { NextResponse, NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { defaultSessionConfig } from "@krain/session";
import { log } from "@krain/utils";
import {
  Session,
  getSession,
  RateLimiter,
  getRedisClient,
} from "@krain/session";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/wallet", "/api/referral", "/"];

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/api/auth", "/terms", "/login", "/api/auth/callback"];

// Security headers
const securityHeaders = {
  "X-DNS-Prefetch-Control": "on",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
};

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // Skip middleware for public assets
    if (pathname.startsWith("/_next") || pathname.includes(".")) {
      return NextResponse.next();
    }

    // Apply security headers
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Allow public paths without authentication
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return response;
    }

    // Check if path requires authentication
    const isProtectedPath = PROTECTED_PATHS.some((path) => {
      if (path === "/") {
        return pathname === "/" || pathname === "";
      }
      return pathname.startsWith(path);
    });

    if (isProtectedPath) {
      const userId = request.cookies.get("user_id")?.value;
      if (!userId) {
        // For API routes, return JSON error
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }
        // For pages, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Get Redis client and verify session
      const session = await getSession(userId);

      if (!session?.get("isLoggedIn")) {
        // For API routes, return JSON error
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }
        // For pages, redirect to login
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("returnTo", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Add user ID to headers for downstream use
      response.headers.set("x-user-id", userId);
    }

    return response;
  } catch (error) {
    log.error(error, {
      entity: "MIDDLEWARE",
      operation: "process_request",
      status: "error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
