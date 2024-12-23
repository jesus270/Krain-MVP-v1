import { NextRequest, NextResponse } from "next/server";
import { setPrivyUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("[SERVER] Received auth callback request:", {
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll(),
    });

    const data = await request.json();
    const { user } = data;

    if (!user || !user.id || !user.wallet?.address) {
      console.error("[SERVER] Invalid user data in auth callback:", {
        user,
        headers: Object.fromEntries(request.headers.entries()),
        cookies: request.cookies.getAll(),
      });
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    console.log("[SERVER] Setting user session for:", {
      userId: user.id,
      walletAddress: user.wallet.address,
    });

    // Set the user in the session
    await setPrivyUser({
      id: user.id,
      wallet: {
        address: user.wallet.address,
      },
    });

    console.log("[SERVER] User session set successfully");

    // Return the response with the session cookie
    const response = NextResponse.json({ success: true });

    // Log the response headers and cookies
    console.log("[SERVER] Auth callback response:", {
      headers: Object.fromEntries(response.headers.entries()),
      cookies: response.cookies.getAll(),
    });

    return response;
  } catch (error) {
    console.error("[SERVER] Error in auth callback:", {
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
