import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@krain/db";
import { userTable } from "@krain/db/schema";
import { eq } from "drizzle-orm";

export async function middleware(request: NextRequest) {
  // Get the user's wallet address from the session
  const walletAddress = request.cookies.get("wallet_address")?.value;

  if (!walletAddress) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Check if user exists and has admin role
  const user = await db.query.userTable.findFirst({
    where: eq(userTable.walletAddress, walletAddress),
  });

  if (!user || user.role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     * - unauthorized (unauthorized page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|unauthorized).*)",
  ],
}; 