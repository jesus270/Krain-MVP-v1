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

    // Get wallet address from either format
    const walletAddress = data.walletAddress || data.user?.wallet?.address;

    if (!walletAddress) {
      log.error("No wallet address found", {
        entity: "API-auth/callback",
        operation: "auth_callback",
        status: "error",
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

    log.info("Creating session for user", {
      entity: "API-auth/callback",
      operation: "auth_callback",
      userId: user.id,
      walletAddress: walletAddress,
      cookieDomain,
      host,
    });

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

    log.info("Session created successfully", {
      entity: "API-auth/callback",
      operation: "auth_callback",
      userId: user.id,
      timestamp: new Date().toISOString(),
      cookieDomain,
      host,
    });

    // Create response with session cookie
    const response = NextResponse.json({ success: true });

    // Add all cookie headers from the store
    const cookieHeaders = cookieStore.getCookieHeaders();
    for (const header of cookieHeaders) {
      response.headers.append("Set-Cookie", header);
    }

    return response;
  } catch (error) {
    log.error(error, {
      entity: "API-auth/callback",
      operation: "auth_callback",
      status: "error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
