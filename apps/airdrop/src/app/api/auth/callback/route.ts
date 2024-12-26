import { NextRequest, NextResponse } from "next/server";
import { User, setUserSession, SessionData } from "@/lib/auth";
import { isValidSolanaAddress } from "@repo/utils";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/auth";
import { IronSessionCookieStore } from "@/lib/cookie-store";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("[SERVER] Full user object:", {
      user: data.user,
      linkedAccounts: data.user?.linkedAccounts,
      wallet: data.user?.wallet,
      wallets: data.user?.wallets,
      embeddedWallets: data.user?.embeddedWallets,
      connectedWallets: data.user?.connectedWallets,
    });

    // Validate user ID
    if (!data.user?.id) {
      console.error("[SERVER] Missing user ID:", { data });
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    // Get wallet address directly from the request
    const walletAddress = data.user?.wallet?.address;

    if (!walletAddress) {
      console.error("[SERVER] No wallet address found:", {
        wallet: data.user?.wallet,
      });
      return NextResponse.json(
        { error: "No wallet connected" },
        { status: 400 },
      );
    }

    // Validate wallet address
    if (!isValidSolanaAddress(walletAddress)) {
      console.error("[SERVER] Invalid Solana address:", { walletAddress });
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

    // Create a new cookie store and session
    const cookieStore = new IronSessionCookieStore(await cookies());
    const session = await getIronSession<SessionData>(
      cookieStore,
      sessionOptions,
    );

    // Set session data
    session.user = user;
    session.isLoggedIn = true;
    await session.save();

    // Create response with session cookie
    const response = NextResponse.json({ success: true, user });

    // Add all cookie headers from the store
    const cookieHeaders = cookieStore.getCookieHeaders();
    for (const header of cookieHeaders) {
      response.headers.append("Set-Cookie", header);
    }

    console.log("[SERVER] Session created for user:", {
      id: user.id,
      walletAddress: user.walletAddress,
    });

    return response;
  } catch (error) {
    console.error("[SERVER] Auth callback error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
