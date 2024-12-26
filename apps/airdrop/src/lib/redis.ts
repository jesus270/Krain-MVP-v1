import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Redis client
export const redis = Redis.fromEnv();

// Create a new ratelimiter that allows 100 requests per 15 minutes
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "15m"),
  analytics: true, // Enable analytics
  prefix: "@upstash/ratelimit", // Prefix for Redis keys
});

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

// Rate limiting function
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
  try {
    const result = await ratelimit.limit(ip);

    return {
      success: result.success,
      limit: 100, // Our configured limit
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    // For any errors, allow the request but log the error
    console.error("[RATE_LIMIT] Check failed", {
      operation: "rate_limit",
      status: "error",
      errorMessage: error instanceof Error ? error.message : String(error),
    });
    return {
      success: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 15 * 60 * 1000,
    };
  }
}
