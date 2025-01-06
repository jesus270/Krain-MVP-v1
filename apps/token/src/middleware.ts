import { NextResponse, NextRequest } from "next/server";
import { withServerActionProtection, withRateLimit } from "@krain/session";
import { log } from "@krain/utils";
import { geolocation } from "@vercel/functions";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];

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

    // Apply rate limiting and origin validation
    const protectionResponse = await withServerActionProtection(request, "api");
    if (protectionResponse) return protectionResponse;

    // Check if this is a protected route
    if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
      // Add protection headers
      const response = NextResponse.next();
      const rateLimit = await withRateLimit(request.headers, "api");
      if (rateLimit) {
        return rateLimit;
      }
      return response;
    }

    // Not a protected route, continue
    return NextResponse.next();
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
