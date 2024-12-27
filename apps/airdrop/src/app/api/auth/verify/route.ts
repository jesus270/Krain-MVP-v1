import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions, getCookieDomain } from "@/lib/auth";
import { cookies } from "next/headers";
import { IronSessionCookieStore } from "@/lib/cookie-store";
import { log } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const host = request.headers.get("host") || "";
    const cookieDomain = getCookieDomain(host);

    log.info("Processing session verification", {
      entity: "API-auth/verify",
      operation: "verify_session",
      host,
      cookieDomain,
      nodeEnv: process.env.NODE_ENV,
      cookies: request.headers.get("cookie"),
    });

    // Create custom session options for this request
    const requestSessionOptions = {
      ...sessionOptions,
      cookieOptions: {
        ...sessionOptions.cookieOptions,
        domain: cookieDomain,
      },
    };

    const cookieStore = new IronSessionCookieStore(await cookies());
    const session = await getIronSession<SessionData>(
      cookieStore,
      requestSessionOptions,
    );

    log.info("Session data", {
      entity: "API-auth/verify",
      operation: "verify_session",
      session,
      sessionOptions: JSON.stringify(requestSessionOptions),
      cookieStore: {
        headers: cookieStore.getCookieHeaders(),
      },
    });

    // If no session or not logged in, return 401
    if (!session.isLoggedIn || !session.user) {
      log.warn("No active session found", {
        entity: "API-auth/verify",
        operation: "verify_session",
        status: "unauthorized",
      });
      return NextResponse.json(
        { error: "No active session", isLoggedIn: false, user: null },
        { status: 401 },
      );
    }

    log.info("Session verified successfully", {
      entity: "API-auth/verify",
      operation: "verify_session",
      userId: session.user.id,
      walletAddress: session.user.walletAddress,
    });

    // Create response with session cookie
    const response = NextResponse.json({
      isLoggedIn: true,
      user: session.user,
    });

    // Add all cookie headers from the store
    const cookieHeaders = cookieStore.getCookieHeaders();
    for (const header of cookieHeaders) {
      response.headers.append("Set-Cookie", header);
    }

    return response;
  } catch (error) {
    log.error(error, {
      entity: "API-auth/verify",
      operation: "verify_session",
      status: "error",
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
