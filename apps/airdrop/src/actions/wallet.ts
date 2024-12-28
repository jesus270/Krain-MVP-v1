"use server";

import { z } from "zod";
import { db, Wallet, walletTable } from "@repo/database";
import { getCurrentUser } from "../lib/auth";
import { eq } from "drizzle-orm";
import { generateReferralCode, isValidSolanaAddress } from "@repo/utils";
import { createReferral } from "./referral";
import { cookies } from "next/headers";
import { log, AppError, ErrorCodes, createUserContext } from "../lib/logger";

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
    const user = await getCurrentUser(await cookies());
    if (!user) {
      throw new AppError(
        "Unauthorized: Please log in first",
        ErrorCodes.UNAUTHORIZED,
        401,
      );
    }

    // Validate input
    const parsed = walletAddressSchema.parse(input);

    // Verify user can only create wallet for their own address
    if (parsed.address !== user.walletAddress) {
      throw new AppError(
        "Unauthorized: You can only create a wallet for your own address",
        ErrorCodes.UNAUTHORIZED,
        401,
      );
    }

    log.info("Creating new wallet", {
      operation: "create_wallet",
      entity: "WALLET",
      ...createUserContext(user),
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
      ...createUserContext(user),
      entity: "WALLET",
      walletAddress: parsed.address,
      referralCode: wallet?.[0]?.referralCode,
    });

    return wallet[0];
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    log.error(error, {
      operation: "create_wallet",
      entity: "WALLET",
      ...createUserContext(await getCurrentUser(await cookies())),
      inputAddress: input.address,
    });

    throw new AppError("Failed to create wallet", ErrorCodes.WALLET_ERROR, 500);
  }
}

export async function getWalletByReferralCode(input: { referralCode: string }) {
  try {
    const user = await getCurrentUser(await cookies());
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    const parsed = referralCodeSchema.parse(input);

    const wallet = await db.query.walletTable.findFirst({
      where: eq(walletTable.referralCode, parsed.referralCode),
    });

    if (!wallet) {
      return undefined;
    }

    return wallet;
  } catch (error) {
    log.error(error, {
      entity: "WALLET",
      operation: "get_wallet_by_referral_code",
      ...createUserContext(await getCurrentUser(await cookies())),
      input,
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
    const user = await getCurrentUser(await cookies());
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    // Validate input
    const parsed = walletAddressSchema.parse(input);

    // Verify user can only access their own wallet
    if (parsed.address !== user.walletAddress) {
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
    log.error(error, {
      entity: "WALLET",
      operation: "get_wallet",
      ...createUserContext(await getCurrentUser(await cookies())),
      input,
    });

    if (error instanceof z.ZodError) {
      throw new Error("Invalid Solana address");
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
  const user = await getCurrentUser(await cookies());
  if (!user) {
    throw new Error("Unauthorized: Please log in first");
  }

  if (input.referredWallet.address !== user.walletAddress) {
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
    const user = await getCurrentUser(await cookies());
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
    log.error(error, {
      entity: "WALLET",
      operation: "submit_wallet",
      ...createUserContext(await getCurrentUser(await cookies())),
      input,
    });

    if (error instanceof z.ZodError) {
      throw new Error("Invalid Solana address");
    }

    throw new Error(
      `Failed to submit wallet: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function updateReferralCode(input: {
  walletAddress: string;
  referralCode: string;
}) {
  try {
    log.info("Updating referral code", {
      entity: "WALLET",
      operation: "update_referral_code",
      ...createUserContext(await getCurrentUser(await cookies())),
      input,
    });
    // Check authentication first
    const user = await getCurrentUser(await cookies());
    if (!user) {
      throw new Error("Unauthorized: Please log in first");
    }

    const wallet = await getWallet({ address: input.walletAddress });
    const walletWithReferralCode = await getWalletByReferralCode({
      referralCode: input.referralCode,
    });

    if (!wallet) {
      throw new Error("Wallet not found");
    }

    if (wallet.referralCode) {
      throw new Error("Wallet already has a referral code");
    }

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
      ...createUserContext(await getCurrentUser(await cookies())),
      input,
      updatedWallet,
    });
    return updatedWallet;
  } catch (error) {
    log.error(error, {
      entity: "WALLET",
      operation: "update_referral_code",
      ...createUserContext(await getCurrentUser(await cookies())),
      input,
    });

    throw new Error(
      `Failed to update referral code: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
