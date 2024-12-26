import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { log } from "./logger";

// Initialize Redis client
export const redis = Redis.fromEnv();

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

// Initialize rate limiters for different routes
const rateLimiters = {
  default: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMITS.default.requests,
      RATE_LIMITS.default.window,
    ),
    analytics: true,
    prefix: "@upstash/ratelimit/default",
  }),
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMITS.auth.requests,
      RATE_LIMITS.auth.window,
    ),
    analytics: true,
    prefix: "@upstash/ratelimit/auth",
  }),
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(
      RATE_LIMITS.api.requests,
      RATE_LIMITS.api.window,
    ),
    analytics: true,
    prefix: "@upstash/ratelimit/api",
  }),
};

// Helper function to get real IP considering proxies
export function getClientIp(headers: Headers): string {
  // Check Cloudflare headers first
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp;

  // Then check x-forwarded-for
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Get the first IP in the list which is typically the client IP
    const ips = forwardedFor.split(",").map((ip) => ip.trim());
    return ips[0] ?? "unknown";
  }

  // Finally check x-real-ip
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback
  return "unknown";
}

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

// Update rate limiting function
export async function checkRateLimit(
  ip: string,
  type: keyof typeof RATE_LIMITS = "default",
): Promise<RateLimitResult> {
  try {
    const limiter = rateLimiters[type] || rateLimiters.default;
    const result = await limiter.limit(ip);
    const limit = RATE_LIMITS[type].requests;

    return {
      success: result.success,
      limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    log.error(error, {
      operation: "rate_limit_check",
      entity: "REDIS",
      type,
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
