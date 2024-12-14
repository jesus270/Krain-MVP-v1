import { NextResponse, NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";

export async function middleware(request: NextRequest) {
  const geo = geolocation(request);

  // If the country is US, block access by redirecting
  if (geo?.country === "US") {
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  // Allow the request to proceed if not from the US
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!blocked|api|_next/static|_next/image|favicon.ico).*)"],
};
