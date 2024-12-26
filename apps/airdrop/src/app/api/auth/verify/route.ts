import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/auth";
import { cookies } from "next/headers";
import { IronSessionCookieStore } from "@/lib/cookie-store";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = new IronSessionCookieStore(await cookies());
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions,
    );

    // If no session or not logged in, return 401
    if (!session.isLoggedIn || !session.user) {
      return NextResponse.json(
        {
          error: "No active session",
          isLoggedIn: false,
          user: null,
        },
        { status: 401 },
      );
    }

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
    console.error("[SERVER] Session verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
