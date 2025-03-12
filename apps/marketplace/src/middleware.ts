import { NextRequest, NextResponse } from "next/server";
import { validateOrigin, withRateLimit } from "@krain/session";
import { sessionConfig } from "./lib/session";

export default async function middleware(request: NextRequest) {
  // Validate the origin of the request
  if (!(await validateOrigin(request.headers))) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  // Apply rate limiting
  const rateLimitResponse = await withRateLimit(request.headers);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // Continue to the next middleware or route handler
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    // Apply to all routes except static files, api routes that don't need sessions, etc.
    "/((?!_next/static|_next/image|favicon.ico|images|api/public).*)",
  ],
};
