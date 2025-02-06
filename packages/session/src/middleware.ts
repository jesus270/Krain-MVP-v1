import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { RateLimiter } from "./rate-limit";
import { getRedisClient } from "./redis";
import { AppError, ErrorCodes, log } from "@krain/utils";
import { headers as NextHeaders } from "next/headers";

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
  if (!domain) {
    throw new Error("DOMAIN environment variable must be set");
  }

  // Include localhost for development
  if (process.env.NODE_ENV === "development") {
    return [domain, "localhost"];
  }

  return [domain];
}

const ALLOWED_ORIGINS = getAllowedOrigins();

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

  // Log headers for debugging
  log.info("Validating origin", {
    entity: "SESSION MIDDLEWARE",
    operation: "validate_origin",
    host,
    origin,
    referer,
  });

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
    return ALLOWED_ORIGINS.includes(hostDomain);
  }

  // Check both origin and referer
  const originDomain = parseOriginDomain(origin);
  const refererDomain = parseOriginDomain(referer);

  // In development, be more lenient with localhost validation
  if (process.env.NODE_ENV === "development") {
    return (
      originDomain === "localhost" ||
      ALLOWED_ORIGINS.includes(originDomain) ||
      refererDomain === "localhost" ||
      ALLOWED_ORIGINS.includes(refererDomain)
    );
  }

  return (
    ALLOWED_ORIGINS.includes(originDomain) ||
    ALLOWED_ORIGINS.includes(refererDomain)
  );
}

export async function withServerActionProtection(
  request: { headers: HeadersLike },
  type: "default" | "auth" | "api" = "default",
) {
  // First validate origin
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
