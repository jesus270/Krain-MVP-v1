import { NextRequest, NextResponse } from "next/server";
import { handlePrivyAuthServer } from "../server-auth-handler-fixed";
import { log } from "@krain/utils";

export async function handleAuthCallback(request: NextRequest) {
  try {
    const privyData = await request.json();

    if (!privyData.id) {
      return NextResponse.json(
        { error: "Invalid user data", success: false },
        { status: 400 },
      );
    }

    let result = null;
    let error = null;

    // Try to handle Privy auth and create/update user in database
    try {
      result = await handlePrivyAuthServer(privyData);

      log.info("Auth callback completed", {
        operation: "handle_auth_callback_complete",
        entity: "AUTH",
        userId: privyData.id,
        success: true,
      });
    } catch (authError) {
      error = authError;
      log.error("Error in handlePrivyAuthServer", {
        operation: "handle_auth_server_error",
        entity: "AUTH",
        userId: privyData.id,
        error:
          authError instanceof Error ? authError.message : String(authError),
        stack: authError instanceof Error ? authError.stack : undefined,
      });
      // We'll still create a response with the cookie but return an error status
    }

    // Always create a response with the cookie
    const status = error ? 500 : 200;
    const response = NextResponse.json(
      { success: !error },
      {
        status,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );

    // Always set the user_id cookie for client-side access
    response.cookies.set({
      name: "user_id",
      value: privyData.id,
      httpOnly: false,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    log.info("Auth callback completed with cookie set", {
      operation: "handle_callback_success",
      entity: "AUTH",
      userId: privyData.id,
      success: !error,
    });

    return response;
  } catch (error) {
    log.error("Fatal error in auth callback", {
      operation: "handle_callback_error",
      entity: "AUTH",
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Failed to handle auth callback", success: false },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
