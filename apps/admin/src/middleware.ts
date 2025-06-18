import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { geolocation } from "@vercel/functions";
import { log } from "@krain/utils";
import {
  getSession,
} from "@krain/session/server";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];

// Public paths that don't require authentication
const PUBLIC_PATHS = ["/api/auth", "/terms", "/api/auth/callback", "/blocked"];

// Special auth endpoints that require userid in the header instead of cookie
const HEADER_AUTH_PATHS = ["/api/user"];

// Admin-only paths
const ADMIN_ONLY_PATHS = ["/api/admin", "/admin", "/"];

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

    const blockedCountries = ["US", "KP", "IR", "SY", "CU", "RU", "BY"];
    const country = geo?.country || request.headers.get("x-vercel-ip-country");
    const region = geo?.region || request.headers.get("x-vercel-ip-country-region");

    if (country && blockedCountries.includes(country)) {
      log.info(`Blocking traffic from: ${country}`, {
        entity: "MIDDLEWARE",
        operation: "geo_check_result",
        geoData: { country, region },
      });
      return NextResponse.redirect(new URL("/blocked", request.url));
    }

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

    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Header-based auth
    if (HEADER_AUTH_PATHS.some((path) => pathname.startsWith(path))) {
      const userIdHeader =
        request.headers.get("x-user-id") || request.headers.get("X-User-Id");

      if (!userIdHeader) {
        return NextResponse.json(
          { error: "User ID required in header" },
          { status: 400 },
        );
      }

      response.headers.set("x-user-id", userIdHeader);
      return response;
    }

    // Public paths
    if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
      return response;
    }

    // Check if protected
    const isProtectedPath = PROTECTED_PATHS.some((path) => {
      if (path === "/") {
        return pathname === "/" || pathname === "";
      }
      return pathname.startsWith(path);
    });

    log.info("debug log", {
      operation: "debug_log",
      isProtectedPath,
    })



    if (isProtectedPath) {
      const userId = request.cookies.get("user_id")?.value;

      if (!userId) {
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }
        return response;
      }

      const session = await getSession(userId);

      if (!session?.get("isLoggedIn")) {
        log.info("Session not logged in or invalid", {
          entity: "MIDDLEWARE",
          operation: "auth_check",
          userId,
          path: pathname,
        });

        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }

        const redirectResponse = NextResponse.redirect(new URL("/", request.url));
        redirectResponse.cookies.delete("user_id");
        return redirectResponse;
      }

      // ✅ Admin role check
      const userRole = session.get("role");
      log.info("userRole", { 
        operation: "authz_check",
        userRole 
      });
    
      const isAdminPath = ADMIN_ONLY_PATHS.some((path) =>
        pathname.startsWith(path),
      );

      if (isAdminPath && userRole !== "admin") {
        log.info("Unauthorized access attempt to admin route", {
          entity: "MIDDLEWARE",
          operation: "authz_check",
          userId,
          role: userRole,
          path: pathname,
        });

        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Admin access required" },
            { status: 403 },
          );
        }

        return NextResponse.redirect(new URL("/", request.url));
      }

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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
