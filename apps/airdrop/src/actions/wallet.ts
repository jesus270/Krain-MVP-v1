"use server";

import { z } from "zod";
import { db, referralTable, Wallet, walletTable } from "@repo/database";
import { getPrivyUser } from "../lib/auth";
import { eq } from "drizzle-orm";
import { generateReferralCode, isValidSolanaAddress } from "@repo/utils";
import { createReferral } from "./referral";

const walletAddressSchema = z.object({
  address: z.string().refine((address) => isValidSolanaAddress(address), {
    message: "Invalid Solana address",
  }),
});

const referralCodeSchema = z.object({
  referralCode: z.string().length(6),
});

const referredBySchema = z.object({
  referredByCode: z.string().length(6),
});

export async function createWallet(input: { address: string }) {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Validate input
    const parsed = walletAddressSchema.parse(input);

    // Verify user can only create wallet for their own address
    if (parsed.address !== user.wallet.address) {
      throw new Error(
        "Unauthorized: You can only create a wallet for your own address",
      );
    }

    // Create wallet
    const wallet = await db
      .insert(walletTable)
      .values({
        address: parsed.address,
        referralCode: generateReferralCode(),
      })
      .returning();

    return wallet[0];
  } catch (error) {
    console.error("[SERVER] Error creating wallet:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(`Failed to create wallet: Invalid Solana address`);
    }

    throw new Error(
      `Failed to create wallet: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function getWalletByReferralCode(input: { referralCode: string }) {
  try {
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    const parsed = referralCodeSchema.parse(input);

    const wallet = await db.query.walletTable.findFirst({
      where: eq(walletTable.referralCode, parsed.referralCode),
    });

    return wallet;
  } catch (error) {
    console.error("[SERVER] Error getting wallet by referral code:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error("String must contain exactly 6 character(s)");
    }

    throw new Error(
      `Failed to get referrals count: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export interface WalletWithReferredBy extends Wallet {
  referredBy: Wallet | null;
}

export async function getWallet(input: {
  address: string;
}): Promise<WalletWithReferredBy | undefined> {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

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
    console.error("[SERVER] Error getting wallet:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(`Failed to get wallet: Invalid Solana address`);
    }

    throw new Error(
      `Failed to get wallet: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function isValidReferralCode(input: {
  referredByCode: string;
  referredWallet: WalletWithReferredBy;
}) {
  const user = await getPrivyUser();
  if (!user) {
    throw new Error("Unauthorized: Please log in first");
  }

  if (input.referredWallet.address !== user.wallet.address) {
    throw new Error("Unauthorized: You can only check your own referral code");
  }

  if (input.referredWallet.referredBy) {
    throw new Error("Wallet already has a referral");
  }

  if (!input.referredWallet) {
    throw new Error("Referred wallet not found");
  }

  const referralWallet = await getWalletByReferralCode({
    referralCode: input.referredByCode,
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
}

export async function handleSubmitWallet(input: {
  walletAddress: string;
  referredByCode?: string;
}) {
  try {
    // Check authentication first
    const user = await getPrivyUser();
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
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
    });

    // if wallet doesn't exist, create it
    if (!existingWallet) {
      const newWallet = await createWallet({
        address: parsedWalletAddress.address,
      });
      if (!newWallet) {
        throw new Error("Failed to create wallet");
      }

      // if referral code is provided, create referral
      if (parsedReferredByCode?.referredByCode) {
        const referralWallet = await getWalletByReferralCode({
          referralCode: parsedReferredByCode.referredByCode,
        });

        if (!referralWallet) {
          throw new Error("Referral code wallet not found");
        }

        await isValidReferralCode({
          referredByCode: parsedReferredByCode.referredByCode,
          referredWallet: newWallet as WalletWithReferredBy,
        });
        await createReferral({
          referredByCode: parsedReferredByCode.referredByCode,
          referredWalletAddress: newWallet.address,
        });
      }

      return newWallet;
    } else {
      if (parsedReferredByCode?.referredByCode && !existingWallet.referredBy) {
        const referralWallet = await getWalletByReferralCode({
          referralCode: parsedReferredByCode.referredByCode,
        });

        if (!referralWallet) {
          throw new Error("Referral code wallet not found");
        }

        await isValidReferralCode({
          referredByCode: parsedReferredByCode.referredByCode,
          referredWallet: existingWallet as WalletWithReferredBy,
        });
        await createReferral({
          referredByCode: parsedReferredByCode.referredByCode,
          referredWalletAddress: existingWallet.address,
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
    console.error("[SERVER] Error handling wallet submission:", {
      error,
      input,
      stack: error instanceof Error ? error.stack : undefined,
    });

    if (error instanceof z.ZodError) {
      throw new Error(
        `Failed to submit wallet: ${JSON.stringify(error.errors, null, 2)}`,
      );
    }

    throw new Error(
      `Failed to submit wallet: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
