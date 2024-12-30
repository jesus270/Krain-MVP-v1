"use server";

import { NextRequest, NextResponse } from "next/server";
import {
  getRedisClient,
  withRateLimit,
  getRateLimitHeaders,
  setUserSession,
} from "@krain/session";
import { sessionOptions } from "@/lib/session-config";
import { isValidSolanaAddress } from "@krain/utils";
import { log } from "@krain/utils";
import { Session } from "@krain/session";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await withRateLimit(request.headers, "auth");
    if (rateLimitResponse) return rateLimitResponse;

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

    // Get wallet address from either format with detailed logging
    const walletAddress = data.walletAddress || data.user?.wallet?.address;
    log.info("Wallet address check", {
      entity: "API-auth/callback",
      operation: "auth_callback",
      hasDirectWalletAddress: !!data.walletAddress,
      hasNestedWalletAddress: !!data.user?.wallet?.address,
      finalWalletAddress: walletAddress,
    });

    if (!walletAddress) {
      log.error("No wallet address found", {
        entity: "API-auth/callback",
        operation: "auth_callback",
        status: "error",
        requestData: JSON.stringify(data),
      });
      return NextResponse.json(
        { error: "No wallet connected" },
        { status: 400 },
      );
    }

    // Validate wallet address
    if (!isValidSolanaAddress(walletAddress)) {
      log.error("Invalid Solana address", {
        entity: "API-auth/callback",
        operation: "auth_callback",
        status: "error",
        walletAddress,
      });
      return NextResponse.json(
        { error: "Invalid Solana address" },
        { status: 400 },
      );
    }

    // Create user session
    const user = {
      id: data.user.id,
      walletAddress: walletAddress,
    };

    try {
      // Get Redis client
      const redis = await getRedisClient();

      // Create session
      const session = await Session.create(user.id, redis, sessionOptions);
      session.set("user", user);
      session.set("isLoggedIn", true);
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
