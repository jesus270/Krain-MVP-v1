"use server";

import { db, whitelistSignupTable } from "@krain/db";
import { eq, and } from "drizzle-orm";
import { headers } from "next/headers";
import {
  withAuth,
  withServerActionProtection,
  getSession,
} from "@krain/session/server";
import { log } from "@krain/utils";

export async function signupForWhitelist(input: { userId: string }) {
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
      log.info("User object from session in whitelist signup action", {
        operation: "whitelist_signup_get_user_from_session",
        entity: "ACTION",
        userId: input.userId,
        retrievedUser: user,
      });

      if (!user) throw new Error("No user in session");

      // Check if email is present
      if (!user.email?.address) {
        log.error("Email address check failed in whitelist signup action", {
          operation: "whitelist_signup_email_check_failed",
          entity: "ACTION",
          userId: input.userId,
          userEmail: user.email, // Log the email part specifically
        });
        throw new Error("Email address is required for whitelist signup");
      }

      // Try to get wallet from session user
      let walletAddress = null;

      // Check if wallet is directly in user object
      if (user.wallet?.address) {
        walletAddress = user.wallet.address;
        log.info("Found wallet address from user.wallet", {
          operation: "whitelist_signup_user_wallet",
          entity: "ACTION",
          userId: input.userId,
          walletAddress,
        });
      }
      // Check if wallet is in session linkedAccounts
      else if (user.linkedAccounts?.length > 0) {
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
            operation: "whitelist_signup_linked_account_string",
            entity: "ACTION",
            userId: input.userId,
            walletAddress,
          });
        }
      }

      // Check if we found a wallet address
      if (!walletAddress) {
        log.error("Wallet address check failed in whitelist signup action", {
          operation: "whitelist_signup_wallet_check_failed",
          entity: "ACTION",
          userId: input.userId,
        });
        throw new Error(
          "Wallet address is required for whitelist signup. Please reconnect your wallet and try again.",
        );
      }

      // Check if user already signed up
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

      if (existingSignup.length > 0) {
        return {
          status: "already_signed_up",
          message: "Already signed up for whitelist",
        };
      }

      // Create new signup
      await db.insert(whitelistSignupTable).values({
        email: user.email.address,
        walletAddress: walletAddress,
      });

      return {
        status: "success",
        message: "Successfully signed up for whitelist",
      };
    });
  } catch (error) {
    log.error("Error in signupForWhitelist", {
      entity: "ACTION",
      operation: "signup_for_whitelist",
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
    throw new Error("Failed to sign up for whitelist. Please try again.");
  }
}

export async function checkWhitelistSignup(input: { userId: string }): Promise<{
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
      log.info("checkWhitelistSignup: Session not ready yet", {
        userId: input.userId,
        operation: "check_whitelist_signup",
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
          "checkWhitelistSignup: User missing in session despite session presence",
          {
            userId: input.userId,
            operation: "check_whitelist_signup",
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

      // Get wallet address from linkedAccounts or user.walletAddress
      const walletAccount = user.linkedAccounts?.find(
        (acc: any) => acc.type === "wallet",
      );
      const walletAddress = walletAccount
        ? (walletAccount as any).address
        : (user as any).walletAddress;

      if (!walletAddress) {
        return { sessionReady: true, isSignedUp: false };
      }

      // Check if user already signed up in DB
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
    });
  } catch (error) {
    log.error("Error in checkWhitelistSignup", {
      entity: "ACTION",
      operation: "check_whitelist_signup",
      userId: input.userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Return false values to prevent breaking client side
    return { sessionReady: false, isSignedUp: false };
  }
}
