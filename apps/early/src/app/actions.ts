"use server";

import { db, earlyAccessSignupTable } from "@krain/db";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import {
  withServerActionProtection,
  getSession,
  Session,
} from "@krain/session/server";
import { log } from "@krain/utils";
import type { User, WhitelistSignupResult } from "@krain/session/types";

type EarlyAccessSignupResult =
  | { status: "success"; message: string }
  | { status: "already_signed_up"; message: string }
  | { status: "error"; message: string };

export async function signupForEarlyAccess(input: {
  userId: string;
}): Promise<EarlyAccessSignupResult> {
  log.info("signupForEarlyAccess: Action started", {
    operation: "signup_for_early_access",
    userId: input.userId,
  });
  try {
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

    log.info("signupForEarlyAccess: Manual session retrieval", {
      operation: "signup_early_manual_session_retrieval",
      entity: "ACTION",
      userId: input.userId,
    });
    const session: Session | null = await getSession(input.userId);

    if (!session) {
      log.warn("signupForEarlyAccess failed: No session", {
        operation: "signup_early_failed_no_session",
        entity: "ACTION",
        userId: input.userId,
      });
      throw new Error("Authentication required: Session not found");
    }

    const isActive = await session.checkActivity();
    if (!isActive) {
      log.warn("signupForEarlyAccess failed: Session inactive", {
        operation: "signup_early_failed_session_inactive",
        entity: "ACTION",
        userId: input.userId,
      });
      throw new Error("Authentication required: Session expired");
    }

    if (!session.get("isLoggedIn")) {
      log.warn("signupForEarlyAccess: Session missing isLoggedIn flag", {
        operation: "signup_early_missing_isloggedin",
        entity: "ACTION",
        userId: input.userId,
      });
      session.set("isLoggedIn", true);
      await session.save();
    }

    const user: User | undefined = session.get("user");
    log.info("User object from session", {
      operation: "signup_early_get_user_from_session",
      entity: "ACTION",
      userId: input.userId,
      retrievedUser: user,
    });

    if (!user) throw new Error("No user in session after checks");

    // Simplified check with direct logging before
    log.info("PRE-CHECK: User Email Address", {
      operation: "signup_early_pre_email_check",
      userId: input.userId,
      userEmailAddress: user.email?.address,
    });

    if (!user.email?.address) {
      // Direct check
      log.error("Email check FAILED", {
        operation: "signup_early_email_check_failed",
        userId: input.userId,
        userEmailObject: user.email,
      });
      throw new Error("Email address is required for early access signup");
    }
    // If check passes, email address is guaranteed to exist.
    const emailAddress = user.email.address;

    // Check if user already signed up
    const existingSignup = await db
      .select()
      .from(earlyAccessSignupTable)
      .where(eq(earlyAccessSignupTable.email, emailAddress))
      .limit(1);

    if (existingSignup.length > 0) {
      log.info("Returning already signed up (early access)", {
        operation: "signup_early_already_signed_up",
        entity: "ACTION",
        userId: input.userId,
      });
      return {
        status: "already_signed_up",
        message: "Already signed up for early access",
      };
    }

    log.info("Attempting to insert new signup into database (early access)", {
      operation: "signup_early_insert_new_signup",
      entity: "ACTION",
      userId: input.userId,
    });
    await db.insert(earlyAccessSignupTable).values({
      email: emailAddress,
    });
    log.info("Database insert successful (early access)", {
      operation: "signup_early_insert_success",
      entity: "ACTION",
      userId: input.userId,
    });

    log.info("Returning success (early access)", {
      operation: "signup_early_success",
      entity: "ACTION",
      userId: input.userId,
    });
    return {
      status: "success",
      message: "Successfully signed up for early access",
    };
  } catch (error) {
    log.error("Error in signupForEarlyAccess", {
      entity: "ACTION",
      operation: "signup_for_early_access_error",
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (
      error instanceof Error &&
      error.message.includes("Authentication required")
    ) {
      return {
        status: "error",
        message: "Authentication failed. Please ensure you are logged in.",
      };
    }
    return {
      status: "error",
      message:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}

export async function checkEarlyAccessSignup(input: {
  userId: string;
}): Promise<{
  sessionReady: boolean;
  isSignedUp: boolean;
}> {
  log.info("checkEarlyAccessSignup: Action started", {
    entity: "ACTION",
    operation: "check_early_access_signup_start",
    userId: input.userId,
  });
  try {
    const protectionResponse = await withServerActionProtection(
      { headers: headers() },
      "default",
    );
    if (protectionResponse !== null) {
      log.error("checkEarlyAccessSignup: Protection check failed", {
        entity: "ACTION",
        operation: "check_early_access_signup_protection_failed",
        userId: input.userId,
        statusText: protectionResponse.statusText,
      });
      return { sessionReady: false, isSignedUp: false };
    }

    const session = await getSession(input.userId);
    if (!session) {
      log.info("checkEarlyAccessSignup: Session not ready yet", {
        entity: "ACTION",
        operation: "check_early_access_signup_no_session",
        userId: input.userId,
      });
      return { sessionReady: false, isSignedUp: false };
    }

    const user: User | undefined = session.get("user");

    if (!user?.email?.address) {
      log.info("checkEarlyAccessSignup: No email found in session", {
        entity: "ACTION",
        operation: "check_early_access_signup_no_email",
        userId: input.userId,
      });
      return { sessionReady: true, isSignedUp: false };
    }

    let walletAddress = user.wallet?.address;
    if (
      !walletAddress &&
      user.linkedAccounts &&
      user.linkedAccounts.length > 0
    ) {
      const walletLinkedAccount = user.linkedAccounts.find(
        (account) =>
          typeof account === "string" &&
          (account.startsWith("0x") ||
            account.match(
              /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$/,
            ) ||
            account.match(/^[0-9a-zA-Z]{26,35}$/)),
      );
      if (walletLinkedAccount) {
        walletAddress = walletLinkedAccount;
      }
    }

    if (!walletAddress) {
      log.warn(
        "checkEarlyAccessSignup: No wallet address found for user with email",
        {
          entity: "ACTION",
          operation: "check_early_access_signup_no_wallet",
          userId: input.userId,
        },
      );
      return { sessionReady: true, isSignedUp: false };
    }

    const existingSignup = await db
      .select()
      .from(earlyAccessSignupTable)
      .where(eq(earlyAccessSignupTable.email, user.email.address))
      .limit(1);

    log.info("checkEarlyAccessSignup: DB check result", {
      entity: "ACTION",
      operation: "check_early_access_signup_db_result",
      userId: input.userId,
      isSignedUp: existingSignup.length > 0,
    });

    return { sessionReady: true, isSignedUp: existingSignup.length > 0 };
  } catch (error) {
    log.error("Error in checkEarlyAccessSignup", {
      entity: "ACTION",
      operation: "check_early_access_signup_error",
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return { sessionReady: false, isSignedUp: false };
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
    const session = await getSession(input.userId);
    log.info("isSessionReady check result", {
      userId: input.userId,
      sessionFound: !!session,
      entity: "ACTION",
      operation: "is_session_ready",
    });
    return !!session;
  } catch (error) {
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
