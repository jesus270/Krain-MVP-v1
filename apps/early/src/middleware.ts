import { NextResponse, NextRequest } from "next/server";
import { withServerActionProtection, withRateLimit } from "@krain/session";
import { log } from "@krain/utils";
import { geolocation } from "@vercel/functions";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];

// Function to handle CORS for specific origins
function handleCors(request: NextRequest, response: NextResponse) {
  const origin = request.headers.get("origin");

  // List of allowed origins
  const allowedOrigins = [
    "https://krain.ai",
    "https://www.krain.ai",
    "https://landing.krain.ai",
  ];

  // Allow localhost in development
  if (process.env.NODE_ENV === "development") {
    allowedOrigins.push("http://localhost:3000");
    allowedOrigins.push("http://localhost:3001");
  }

  // Set CORS headers if origin is allowed
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
  }

  return response;
}

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

    // Special handling for navigation from landing page
    const referer = request.headers.get("referer");
    const isNavigationFromLanding =
      referer &&
      (referer.startsWith("https://krain.ai/") ||
        referer.startsWith("http://krain.ai/") ||
        referer.includes("landing.krain.ai") ||
        referer.includes("www.krain.ai"));

    if (isNavigationFromLanding) {
      log.info("Navigation from landing page detected", {
        entity: "MIDDLEWARE",
        operation: "landing_navigation",
        referer,
      });

      // We'll allow this request and skip all further checks for any page request
      // This ensures the initial page load from landing works without CORS issues
      if (!pathname.startsWith("/api/")) {
        // Allow navigation from landing page and add CORS headers
        const response = NextResponse.next();
        return handleCors(request, response);
      }
    }

    // Apply rate limiting and origin validation for API routes
    if (pathname.startsWith("/api/")) {
      const protectionResponse = await withServerActionProtection(
        request,
        "api",
      );
      if (protectionResponse) {
        // Add CORS headers even to error responses
        return handleCors(request, protectionResponse);
      }
    }

    // Check if this is a protected route
    if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
      // Check for user authentication
      const userId = request.cookies.get("user_id")?.value;
      if (!userId) {
        log.info("No user ID cookie for protected path", {
          entity: "MIDDLEWARE",
          operation: "auth_check",
          path: pathname,
        });

        // For API routes, return JSON error
        if (pathname.startsWith("/api/")) {
          return NextResponse.json(
            { error: "Authentication required" },
            { status: 401 },
          );
        }

        // For pages, redirect to home page
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Add protection headers
      const response = NextResponse.next();
      const rateLimit = await withRateLimit(request.headers, "api");
      if (rateLimit) {
        return handleCors(request, rateLimit);
      }
      return handleCors(request, response);
    }

    // Not a protected route, continue with CORS headers
    return handleCors(request, NextResponse.next());
  } catch (error) {
    log.error(error, {
      entity: "MIDDLEWARE",
      operation: "process_request",
      status: "error",
    });

    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );

    return handleCors(request, errorResponse);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
