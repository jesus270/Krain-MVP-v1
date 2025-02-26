"use server";

import { z } from "zod";
import { db, Wallet, walletTable } from "@krain/db";
import {
  withAuth,
  getRedisClient,
  getCurrentUser,
  withServerActionProtection,
} from "@krain/session";
import { defaultSessionConfig as sessionOptions } from "@krain/session";
import { eq } from "drizzle-orm";
import {
  generateReferralCode,
  isValidSolanaAddress,
  isValidEthereumAddress,
} from "@krain/utils";
import { createReferral } from "./referral";
import { log, AppError, ErrorCodes } from "@krain/utils";
import { headers } from "next/headers";

const walletAddressSchema = z.object({
  address: z
    .string()
    .refine(
      (address) =>
        isValidSolanaAddress(address) || isValidEthereumAddress(address),
      {
        message:
          "Invalid wallet address. Must be a valid Solana or Ethereum address.",
      },
    ),
});

const referralCodeSchema = z.object({
  referralCode: z.string().length(6),
});

const referredBySchema = z.object({
  referredByCode: z.string().length(6),
});

export async function createWallet(input: { address: string; userId: string }) {
  // Validate origin and apply rate limiting
  const protectionResponse = await withServerActionProtection(
    { headers: headers() },
    "default",
  );
  if (protectionResponse)
    throw new AppError(ErrorCodes.UNAUTHORIZED, "Unauthorized request");

  return withAuth(input.userId, async (session) => {
    try {
      const user = session.get("user");
      if (!user) throw new Error("No user in session");

      // Validate input
      const parsed = walletAddressSchema.parse(input);

      // Verify user can only create wallet for their own address
      if (parsed.address !== user.wallet.address) {
        throw new AppError(
          "Unauthorized: You can only create a wallet for your own address",
          ErrorCodes.UNAUTHORIZED,
          401,
        );
      }

      log.info("Creating new wallet", {
        operation: "create_wallet",
        entity: "WALLET",
        user,
        walletAddress: parsed.address,
      });

      // Create wallet
      const wallet = await db
        .insert(walletTable)
        .values({
          address: parsed.address,
          referralCode: generateReferralCode(),
        })
        .returning();

      if (!wallet || wallet.length === 0) {
        throw new AppError(
          "Failed to create wallet: No wallet returned",
          ErrorCodes.DATABASE_ERROR,
          500,
        );
      }

      log.info("Wallet created successfully", {
        operation: "create_wallet",
        entity: "WALLET",
        user,
        walletAddress: parsed.address,
        referralCode: wallet?.[0]?.referralCode,
      });

      return wallet[0];
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      const currentUser = await getCurrentUser(input.userId);
      log.error(error, {
        operation: "create_wallet",
        entity: "WALLET",
        currentUser,
        inputAddress: input.address,
      });

      throw new AppError(
        "Failed to create wallet",
        ErrorCodes.WALLET_ERROR,
        500,
      );
    }
  });
}

export async function getWalletByReferralCode(input: {
  referralCode: string;
  userId: string;
}) {
  return withAuth(input.userId, async (session) => {
    try {
      const parsed = referralCodeSchema.parse(input);

      const wallet = await db.query.walletTable.findFirst({
        where: eq(walletTable.referralCode, parsed.referralCode),
      });

      return wallet;
    } catch (error) {
      const currentUser = await getCurrentUser(input.userId);
      log.error(error, {
        entity: "WALLET",
        operation: "get_wallet_by_referral_code",
        currentUser,
        input,
      });

      if (error instanceof z.ZodError) {
        throw new Error("String must contain exactly 6 character(s)");
      }

      throw new Error(
        `Failed to get referrals count: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
}

export interface WalletWithReferredBy extends Wallet {
  referredBy: Wallet | null;
}

export async function getWallet(input: {
  address: string;
  userId: string;
}): Promise<WalletWithReferredBy | undefined> {
  return withAuth(input.userId, async (session) => {
    try {
      const user = session.get("user");
      if (!user) throw new Error("No user in session");

      // Validate input
      const parsed = walletAddressSchema.parse(input);

      // Verify user can only access their own wallet
      if (parsed.address !== user.wallet.address) {
        throw new Error("Unauthorized: You can only access your own wallet");
      }

      // Get wallet
      const wallet = await db.query.walletTable.findFirst({
        where: eq(walletTable.address, parsed.address),
        with: {
          referredBy: true,
        },
      });

      return wallet as WalletWithReferredBy | undefined;
    } catch (error) {
      const currentUser = await getCurrentUser(input.userId);
      log.error(error, {
        entity: "WALLET",
        operation: "get_wallet",
        currentUser,
        input,
      });

      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid wallet address. Must be a valid Solana or Ethereum address.",
        );
      }

      throw new Error(
        `Failed to get wallet: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
}

export async function isValidReferralCode(input: {
  referredByCode: string;
  referredWallet: WalletWithReferredBy;
  userId: string;
}) {
  return withAuth(input.userId, async (session) => {
    const user = session.get("user");
    if (!user) throw new Error("No user in session");

    if (input.referredWallet.address !== user.wallet.address) {
      throw new Error(
        "Unauthorized: You can only check your own referral code",
      );
    }

    if (input.referredWallet.referredBy) {
      throw new Error("Wallet already has a referral");
    }

    if (!input.referredWallet) {
      throw new Error("Referred wallet not found");
    }

    const referralWallet = await getWalletByReferralCode({
      referralCode: input.referredByCode,
      userId: input.userId,
    });

    if (!referralWallet) {
      throw new Error("Referral code wallet not found");
    }

    if (referralWallet.address === input.referredWallet.address) {
      throw new Error(
        "Referral code wallet cannot be the same as referred wallet",
      );
    }

    if (referralWallet.createdAt > input.referredWallet.createdAt) {
      throw new Error("Referral code wallet is newer than referred wallet");
    }

    return true;
  });
}

export async function handleSubmitWallet(input: {
  walletAddress: string;
  referredByCode?: string;
  userId: string;
}) {
  return withAuth(input.userId, async (session) => {
    try {
      const user = session.get("user");
      if (!user) throw new Error("No user in session");

      // Verify user can only submit their own wallet
      if (input.walletAddress !== user.wallet.address) {
        throw new AppError(
          "Unauthorized: You can only submit your own wallet",
          ErrorCodes.UNAUTHORIZED,
          401,
        );
      }

      // Parse input
      const parsedReferredByCode = input.referredByCode
        ? referredBySchema.parse({
            referredByCode: input.referredByCode,
          })
        : undefined;

      const parsedWalletAddress = walletAddressSchema.parse({
        address: input.walletAddress,
      });

      // Get existing wallet
      const existingWallet = await getWallet({
        address: parsedWalletAddress.address,
        userId: input.userId,
      });

      // if wallet doesn't exist, create it
      if (!existingWallet) {
        const newWallet = await createWallet({
          address: parsedWalletAddress.address,
          userId: input.userId,
        });
        if (!newWallet) {
          throw new Error("Failed to create wallet");
        }

        // if referral code is provided, create referral
        if (parsedReferredByCode?.referredByCode) {
          const referralWallet = await getWalletByReferralCode({
            referralCode: parsedReferredByCode.referredByCode,
            userId: input.userId,
          });

          if (!referralWallet) {
            throw new Error("Referral code wallet not found");
          }

          await isValidReferralCode({
            referredByCode: parsedReferredByCode.referredByCode,
            referredWallet: newWallet as WalletWithReferredBy,
            userId: input.userId,
          });
          await createReferral({
            referredByCode: parsedReferredByCode.referredByCode,
            referredWalletAddress: newWallet.address,
            userId: input.userId,
          });
        }

        return newWallet;
      } else {
        if (
          parsedReferredByCode?.referredByCode &&
          !existingWallet.referredBy
        ) {
          const referralWallet = await getWalletByReferralCode({
            referralCode: parsedReferredByCode.referredByCode,
            userId: input.userId,
          });

          if (!referralWallet) {
            throw new Error("Referral code wallet not found");
          }

          await isValidReferralCode({
            referredByCode: parsedReferredByCode.referredByCode,
            referredWallet: existingWallet as WalletWithReferredBy,
            userId: input.userId,
          });
          await createReferral({
            referredByCode: parsedReferredByCode.referredByCode,
            referredWalletAddress: existingWallet.address,
            userId: input.userId,
          });
        } else if (
          parsedReferredByCode?.referredByCode &&
          existingWallet.referredBy
        ) {
          throw new Error("Wallet already has a referral code");
        }
        return existingWallet;
      }
    } catch (error) {
      const currentUser = await getCurrentUser(input.userId);
      log.error(error, {
        entity: "WALLET",
        operation: "submit_wallet",
        currentUser,
        input,
      });

      if (error instanceof z.ZodError) {
        throw new Error(
          "Invalid wallet address. Must be a valid Solana or Ethereum address.",
        );
      }

      throw new Error(
        `Failed to submit wallet: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
}

export async function updateReferralCode(input: {
  walletAddress: string;
  referralCode: string;
  userId: string;
}) {
  return withAuth(input.userId, async (session) => {
    try {
      const user = session.get("user");
      if (!user) throw new Error("No user in session");

      log.info("Updating referral code", {
        entity: "WALLET",
        operation: "update_referral_code",
        user,
        input,
      });

      if (user.wallet.address !== input.walletAddress) {
        throw new Error("Unauthorized: You can only update your own wallet");
      }

      const wallet = await getWallet({
        address: input.walletAddress,
        userId: input.userId,
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      if (wallet.referralCode) {
        throw new Error("Wallet already has a referral code");
      }

      const walletWithReferralCode = await getWalletByReferralCode({
        referralCode: input.referralCode,
        userId: input.userId,
      });

      if (walletWithReferralCode) {
        throw new Error("Referral code already exists");
      }

      const parsedReferralCode = referralCodeSchema.parse({
        referralCode: input.referralCode,
      });

      const updatedWallet = await db
        .update(walletTable)
        .set({ referralCode: parsedReferralCode.referralCode })
        .where(eq(walletTable.address, input.walletAddress))
        .returning();

      log.info("Referral code updated successfully", {
        entity: "WALLET",
        operation: "update_referral_code",
        user,
        input,
        updatedWallet,
      });

      return updatedWallet;
    } catch (error) {
      const currentUser = await getCurrentUser(input.userId);
      log.error(error, {
        entity: "WALLET",
        operation: "update_referral_code",
        currentUser,
        input,
      });

      throw new Error(
        `Failed to update referral code: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
}
