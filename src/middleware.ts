import { NextResponse, NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";

export async function middleware(request: NextRequest) {
  try {
    const geo = geolocation(request);

    // Add detailed logging for debugging
    console.log("Request URL:", request.url);
    console.log("Geolocation data:", geo);

    if (!geo) {
      console.warn("No geolocation data available");
      return NextResponse.next();
    }

    // Check specifically for US country code
    if (geo.country === "US") {
      console.log("Blocking US traffic from:", geo.country);
      return NextResponse.redirect(new URL("/blocked", request.url));
    }

    console.log("Allowing traffic from:", geo.country);
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On error, allow the request through rather than breaking the site
    return NextResponse.next();
  }
}

// More specific matcher to exclude static files and api routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - blocked (already blocked page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|blocked|terms).*)",
  ],
};
