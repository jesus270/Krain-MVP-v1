"use server";

import { db, earlyAccessSignupTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  withAuth,
  withServerActionProtection,
  getSession,
} from "@krain/session/server";
import { log } from "@krain/utils";

export async function signupForEarlyAccess(input: { userId: string }) {
  try {
    // Validate origin and apply rate limiting
    const protectionResponse = await withServerActionProtection(
      { headers: headers() },
      "default",
    );
    if (protectionResponse !== null) {
      throw new Error(
        protectionResponse.statusText ||
          "Protection check failed or unauthorized",
      );
    }

    // Call withAuth directly
    return withAuth(input.userId, async (session) => {
      const user = session.get("user");
      // Log the user object retrieved from the session
      log.info("User object from session in signup action", {
        operation: "signup_get_user_from_session",
        entity: "ACTION",
        userId: input.userId,
        retrievedUser: user,
      });

      if (!user) throw new Error("No user in session");
      if (!user.email?.address) {
        log.error("Email address check failed in signup action", {
          operation: "signup_email_check_failed",
          entity: "ACTION",
          userId: input.userId,
          userEmail: user.email, // Log the email part specifically
        });
        throw new Error("Email address is required for early access signup");
      }

      // Check if user already signed up
      const existingSignup = await db
        .select()
        .from(earlyAccessSignupTable)
        .where(eq(earlyAccessSignupTable.email, user.email.address))
        .limit(1);

      if (existingSignup.length > 0) {
        return {
          status: "already_signed_up",
          message: "Already signed up for early access",
        };
      }

      // Create new signup
      await db.insert(earlyAccessSignupTable).values({
        email: user.email.address,
      });

      return {
        status: "success",
        message: "Successfully signed up for early access",
      };
    });
  } catch (error) {
    log.error("Error in signupForEarlyAccess", {
      entity: "ACTION",
      operation: "signup_for_early_access",
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (
      error instanceof Error &&
      error.message.includes("Authentication required")
    ) {
      throw new Error(
        "Authentication failed. Please ensure you are logged in.",
      );
    }
    throw new Error("Failed to sign up for early access. Please try again.");
  }
}

export async function checkEarlyAccessSignup(input: {
  userId: string;
}): Promise<{
  sessionReady: boolean;
  isSignedUp: boolean;
}> {
  try {
    // Validate origin and apply rate limiting
    const protectionResponse = await withServerActionProtection(
      { headers: headers() },
      "default",
    );
    if (protectionResponse !== null) {
      throw new Error(
        protectionResponse.statusText ||
          "Protection check failed or unauthorized",
      );
    }

    // Attempt to get the session
    const session = await getSession(input.userId);

    // If session doesn't exist yet, return specific status
    if (!session) {
      log.info("checkEarlyAccessSignup: Session not ready yet", {
        userId: input.userId,
        operation: "check_early_access_signup",
        entity: "ACTION",
      });
      return { sessionReady: false, isSignedUp: false };
    }

    // Session exists, proceed with logic inside withAuth
    return withAuth(input.userId, async (session) => {
      const user = session.get("user");

      // This check should ideally not be needed if getSession succeeded, but belt-and-suspenders
      if (!user) {
        log.warn(
          "checkEarlyAccessSignup: User missing in session despite session presence",
          {
            userId: input.userId,
            operation: "check_early_access_signup",
            entity: "ACTION",
          },
        );
        // Treat as not ready / not signed up if user data is missing
        return { sessionReady: true, isSignedUp: false };
      }

      // If email is missing, they can't be signed up yet
      if (!user.email) {
        return { sessionReady: true, isSignedUp: false };
      }

      // Check if user already signed up in DB
      const existingSignup = await db
        .select()
        .from(earlyAccessSignupTable)
        .where(eq(earlyAccessSignupTable.email, user.email.address))
        .limit(1);

      return { sessionReady: true, isSignedUp: existingSignup.length > 0 };
    });
  } catch (error) {
    // Handle errors from withServerActionProtection or withAuth
    log.error("Error in checkEarlyAccessSignup", {
      entity: "ACTION",
      operation: "check_early_access_signup",
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // If it's the specific "Session not found" error from withAuth, treat as not ready
    if (
      error instanceof Error &&
      error.message.includes("Authentication required: Session not found")
    ) {
      return { sessionReady: false, isSignedUp: false };
    }

    // For other errors, rethrow
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Failed to check early access signup status due to an unexpected error",
    );
  }
}

/**
 * Checks if a session exists for the given user ID.
 * This is used by the client to poll session readiness after auth events.
 */
export async function isSessionReady(input: {
  userId: string;
}): Promise<boolean> {
  try {
    // No need for protection here, just checking existence
    const session = await getSession(input.userId);
    log.info("isSessionReady check result", {
      userId: input.userId,
      sessionFound: !!session,
      entity: "ACTION",
      operation: "is_session_ready",
    });
    return !!session; // Return true if session is found, false otherwise
  } catch (error) {
    // Log errors from getSession, but return false as session is not ready
    log.error("Error in isSessionReady check", {
      entity: "ACTION",
      operation: "is_session_ready",
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return false;
  }
}
