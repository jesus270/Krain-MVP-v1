import { NextRequest, NextResponse } from "next/server";
import { withSessionMiddleware } from "@krain/session";
import { sessionConfig } from "./app/layout";

export default async function middleware(request: NextRequest) {
  // Apply session middleware with our custom configuration
  // This ensures all routes have access to the session with proper configuration
  return withSessionMiddleware(request, sessionConfig);
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes that don't need sessions, etc.
    "/((?!_next/static|_next/image|favicon.ico|images|api/public).*)",
  ],
};
