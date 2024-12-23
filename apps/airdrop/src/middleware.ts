import { NextResponse, NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { getPrivyUser } from "./lib/auth";

export async function middleware(request: NextRequest) {
  try {
    // Check if this is a server action request
    if (
      request.method === "POST" &&
      request.headers.get("content-type")?.includes("application/json")
    ) {
      const user = await getPrivyUser();
      if (!user) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized: Please log in first" }),
          { status: 401, headers: { "content-type": "application/json" } },
        );
      }
    }

    // Geolocation checks
    const geo = geolocation(request);

    if (!geo?.country) {
      console.warn("No geolocation data available");
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
    if (blockedCountries.includes(geo.country)) {
      console.info(`Blocking traffic from: ${geo.country}`);
      return NextResponse.redirect(new URL("/blocked", request.url));
    }

    // Special handling for Ukraine regions (Crimea, Donetsk, Luhansk)
    if (geo.country === "UA") {
      const restrictedRegions = ["Crimea", "Donetsk", "Luhansk"];
      if (geo.region && restrictedRegions.includes(geo.region)) {
        console.info(
          `Blocking traffic from restricted region: ${geo.region}, Ukraine`,
        );
        return NextResponse.redirect(new URL("/blocked", request.url));
      }
    }

    console.info("Allowing traffic from:", geo.country);
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
}

// More specific matcher to include server actions
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - blocked (already blocked page)
     */
    "/((?!_next/static|_next/image|favicon.ico|blocked|terms).*)",
  ],
};
