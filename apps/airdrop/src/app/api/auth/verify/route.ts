import { NextRequest, NextResponse } from "next/server";
import { getPrivyUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    console.log("[SERVER] Received session verification request:", {
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll(),
    });

    const user = await getPrivyUser();
    if (!user) {
      console.error("[SERVER] Session verification failed: No user found", {
        headers: Object.fromEntries(request.headers.entries()),
        cookies: request.cookies.getAll(),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[SERVER] Session verified successfully for user:", {
      userId: user.id,
      walletAddress: user.wallet.address,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll(),
    });

    // Return the response with the session cookie
    const response = NextResponse.json({ success: true });

    // Log the response headers and cookies
    console.log("[SERVER] Session verification response:", {
      headers: Object.fromEntries(response.headers.entries()),
      cookies: response.cookies.getAll(),
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
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
