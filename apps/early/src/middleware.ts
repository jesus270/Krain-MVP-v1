import { NextResponse, NextRequest } from "next/server";
import { withServerActionProtection, withRateLimit } from "@krain/session";
import { log } from "@krain/utils";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];

export async function middleware(request: NextRequest) {
  try {
    // Apply rate limiting and origin validation
    const protectionResponse = await withServerActionProtection(request, "api");
    if (protectionResponse) return protectionResponse;

    // Check if this is a protected route
    const path = request.nextUrl.pathname;
    if (PROTECTED_PATHS.some((p) => path.startsWith(p))) {
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
