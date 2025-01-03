import { NextResponse, NextRequest } from "next/server";
import { withServerActionProtection, withRateLimit } from "@krain/session";
import { log } from "@krain/utils";
import { geolocation } from "@vercel/functions";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // Skip middleware for public assets
    if (pathname.startsWith("/_next") || pathname.includes(".")) {
      return NextResponse.next();
    }

    // Skip geolocation check if already on blocked page
    if (pathname === "/blocked") {
      return NextResponse.next();
    }

    // Perform geolocation check
    const geo = geolocation(request);

    // List of blocked countries (using ISO country codes)
    const blockedCountries = [
      "KP", // North Korea
      "IR", // Iran
      "SY", // Syria
      "CU", // Cuba
      "RU", // Russia
      "BY", // Belarus
    ];

    // Check if user's country is in the blocked list
    if (geo?.country && blockedCountries.includes(geo.country)) {
      log.info(`Blocking traffic from: ${geo.country}`, {
        entity: "MIDDLEWARE",
        operation: "geo_check_result",
        geoData: geo,
      });
      return NextResponse.redirect(new URL("/blocked", request.url));
    }

    // Special handling for Ukraine regions (Crimea, Donetsk, Luhansk)
    if (geo?.country === "UA") {
      const restrictedRegions = ["Crimea", "Donetsk", "Luhansk"];
      if (geo.region && restrictedRegions.includes(geo.region)) {
        log.info(
          `Blocking traffic from restricted region: ${geo.region}, Ukraine`,
          {
            entity: "MIDDLEWARE",
            operation: "geo_check_result",
            geoData: geo,
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
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
