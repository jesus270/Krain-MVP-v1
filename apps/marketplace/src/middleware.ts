import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@krain/session";

export async function middleware(request: NextRequest) {
  // Skip auth for public routes
  if (request.nextUrl.pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const sessionId = request.cookies.get("session")?.value;
  const session = sessionId ? await getSession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|logo.svg).*)",
  ],
};
