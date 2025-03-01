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
const PUBLIC_PATHS = ["/api/auth", "/terms", "/api/auth/callback", "/blocked"];

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

    // Skip middleware for public assets and specific paths
    const bypassGeoPaths = [
      "/_next",
      "/static",
      "/favicon.ico",
      "/error",
      "/blocked",
    ];
    const skipGeoCheck = bypassGeoPaths.some((path) =>
      pathname.startsWith(path),
    );

    if (skipGeoCheck) {
      return NextResponse.next();
    }

    // Perform geolocation check
    const geo = geolocation(request);

    // Add detailed logging for geolocation debugging
    log.info("Geolocation check starting", {
      entity: "MIDDLEWARE",
      operation: "geo_check_start",
      headers: {
        ...Object.fromEntries(request.headers.entries()),
      },
    });

    log.info("Geolocation result", {
      entity: "MIDDLEWARE",
      operation: "geo_check_result",
      geoData: geo,
      vercelGeoHeaders: {
        country: request.headers.get("x-vercel-ip-country"),
        region: request.headers.get("x-vercel-ip-country-region"),
        city: request.headers.get("x-vercel-ip-city"),
        latitude: request.headers.get("x-vercel-ip-latitude"),
        longitude: request.headers.get("x-vercel-ip-longitude"),
      },
      ip:
        request.headers.get("x-real-ip") ||
        request.headers.get("x-forwarded-for"),
      url: request.url,
    });

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

    // Get country from Vercel headers if geolocation fails
    const country = geo?.country || request.headers.get("x-vercel-ip-country");
    const region =
      geo?.region || request.headers.get("x-vercel-ip-country-region");

    // Check if user's country is in the blocked list
    if (country && blockedCountries.includes(country)) {
      log.info(`Blocking traffic from: ${country}`, {
        entity: "MIDDLEWARE",
        operation: "geo_check_result",
        geoData: { country, region },
      });
      return NextResponse.redirect(new URL("/blocked", request.url));
    }

    // Special handling for Ukraine regions (Crimea, Donetsk, Luhansk)
    if (country === "UA") {
      const restrictedRegions = ["Crimea", "Donetsk", "Luhansk"];
      if (region && restrictedRegions.includes(region)) {
        log.info(
          `Blocking traffic from restricted region: ${region}, Ukraine`,
          {
            entity: "MIDDLEWARE",
            operation: "geo_check_result",
            geoData: { country, region },
          },
        );
        return NextResponse.redirect(new URL("/blocked", request.url));
      }
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
        // For pages, return the current page (ConnectWalletCard will handle the UI)
        return response;
      }

      // Get Redis client and verify session
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
        // This will force a re-authentication
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
