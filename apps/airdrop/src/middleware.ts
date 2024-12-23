import { NextResponse, NextRequest } from "next/server";
import { geolocation } from "@vercel/functions";
import { getPrivyUser } from "./lib/auth";

const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];
const PUBLIC_PATHS = [
  "/api/auth",
  "/_next",
  "/static",
  "/favicon.ico",
  "/blocked",
  "/terms",
];

// Sanitize and validate request headers
function sanitizeRequest(request: NextRequest): boolean {
  const contentType = request.headers.get("content-type");
  const userAgent = request.headers.get("user-agent");
  const nextAction = request.headers.get("next-action");

  // Allow server actions (they use text/plain content type)
  if (nextAction && contentType?.includes("text/plain")) {
    return true;
  }

  // Block requests with suspicious content types
  if (
    contentType &&
    !contentType.match(/^(application\/json|multipart\/form-data|text\/plain)$/)
  ) {
    console.warn(
      "[SERVER] Blocked request with suspicious content type:",
      contentType,
    );
    return false;
  }

  // Block requests without user agent
  if (!userAgent) {
    console.warn("[SERVER] Blocked request without user agent");
    return false;
  }

  // Block requests with suspicious user agents
  if (
    userAgent.toLowerCase().includes("bot") ||
    userAgent.toLowerCase().includes("crawler")
  ) {
    console.warn("[SERVER] Blocked bot/crawler request:", userAgent);
    return false;
  }

  return true;
}

export async function middleware(request: NextRequest) {
  try {
    // Skip middleware for public paths
    if (
      PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))
    ) {
      return NextResponse.next();
    }

    // Get client IP
    const ip =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Validate request headers and sanitize input
    if (!sanitizeRequest(request)) {
      console.error("[SERVER] Request failed sanitization:", {
        ip,
        path: request.nextUrl.pathname,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
      });
      return new NextResponse(JSON.stringify({ error: "Invalid request" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    // Check if this is a protected route or server action
    const isProtectedPath = PROTECTED_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );
    const isServerAction =
      request.method === "POST" &&
      request.headers.get("content-type")?.includes("application/json");

    if (isProtectedPath || isServerAction) {
      console.log("[SERVER] Validating session for request:", {
        path: request.nextUrl.pathname,
        method: request.method,
        isProtectedPath,
        isServerAction,
        headers: Object.fromEntries(request.headers.entries()),
        cookies: request.cookies.getAll(),
      });

      const user = await getPrivyUser();
      if (!user) {
        console.error("[SERVER] Unauthorized request - no user session:", {
          path: request.nextUrl.pathname,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          cookies: request.cookies.getAll(),
        });
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized: Please log in first" }),
          {
            status: 401,
            headers: {
              "content-type": "application/json",
              "x-error": "unauthorized",
            },
          },
        );
      }

      console.log("[SERVER] Session validated for user:", {
        userId: user.id,
        walletAddress: user.wallet.address,
        path: request.nextUrl.pathname,
        method: request.method,
      });
    }

    // Geolocation checks
    const geo = geolocation(request);

    if (!geo?.country) {
      console.warn("No geolocation data available");
      return NextResponse.next();
    }

    // List of blocked countries (using ISO country codes)
    const blockedCountries = [
      "US", // United States
      "KP", // North Korea
      "IR", // Iran
      "SY", // Syria
      "CU", // Cuba
      "RU", // Russia
      "BY", // Belarus
    ];

    // Check if user's country is in the blocked list
    if (blockedCountries.includes(geo.country)) {
      console.info(`Blocking traffic from: ${geo.country}`);
      return NextResponse.redirect(new URL("/blocked", request.url));
    }

    // Special handling for Ukraine regions (Crimea, Donetsk, Luhansk)
    if (geo.country === "UA") {
      const restrictedRegions = ["Crimea", "Donetsk", "Luhansk"];
      if (geo.region && restrictedRegions.includes(geo.region)) {
        console.info(
          `Blocking traffic from restricted region: ${geo.region}, Ukraine`,
        );
        return NextResponse.redirect(new URL("/blocked", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[SERVER] Error in middleware:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      path: request.nextUrl.pathname,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll(),
    });
    return NextResponse.next();
  }
}

// More specific matcher to include server actions and protected paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - blocked (already blocked page)
     * - terms (terms page)
     */
    "/((?!_next/static|_next/image|favicon.ico|blocked|terms).*)",
  ],
};
