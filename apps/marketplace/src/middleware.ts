import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  // Get user ID from cookie
  const userId = request.cookies.get("user_id")?.value;

  // Debug cookies
  console.log("[Middleware] All cookies:", request.cookies.getAll());
  console.log("[Middleware] Auth status - userId:", userId);

  // If user is not logged in, allow the request to proceed
  // We'll let the authentication system handle redirects for protected pages
  if (!userId) {
    return NextResponse.next();
  }

  // Check if the request is already for the profile edit page or authentication-related paths
  // We don't want to create an infinite redirect loop
  const bypathPaths = [
    "/profile/edit",
    "/api/auth",
    "/api/me",
    "/api/session",
    "/login",
    "/auth",
  ];

  if (bypathPaths.some((path) => request.nextUrl.pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Get username from cookie if available
  // We'll add a separate cookie for the username to avoid DB queries in middleware
  const username = request.cookies.get("username")?.value;

  // If no username cookie exists, redirect to profile edit
  if (!username) {
    console.log(
      "[Middleware] No username found in cookies, redirecting to profile edit",
    );
    return NextResponse.redirect(new URL("/profile/edit", request.url));
  }

  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes that don't need sessions, etc.
    "/((?!_next/static|_next/image|favicon.ico|images|api/public).*)",
  ],
};
