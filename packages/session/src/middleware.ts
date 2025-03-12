import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { RateLimiter } from "./rate-limit";
import { getRedisClient } from "./redis";
import { AppError, ErrorCodes, log } from "@krain/utils";

type HeadersLike =
  | Headers
  | { get(key: string): string | null }
  | Promise<{ get(key: string): string | null }>;

async function getHeaderValue(
  headers: HeadersLike,
  key: string,
): Promise<string | null> {
  if (headers instanceof Promise) {
    const resolvedHeaders = await headers;
    return resolvedHeaders.get(key);
  }
  return headers.get(key);
}

function getAllowedOrigins(): string[] {
  const domain = process.env.DOMAIN;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN;

  // In development mode, allow localhost even if DOMAIN is not set
  if (process.env.NODE_ENV === "development") {
    const domains = [
      ...(domain ? [domain] : []),
      ...(appDomain ? [appDomain] : []),
      "localhost",
    ];
    return domains;
  }

  // In production, use both DOMAIN and NEXT_PUBLIC_APP_DOMAIN if available
  const domains = [];

  if (domain) {
    domains.push(domain);
  }

  if (appDomain) {
    domains.push(appDomain);
  }

  // Add specific domains we know should be allowed
  domains.push("early.krain.ai");

  // Add the landing page domain to allow navigation from landing to app
  domains.push("krain.ai");
  domains.push("landing.krain.ai");
  domains.push("www.krain.ai");

  // If still empty, log a warning
  if (domains.length === 0) {
    console.warn(
      "WARNING: No domains set for CORS. This could cause issues with cross-origin requests.",
    );
    return ["early.krain.ai"]; // Fallback to known domain
  }

  return domains;
}

function parseOriginDomain(url: string | null | undefined): string {
  if (!url) return "";

  try {
    // Handle localhost with port
    if (url.includes("localhost:")) {
      return "localhost";
    }
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    log.error("Failed to parse URL, attempting fallback extraction", {
      entity: "SESSION MIDDLEWARE",
      operation: "parse_origin_domain",
      url,
    });

    // Fallback: Try to extract domain using string operations
    try {
      // Remove protocol if present
      let domain = url.replace(/^(https?:\/\/)/, "");
      // Remove path and query params if present
      const parts = domain.split("/");
      domain = parts[0] || "";
      // Remove port if present
      const hostParts = domain.split(":");
      domain = hostParts[0] || "";

      if (domain) {
        return domain;
      }
    } catch {
      log.error("Fallback domain extraction also failed", {
        entity: "SESSION MIDDLEWARE",
        operation: "parse_origin_domain",
        url,
      });
    }
    return "";
  }
}

export async function validateOrigin(headers: HeadersLike): Promise<boolean> {
  // Get the host header which will be present even without origin/referer
  const host = await getHeaderValue(headers, "host");
  const origin = await getHeaderValue(headers, "origin");
  const referer = await getHeaderValue(headers, "referer");
  const userAgent = await getHeaderValue(headers, "user-agent");

  // Get allowed origins for the current environment
  const allowedOrigins = getAllowedOrigins();

  // Log headers for debugging
  log.info("Validating origin", {
    entity: "SESSION MIDDLEWARE",
    operation: "validate_origin",
    host,
    origin,
    referer,
    userAgent: userAgent?.substring(0, 100), // Truncate for log readability
    allowedOrigins,
    environment: process.env.NODE_ENV || "unknown",
  });

  // Added special case: If the request seems to be an initial page load
  // from a user navigating from our landing page, allow it without strict checks
  if (referer) {
    // Extract domain from referer
    const refererDomain = parseOriginDomain(referer);

    // Known domains we accept navigation from
    const trustedReferers = ["krain.ai", "landing.krain.ai", "www.krain.ai"];

    // If referer is from known domain, allow the request
    if (trustedReferers.includes(refererDomain)) {
      log.info("Allowing navigation from trusted referer", {
        entity: "SESSION MIDDLEWARE",
        operation: "validate_origin",
        refererDomain,
        host,
      });
      return true;
    }
  }

  // If there's no origin, this is likely a direct browser navigation
  // In production, we want to be more permissive with these
  if (!origin) {
    log.info("No origin - likely direct browser navigation", {
      entity: "SESSION MIDDLEWARE",
      operation: "validate_origin",
      referer,
      host,
    });

    // For direct navigation with no origin, rely on host validation
    // This is typically the case for users loading the page directly
    if (host) {
      const hostDomain = host.split(":")[0] || ""; // Fix: Add empty string fallback
      if (allowedOrigins.includes(hostDomain)) {
        return true;
      }

      // For early.krain.ai host, just allow it explicitly
      if (hostDomain === "early.krain.ai") {
        return true;
      }
    }

    // Allow the request if:
    // 1. No origin header (typical for direct browser navigation)
    // 2. Has a referer (indicating user clicked a link)
    if (referer) {
      // Add specific check for krain.ai referer format
      if (
        referer.startsWith("https://krain.ai/") ||
        referer.startsWith("http://krain.ai/") ||
        referer.includes("landing.krain.ai") ||
        referer.includes("www.krain.ai")
      ) {
        log.info("Allowing link navigation from krain.ai landing page", {
          entity: "SESSION MIDDLEWARE",
          operation: "validate_origin",
          referer,
        });
        return true;
      }

      return true; // Allow all referers when no origin for simplicity
    }
  }

  // Special case: Check if this is a browser navigation request (not an API call)
  // Browser navigations often have null origin with a referer
  if (!origin && referer) {
    const refererDomain = parseOriginDomain(referer);

    // Check if this looks like a navigation from landing page to app
    const isKnownRedirect = [
      "krain.ai",
      "landing.krain.ai",
      "www.krain.ai",
    ].includes(refererDomain);

    if (isKnownRedirect) {
      log.info("Allowing navigation from landing page to app", {
        entity: "SESSION MIDDLEWARE",
        operation: "validate_origin",
        refererDomain,
        host,
      });
      return true;
    }
  }

  // Continue with the rest of the validation...

  // If no origin/referer, use the host header
  if (!origin && !referer) {
    if (!host) {
      log.error("No origin/referer/host headers", {
        entity: "SESSION MIDDLEWARE",
        operation: "validate_origin",
      });
      return false;
    }
    const hostDomain = host.split(":")[0] || ""; // Remove port if present
    const isAllowed = allowedOrigins.includes(hostDomain);

    if (!isAllowed) {
      log.error(`Host domain ${hostDomain} not in allowed origins list`, {
        entity: "SESSION MIDDLEWARE",
        operation: "validate_origin",
        allowedOrigins,
      });
    }

    return isAllowed;
  }

  // Check both origin and referer
  const originDomain = parseOriginDomain(origin);
  const refererDomain = parseOriginDomain(referer);

  // Log detailed information about the domains
  log.info("Parsed domains for validation", {
    entity: "SESSION MIDDLEWARE",
    operation: "validate_origin",
    originDomain,
    refererDomain,
    allowedOrigins,
  });

  // In development, be more lenient with localhost validation
  if (process.env.NODE_ENV === "development") {
    const isAllowed =
      originDomain === "localhost" ||
      allowedOrigins.includes(originDomain) ||
      refererDomain === "localhost" ||
      allowedOrigins.includes(refererDomain);

    if (!isAllowed) {
      log.error("Development origin validation failed", {
        entity: "SESSION MIDDLEWARE",
        operation: "validate_origin",
        originDomain,
        refererDomain,
        allowedOrigins,
      });
    }

    return isAllowed;
  }

  const isAllowed =
    allowedOrigins.includes(originDomain) ||
    allowedOrigins.includes(refererDomain);

  if (!isAllowed) {
    log.error("Production origin validation failed", {
      entity: "SESSION MIDDLEWARE",
      operation: "validate_origin",
      originDomain,
      refererDomain,
      allowedOrigins,
    });
  }

  return isAllowed;
}

export async function withServerActionProtection(
  request: { headers: HeadersLike },
  type: "default" | "auth" | "api" = "default",
) {
  // Extract the referer to check if this is a navigation from the landing page
  const referer = await getHeaderValue(request.headers, "referer");

  // If the referer is from krain.ai, we'll bypass origin validation
  // This is crucial for links from the landing page to work
  const bypassOriginCheck =
    referer &&
    (referer.startsWith("https://krain.ai/") ||
      referer.startsWith("http://krain.ai/") ||
      referer.includes("landing.krain.ai") ||
      referer.includes("www.krain.ai"));

  if (bypassOriginCheck) {
    log.info("Bypassing origin check for request from landing page", {
      entity: "SESSION MIDDLEWARE",
      operation: "bypass_origin_check",
      referer,
    });

    // Skip origin validation, but still apply rate limiting
    const rateLimitResponse = await withRateLimit(request.headers, type);
    if (rateLimitResponse) return rateLimitResponse;

    return null; // Continue with the request
  }

  // First validate origin for all other requests
  if (!(await validateOrigin(request.headers))) {
    return NextResponse.json(
      {
        error: "Unauthorized origin",
        code: ErrorCodes.UNAUTHORIZED,
      },
      { status: 403 },
    );
  }

  // Then apply rate limiting
  const rateLimitResponse = await withRateLimit(request.headers, type);
  if (rateLimitResponse) return rateLimitResponse;

  return null; // Continue with the request
}

export async function withRateLimit(
  headers: HeadersLike,
  type: "default" | "auth" | "api" = "default",
) {
  const rateLimiter = new RateLimiter(await getRedisClient());
  const ip = await rateLimiter.getClientIp(headers);
  const result = await rateLimiter.checkRateLimit(ip, type);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Too many requests",
        code: ErrorCodes.RATE_LIMIT_EXCEEDED,
        reset: result.reset,
      },
      { status: 429 },
    );
  }

  return null;
}

export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: number;
}) {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}
