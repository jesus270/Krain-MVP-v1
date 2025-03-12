import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  // Simply continue to the next middleware or route handler
  // We'll handle origin validation and rate limiting separately
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes that don't need sessions, etc.
    "/((?!_next/static|_next/image|favicon.ico|images|api/public).*)",
  ],
};
