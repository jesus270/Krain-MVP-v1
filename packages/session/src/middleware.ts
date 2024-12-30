import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { RateLimiter } from "./rate-limit";
import { getRedisClient } from "./redis";
import { AppError, ErrorCodes } from "@krain/utils";
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

  const origins = [domain];
  if (!domain.startsWith("localhost")) {
    origins.push(`www.${domain}`);
  }

  return origins;
}

const ALLOWED_ORIGINS = getAllowedOrigins();

function parseOriginDomain(url: string): string {
  try {
    // Handle localhost with port
    if (url.includes("://localhost:")) {
      return "localhost";
    }
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

export async function validateOrigin(headers: HeadersLike): Promise<boolean> {
  const origin = await getHeaderValue(headers, "origin");
  const referer = await getHeaderValue(headers, "referer");

  // In development, allow requests without origin/referer
  if (!origin && !referer) {
    return process.env.NODE_ENV === "development";
  }

  const originDomain = parseOriginDomain(origin || referer || "");
  return ALLOWED_ORIGINS.includes(originDomain);
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
