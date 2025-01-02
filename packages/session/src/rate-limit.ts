import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { log } from "@krain/utils";

// Rate limit configurations
const RATE_LIMITS = {
  default: {
    requests: 100,
    window: "15m",
  },
  auth: {
    requests: 20,
    window: "5m",
  },
  api: {
    requests: 50,
    window: "1m",
  },
} as const;

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

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

export class RateLimiter {
  private rateLimiters: Record<keyof typeof RATE_LIMITS, Ratelimit>;

  constructor(redis: Redis) {
    // Create rate limiters with Edge Runtime compatible options
    this.rateLimiters = Object.entries(RATE_LIMITS).reduce(
      (acc, [key, config]) => {
        acc[key as keyof typeof RATE_LIMITS] = new Ratelimit({
          redis,
          limiter: Ratelimit.slidingWindow(config.requests, config.window),
          analytics: false, // Disable analytics in Edge Runtime
          prefix: `@upstash/ratelimit/${key}`,
          ephemeralCache: new Map<string, number>(), // Use Map for ephemeral cache
        });
        return acc;
      },
      {} as Record<keyof typeof RATE_LIMITS, Ratelimit>,
    );
  }

  // Helper function to get real IP considering proxies
  public async getClientIp(headers: HeadersLike): Promise<string> {
    // Check Cloudflare headers first
    const cfConnectingIp = await getHeaderValue(headers, "cf-connecting-ip");
    if (cfConnectingIp) return cfConnectingIp;

    // Check X-Forwarded-For
    const forwardedFor = await getHeaderValue(headers, "x-forwarded-for");
    if (forwardedFor) {
      // Get the first IP in the list
      const ips = forwardedFor.split(",");
      const firstIp = ips[0]?.trim();
      if (firstIp) return firstIp;
    }

    // Fallback to X-Real-IP
    const realIp = await getHeaderValue(headers, "x-real-ip");
    if (realIp) return realIp;

    // Final fallback
    return "127.0.0.1";
  }

  // Check rate limit for a given IP
  public async checkRateLimit(
    ip: string,
    type: keyof typeof RATE_LIMITS = "default",
  ): Promise<RateLimitResult> {
    try {
      const limiter = this.rateLimiters[type] || this.rateLimiters.default;
      const result = await limiter.limit(ip);
      const limit = RATE_LIMITS[type].requests;

      return {
        success: result.success,
        limit,
        remaining: result.remaining,
        reset: result.reset,
      };
    } catch (error) {
      log.error("Rate limit check failed", {
        operation: "rate_limit_check",
        entity: "SESSION",
        type,
        error: error instanceof Error ? error.message : String(error),
      });

      // Fail open in production, but with reduced limits
      return {
        success: true,
        limit: RATE_LIMITS[type].requests,
        remaining: 5, // Very limited remaining requests on error
        reset: Date.now() + 60000, // 1 minute
      };
    }
  }
}
