import { NextRequest, NextResponse } from "next/server";
import { User, SessionData, sessionOptions, getCookieDomain } from "@/lib/auth";
import { isValidSolanaAddress } from "@repo/utils";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { IronSessionCookieStore } from "@/lib/cookie-store";
import { log } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
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
    const host = request.headers.get("host") || "";
    const cookieDomain = getCookieDomain(host);

    log.info("Auth configuration", {
      entity: "API-auth/callback",
      operation: "auth_callback",
      host,
      cookieDomain,
      nodeEnv: process.env.NODE_ENV,
    });

    // Create custom session options for this request
    const requestSessionOptions = {
      ...sessionOptions,
      cookieOptions: {
        ...sessionOptions.cookieOptions,
        domain: cookieDomain,
      },
    };

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
    const user: User = {
      id: data.user.id,
      walletAddress: walletAddress,
    };

    try {
      // Create a new cookie store and session
      const cookieStore = new IronSessionCookieStore(await cookies());
      const session = await getIronSession<SessionData>(
        cookieStore,
        requestSessionOptions,
      );

      // Set session data
      session.user = user;
      session.isLoggedIn = true;
      session.lastActivity = Date.now();
      await session.save();

      // Create response with session cookie
      const response = NextResponse.json({ success: true });

      // Add all cookie headers from the store
      const cookieHeaders = cookieStore.getCookieHeaders();
      for (const header of cookieHeaders) {
        response.headers.append("Set-Cookie", header);
      }

      log.info("Session created successfully", {
        entity: "API-auth/callback",
        operation: "auth_callback",
        userId: user.id,
        timestamp: new Date().toISOString(),
        cookieDomain,
        host,
        cookieHeaders: cookieHeaders.length,
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
