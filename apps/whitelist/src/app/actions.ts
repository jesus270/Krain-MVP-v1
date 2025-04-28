"use server";

import { db, whitelistSignupTable } from "@krain/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import {
  withServerActionProtection,
  getSession,
  Session,
} from "@krain/session/server";
import { log } from "@krain/utils";
import type { WhitelistSignupResult, User } from "@krain/session/types";

export async function signupForWhitelist(input: {
  userId: string;
}): Promise<WhitelistSignupResult> {
  log.info("signupForWhitelist: Action started", {
    operation: "signup_for_whitelist",
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

    log.info("signupForWhitelist: Manual session retrieval", {
      operation: "signup_for_whitelist_manual_session_retrieval",
      userId: input.userId,
    });
    const session: Session | null = await getSession(input.userId);

    if (!session) {
      log.warn("signupForWhitelist failed: No session", {
        operation: "signup_for_whitelist_failed_no_session",
        userId: input.userId,
      });
      throw new Error("Authentication required: Session not found");
    }

    const isActive = await session.checkActivity();
    if (!isActive) {
      log.warn("signupForWhitelist failed: Session inactive", {
        operation: "signup_for_whitelist_failed_session_inactive",
        userId: input.userId,
      });
      throw new Error("Authentication required: Session expired");
    }

    if (!session.get("isLoggedIn")) {
      log.warn("signupForWhitelist: Session missing isLoggedIn flag", {
        operation: "signup_for_whitelist_session_missing_isLoggedIn_flag",
        userId: input.userId,
      });
      session.set("isLoggedIn", true);
      await session.save();
    }

    const user: User | undefined = session.get("user");
    log.info("User object from session", {
      operation: "signup_for_whitelist_get_user_from_session",
      userId: input.userId,
      retrievedUser: user,
    });

    if (!user) throw new Error("No user in session after checks");

    const emailAddress = user.email?.address;
    if (!emailAddress) {
      log.error("Email address check failed: Extracted address is falsy.", {
        operation: "signup_for_whitelist_email_check_failed",
        userId: input.userId,
        userEmailObject: user.email,
        extractedAddress: emailAddress,
      });
      throw new Error("Email address is required for whitelist signup");
    }

    let walletAddress = null;
    if (user.wallet?.address) {
      walletAddress = user.wallet.address;
      log.info("Found wallet address from user.wallet", {
        operation: "signup_for_whitelist_user_wallet",
        userId: input.userId,
        walletAddress,
      });
    } else if (user.linkedAccounts && user.linkedAccounts.length > 0) {
      log.info("Attempting to find wallet in linkedAccounts", {
        operation: "signup_for_whitelist_check_linked_accounts",
        userId: input.userId,
        linkedAccounts: user.linkedAccounts,
      });
      // Try to find a wallet among the linkedAccounts
      // First, check if any of the linkedAccounts strings look like wallet addresses (0x...)
      const walletLinkedAccount = user.linkedAccounts.find(
        (account) =>
          typeof account === "string" &&
          (account.startsWith("0x") || // For Ethereum
            account.match(
              /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$/,
            ) || // For Solana
            account.match(/^[0-9a-zA-Z]{26,35}$/)), // For Bitcoin/general
      );

      if (walletLinkedAccount) {
        walletAddress = walletLinkedAccount;
        log.info("Found wallet address from linkedAccounts string", {
          operation: "signup_for_whitelist_linked_account_string",
          userId: input.userId,
          walletAddress,
        });
      }
    }

    if (!walletAddress) {
      log.error("Wallet address check failed in whitelist signup action", {
        operation: "signup_for_whitelist_wallet_check_failed",
        userId: input.userId,
        userWallet: user.wallet,
        userLinkedAccounts: user.linkedAccounts,
      });
      throw new Error(
        "Wallet address is required for whitelist signup. Please reconnect your wallet and try again.",
      );
    }

    log.info("Proceeding with wallet address", {
      operation: "signup_for_whitelist_wallet_ok",
      userId: input.userId,
      walletAddress,
    });

    const existingSignup = await db
      .select()
      .from(whitelistSignupTable)
      .where(
        and(
          eq(whitelistSignupTable.email, emailAddress),
          eq(whitelistSignupTable.walletAddress, walletAddress),
        ),
      )
      .limit(1);
    log.info("Database check result", {
      operation: "signup_for_whitelist_db_check_result",
      userId: input.userId,
      result: existingSignup.length > 0,
    });

    if (existingSignup.length > 0) {
      const returnPayload: WhitelistSignupResult = {
        status: "already_signed_up",
        message: "Already signed up for whitelist",
      };
      log.info("Returning already signed up", {
        operation: "signup_for_whitelist_return_already_signed_up",
        userId: input.userId,
        payload: returnPayload,
      });
      return returnPayload;
    }

    log.info("Attempting to insert new signup into database", {
      operation: "signup_for_whitelist_db_insert_start",
      userId: input.userId,
    });
    await db.insert(whitelistSignupTable).values({
      email: emailAddress,
      walletAddress: walletAddress,
    });
    log.info("Database insert successful", {
      operation: "signup_for_whitelist_db_insert_success",
      userId: input.userId,
    });

    const successPayload: WhitelistSignupResult = { success: true };
    log.info("Returning simple success object", {
      operation: "signup_for_whitelist_return_success_obj",
      userId: input.userId,
      payload: successPayload,
    });
    return successPayload;
  } catch (error) {
    log.error("Error in signupForWhitelist", {
      entity: "ACTION",
      operation: "signup_for_whitelist",
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Keep the original error returning logic
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

export async function checkWhitelistSignup(input: { userId: string }): Promise<{
  sessionReady: boolean;
  isSignedUp: boolean;
}> {
  log.info("checkWhitelistSignup: Action started", {
    operation: "check_whitelist_signup",
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

    const session = await getSession(input.userId);
    if (!session) {
      log.info("checkWhitelistSignup: Session not ready yet", {
        operation: "check_whitelist_signup",
        userId: input.userId,
      });
      return { sessionReady: false, isSignedUp: false };
    }

    const user = session.get("user");

    if (!user?.email?.address) {
      // No email, cannot be signed up
      return { sessionReady: true, isSignedUp: false };
    }

    let walletAddress = null;
    if (user.wallet?.address) {
      walletAddress = user.wallet.address;
    } else if (user.linkedAccounts && user.linkedAccounts.length > 0) {
      log.info("Attempting to find wallet in linkedAccounts", {
        operation: "check_whitelist_signup_check_linked_accounts",
        userId: input.userId,
        linkedAccounts: user.linkedAccounts,
      });
      // Try to find a wallet among the linkedAccounts
      // First, check if any of the linkedAccounts strings look like wallet addresses (0x...)
      const walletLinkedAccount = user.linkedAccounts.find(
        (account) =>
          typeof account === "string" &&
          (account.startsWith("0x") || // For Ethereum
            account.match(
              /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{32,44}$/,
            ) || // For Solana
            account.match(/^[0-9a-zA-Z]{26,35}$/)), // For Bitcoin/general
      );

      if (walletLinkedAccount) {
        walletAddress = walletLinkedAccount;
        log.info("Found wallet address from linkedAccounts string", {
          operation: "check_whitelist_signup_linked_account_string",
          userId: input.userId,
          walletAddress,
        });
      }
    }

    if (!walletAddress) {
      // No wallet, cannot be signed up (shouldn't happen if email exists?)
      return { sessionReady: true, isSignedUp: false };
    }

    const existingSignup = await db
      .select()
      .from(whitelistSignupTable)
      .where(
        and(
          eq(whitelistSignupTable.email, user.email.address),
          eq(whitelistSignupTable.walletAddress, walletAddress),
        ),
      )
      .limit(1);

    return { sessionReady: true, isSignedUp: existingSignup.length > 0 };
  } catch (error) {
    log.error("Error in checkWhitelistSignup", {
      entity: "ACTION",
      operation: "check_whitelist_signup",
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Return default non-ready/non-signed-up state on error
    return { sessionReady: false, isSignedUp: false };
  }
}
