import { NextResponse, NextRequest } from "next/server";
import { getIronSession, IronSession } from "iron-session";
import { RequestCookies } from "next/dist/server/web/spec-extension/cookies";
import { CookieSerializeOptions } from "cookie";

interface PrivyUser {
  id: string;
  wallet: {
    address: string;
  };
}

interface PrivySession extends IronSession<PrivyUser> {
  user?: PrivyUser;
}

interface ResponseCookie {
  name: string;
  value: string;
  maxAge?: number;
}

interface CookieStore {
  get(name: string): { name: string; value: string } | undefined;
  set(name: string, value: string, cookie?: Partial<ResponseCookie>): void;
  set(options: ResponseCookie): void;
}

const PROTECTED_PATHS = ["/api/wallet", "/api/referral"];
const PUBLIC_PATHS = [
  "/api/auth",
  "/_next",
  "/static",
  "/favicon.ico",
  "/blocked",
  "/terms",
];

const sessionOptions = {
  cookieName: "privy_session",
  password:
    process.env.SESSION_SECRET ||
    "complex_password_at_least_32_characters_long",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
  },
};

// Create a wrapper to adapt RequestCookies to CookieStore interface
class CookieAdapter implements CookieStore {
  constructor(private cookies: RequestCookies) {}

  get(name: string): { name: string; value: string } | undefined {
    const cookie = this.cookies.get(name);
    return cookie
      ? {
          name: cookie.name,
          value: cookie.value,
        }
      : undefined;
  }

  set(
    nameOrOptions: string | ResponseCookie,
    value?: string,
    _cookie?: Partial<ResponseCookie>,
  ): void {
    if (typeof nameOrOptions === "string") {
      this.cookies.set(nameOrOptions, value || "");
    } else {
      this.cookies.set(nameOrOptions.name, nameOrOptions.value);
    }
  }
}

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
    !contentType.includes("text/plain") &&
    !contentType.includes("application/json") &&
    !contentType.includes("multipart/form-data")
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
  // Add cookie helper functions
  const requestCookies = request.cookies;
  const responseCookies = new Map<
    string,
    { name: string; value: string; options?: CookieSerializeOptions }
  >();

  const setCookie = (
    name: string,
    value: string,
    options?: CookieSerializeOptions,
  ) => {
    responseCookies.set(name, { name, value, options });
  };

  const getCookie = (name: string) => {
    return requestCookies.get(name);
  };

  const deleteCookie = (name: string, options?: CookieSerializeOptions) => {
    setCookie(name, "", { ...options, maxAge: 0 });
  };

  try {
    // Skip middleware for public paths
    if (
      PUBLIC_PATHS.some((path) => request.nextUrl.pathname.startsWith(path))
    ) {
      return NextResponse.next();
    }

    // Validate request headers and sanitize input
    if (!sanitizeRequest(request)) {
      console.error("[SERVER] Request failed sanitization:", {
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
      request.headers.get("next-action") !== null ||
      (request.method === "POST" &&
        request.headers.get("content-type")?.includes("text/plain"));

    if (isProtectedPath || isServerAction) {
      console.log("[SERVER] Validating session for request:", {
        path: request.nextUrl.pathname,
        method: request.method,
        isProtectedPath,
        isServerAction,
        headers: Object.fromEntries(request.headers.entries()),
        cookies: request.cookies.getAll(),
      });

      // Get session using the cookie adapter
      const cookieStore = new CookieAdapter(request.cookies);
      const session = await getIronSession<PrivySession>(
        cookieStore,
        sessionOptions,
      );

      // Log session state for debugging
      console.log("[SERVER] Session state:", {
        id: session.id,
        hasUser: !!session.user,
        cookies: request.cookies.getAll(),
      });

      if (!session.user?.id || !session.user?.wallet?.address) {
        // For server actions, we need to return a proper RSC response
        if (isServerAction) {
          console.error("[SERVER] Unauthorized server action:", {
            path: request.nextUrl.pathname,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            cookies: request.cookies.getAll(),
            session: {
              id: session.id,
              hasUser: !!session.user,
            },
          });

          return new NextResponse(
            JSON.stringify({
              error: "Unauthorized: Please log in first",
              digest: request.headers.get("next-action"),
            }),
            {
              status: 401,
              headers: {
                "content-type": "text/plain;charset=utf-8",
                "x-error": "unauthorized",
              },
            },
          );
        }

        console.error("[SERVER] Unauthorized request - no user session:", {
          path: request.nextUrl.pathname,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          cookies: request.cookies.getAll(),
          session: {
            id: session.id,
            hasUser: !!session.user,
          },
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
        userId: session.user.id,
        walletAddress: session.user.wallet.address,
        path: request.nextUrl.pathname,
        method: request.method,
      });
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

    // Return unauthorized for protected paths
    const isProtectedPath = PROTECTED_PATHS.some((path) =>
      request.nextUrl.pathname.startsWith(path),
    );
    if (isProtectedPath) {
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
