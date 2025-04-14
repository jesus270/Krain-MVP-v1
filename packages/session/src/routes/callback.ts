import { NextRequest, NextResponse } from "next/server";
import { handlePrivyAuthServer } from "../server-auth-handler";
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

    // Restore original logic using NextResponse
    const status = error ? 500 : 200;
    let response: NextResponse;
    try {
      response = NextResponse.json(
        { success: !error },
        {
          status,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, max-age=0",
          },
        },
      );
      log.info("Created NextResponse object", {
        operation: "handle_callback_created_response",
        status,
      });
    } catch (responseError) {
      log.error("Fatal error creating NextResponse", {
        operation: "handle_callback_response_error",
        entity: "AUTH",
        userId: privyData.id,
        error:
          responseError instanceof Error
            ? responseError.message
            : String(responseError),
      });
      // If creating the response itself fails, return a basic 500
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to construct response",
        }),
        { status: 500 },
      );
    }

    // If handlePrivyAuthServer succeeded, try setting the cookie
    if (!error) {
      try {
        response.cookies.set({
          name: "user_id",
          value: privyData.id,
          httpOnly: false,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        });
        log.info("Auth callback completed and cookie set successfully", {
          operation: "handle_callback_success_cookie_set",
          entity: "AUTH",
          userId: privyData.id,
        });
      } catch (cookieError) {
        log.error("Failed to set user_id cookie", {
          operation: "handle_callback_cookie_error",
          entity: "AUTH",
          userId: privyData.id,
          error:
            cookieError instanceof Error
              ? cookieError.message
              : String(cookieError),
          stack: cookieError instanceof Error ? cookieError.stack : undefined,
        });
        // Attempt to proceed even if cookie setting fails, but the response status is already 200
      }
    } else {
      log.info("Auth callback returning error response (status 500)", {
        operation: "handle_callback_error_return",
        entity: "AUTH",
        userId: privyData.id,
      });
    }

    log.info("Returning final response from handleAuthCallback", {
      operation: "handle_callback_returning",
      status: response.status,
    });
    return response; // Return the constructed (and potentially cookie-modified) NextResponse
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
