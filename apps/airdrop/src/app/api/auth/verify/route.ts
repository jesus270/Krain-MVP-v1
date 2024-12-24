import { NextRequest, NextResponse } from "next/server";
import { getPrivyUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("[SERVER] Received session verification request:", {
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll(),
    });

    // Check for required cookies
    const privySession = request.cookies.get("privy_session");
    if (!privySession) {
      console.error(
        "[SERVER] Session verification failed: Missing privy_session cookie",
      );
      return NextResponse.json(
        { error: "Session cookie not found" },
        { status: 401 },
      );
    }

    const user = await getPrivyUser();
    if (!user) {
      console.error("[SERVER] Session verification failed: No user found", {
        headers: Object.fromEntries(request.headers.entries()),
        cookies: request.cookies.getAll(),
      });
      return NextResponse.json(
        { error: "User session not found or invalid" },
        { status: 401 },
      );
    }

    console.log("[SERVER] Session verified successfully for user:", {
      userId: user.id,
      walletAddress: user.wallet.address,
    });

    // Return the response with user data (excluding sensitive information)
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet.address,
      },
    });

    return response;
  } catch (error) {
    console.error("[SERVER] Error verifying session:", {
      error,
      stack: error instanceof Error ? error.stack : undefined,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll(),
    });

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
