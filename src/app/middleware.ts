import { NextResponse, NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";

export async function middleware(request: NextRequest) {
  const geo = geolocation(request);

  // Add logging to debug geolocation data
  console.log("Geolocation data:", geo);

  // More robust check for US traffic
  if (geo?.country === "US" || geo?.country === "USA") {
    console.log("Blocking US traffic");
    return NextResponse.redirect(new URL("/blocked", request.url));
  }

  // Log when allowing traffic through
  console.log("Allowing traffic from:", geo?.country);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!blocked|api|_next/static|_next/image|favicon.ico).*)"],
};
