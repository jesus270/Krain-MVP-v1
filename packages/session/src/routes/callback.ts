import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "../redis";
import { RateLimiter } from "../rate-limit";
import { Session } from "../session";
import { log } from "@krain/utils";
import { defaultSessionConfig } from "../config";

export async function handleAuthCallback(request: NextRequest) {
  try {
    // Get Redis client and setup rate limiter
    const redis = await getRedisClient();
    const rateLimiter = new RateLimiter(redis);

    // Apply rate limiting
    const clientIp = await rateLimiter.getClientIp(request.headers);
    const rateLimitResult = await rateLimiter.checkRateLimit(clientIp, "auth");

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
          },
        },
      );
    }

    log.info("Processing auth callback", {
      entity: "API-auth/callback",
      operation: "auth_callback",
    });

    // Validate request content type
    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json(
        { error: "Invalid content type" },
        { status: 400 },
      );
    }

    const data = await request.json();

    // Validate user ID
    if (!data.user?.id) {
      log.error("Missing user ID", {
        entity: "API-auth/callback",
        operation: "auth_callback",
        status: "error",
      });
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Create user session
    const { user } = data;

    try {
      // Get Redis client
      const redis = await getRedisClient();

      // Create session
      const session = await Session.create({
        userId: user.id,
        data: {
          user,
          isLoggedIn: true,
        },
        redis,
        options: defaultSessionConfig,
      });
      await session.save();

      // Generate CSRF token
      const csrfToken = await session.generateCsrfToken();
      await session.save();

      const response = NextResponse.json({
        success: true,
        userId: user.id,
        csrfToken,
      });

      // Add user ID to headers
      response.headers.set("x-user-id", user.id);

      // Set user ID cookie
      response.cookies.set("user_id", user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      log.info("Session created successfully", {
        entity: "API-auth/callback",
        operation: "auth_callback",
        userId: user.id,
        timestamp: new Date().toISOString(),
      });

      return response;
    } catch (sessionError) {
      log.error("Session creation failed", {
        entity: "API-auth/callback",
        operation: "auth_callback",
        error: sessionError,
        userId: user.id,
      });

      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 },
      );
    }
  } catch (error) {
    log.error("Auth callback failed", {
      entity: "API-auth/callback",
      operation: "auth_callback",
      error,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
