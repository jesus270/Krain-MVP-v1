import { NextResponse, NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "./lib/auth";
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { IronSessionCookieStore } from "./lib/cookie-store";

// Protected paths that require authentication
const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];

// Public paths that don't require authentication
const PUBLIC_PATHS = [
  "/",
  "/api/auth",
  "/_next",
  "/static",
  "/favicon.ico",
  "/blocked",
  "/terms",
];

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for public paths
    const isPublicPath = PUBLIC_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );
    if (isPublicPath) {
      return NextResponse.next();
    }

    // Check if this is a protected route
    const isProtectedPath = PROTECTED_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );

    // Only check authentication for protected paths
    if (isProtectedPath) {
      const cookieStore = new IronSessionCookieStore(
        request.cookies as unknown as ReadonlyRequestCookies,
      );
      const session = await getIronSession<SessionData>(
        cookieStore,
        sessionOptions,
      );

      // Check if session exists and is valid
      if (!session.isLoggedIn || !session.user) {
        return NextResponse.redirect(new URL("/", request.url));
      }

      // Add session cookie headers to response
      const response = NextResponse.next();
      const cookieHeaders = cookieStore.getCookieHeaders();
      for (const header of cookieHeaders) {
        response.headers.append("Set-Cookie", header);
      }
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[SERVER] Middleware error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
