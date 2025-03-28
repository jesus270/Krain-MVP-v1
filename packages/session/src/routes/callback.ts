import { NextRequest, NextResponse } from "next/server";
import { handlePrivyAuth } from "../auth-handler";
import { setUserSession } from "../server";
import { log } from "@krain/utils";

export async function handleAuthCallback(request: NextRequest) {
  try {
    const privyData = await request.json();

    if (!privyData.id) {
      return NextResponse.json({ error: "Invalid user data" }, { status: 400 });
    }

    // Handle Privy auth and create/update user in database
    const user = await handlePrivyAuth(privyData);

    // Set user session
    await setUserSession(user);

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("Error in auth callback", {
      operation: "handle_auth_callback",
      entity: "AUTH",
      error,
    });

    return NextResponse.json(
      { error: "Failed to handle auth callback" },
      { status: 500 },
    );
  }
}
