import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@krain/session";
import { log } from "@krain/utils";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/user", "/api/tokens"];

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/api/auth", "/", "/about", "/api/auth/callback"];

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
    // Create a response that can be modified
    const response = NextResponse.next();
    const pathname = request.nextUrl.pathname;

    // Add security headers to all responses
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Check if the path is public
    const isPublicPath = PUBLIC_PATHS.some(
      (path) => pathname.startsWith(path) || pathname === path,
    );
    if (isPublicPath) {
      return response;
    }

    // Check if the path is protected
    const isProtectedPath = PROTECTED_PATHS.some(
      (path) => pathname.startsWith(path) || pathname === path,
    );

    if (isProtectedPath) {
      const userId =
        request.cookies.get("user_id")?.value ||
        request.headers.get("x-user-id");
      if (!userId) {
        // For API routes, return JSON error
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }
        // For pages, redirect to the homepage
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Get session and verify
      const session = await getSession(userId);

      if (!session?.get("isLoggedIn")) {
        log.info("Session not logged in or invalid", {
          entity: "MIDDLEWARE",
          operation: "auth_check",
          userId,
          path: pathname,
        });

        // For API routes, return JSON error
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }

        // For pages, clear the invalid cookie and return to home page
        const redirectResponse = NextResponse.redirect(
          new URL("/", request.url),
        );
        redirectResponse.cookies.delete("user_id");
        return redirectResponse;
      }

      // Add user ID to headers for downstream use
      response.headers.set("x-user-id", userId);
    }

    return response;
  } catch (error) {
    log.error("Error in middleware", {
      entity: "MIDDLEWARE",
      operation: "process_request",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      path: request.nextUrl.pathname,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
