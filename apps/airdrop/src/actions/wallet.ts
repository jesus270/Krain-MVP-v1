"use server";

import {
  db as baseDb,
  Referral,
  Wallet,
  walletTable,
  referralTable,
} from "@repo/database";
import { isValidSolanaAddress } from "@repo/utils";
import { eq } from "drizzle-orm";
import { createReferral, getReferralsCount } from "./referral";
import { db, executeWithRetry } from "../lib/db";

export const createWallet = async ({ address }: { address: string }) => {
  if (!isValidSolanaAddress(address)) {
    throw new Error("Invalid Solana address");
  }

  try {
    const wallet = await executeWithRetry(() =>
      db
        .insert(walletTable)
        .values({
          address,
        })
        .returning(),
    );

    if (!wallet || wallet.length === 0) {
      throw new Error("Failed to create wallet");
    }

    return wallet[0];
  } catch (error) {
    console.error("Error creating wallet:", error);
    throw error;
  }
};

export interface GetWalletOptions {
  address?: string;
  referralCode?: string;
  with?: {
    referredBy?: boolean;
    referrals?: boolean;
    referralsCount?: boolean;
  };
}

type WalletWithIncludes<T extends GetWalletOptions["with"]> = Omit<
  Wallet,
  "referralsCount"
> & {
  referredBy: T extends { referredBy: true } ? Referral : undefined;
  referrals: T extends { referrals: true } ? Referral[] : undefined;
} & (T extends { referralsCount: true }
    ? { referralsCount: number }
    : { referralsCount?: never });

export const getWallet = async <T extends GetWalletOptions["with"]>({
  address,
  referralCode,
  with: includes,
}: Omit<GetWalletOptions, "with"> & { with?: T }): Promise<
  WalletWithIncludes<T> | undefined
> => {
  try {
    const where = address
      ? eq(walletTable.address, address)
      : referralCode
        ? eq(walletTable.referralCode, referralCode)
        : undefined;

    // Get wallet and referral in a single query if needed
    const query = db
      .select({
        address: walletTable.address,
        createdAt: walletTable.createdAt,
        referralCode: walletTable.referralCode,
        ...(includes?.referredBy
          ? {
              referralId: referralTable.id,
              referralCreatedAt: referralTable.createdAt,
              referralUpdatedAt: referralTable.updatedAt,
              referredByCode: referralTable.referredByCode,
              referredWalletAddress: referralTable.referredWalletAddress,
            }
          : {}),
      })
      .from(walletTable)
      .where(where || undefined);

    // Add left join for referral if needed
    if (includes?.referredBy) {
      query.leftJoin(
        referralTable,
        eq(referralTable.referredWalletAddress, walletTable.address),
      );
    }

    const result = await executeWithRetry(() =>
      query.limit(1).then((rows) => rows[0]),
    );

    if (!result) {
      return undefined;
    }

    // Extract referral data if it exists
    let referredBy: Referral | undefined;
    if (includes?.referredBy && result.referralId) {
      referredBy = {
        id: result.referralId,
        createdAt: result.referralCreatedAt ?? new Date(),
        updatedAt: result.referralUpdatedAt ?? new Date(),
        referredByCode: result.referredByCode ?? "",
        referredWalletAddress: result.referredWalletAddress ?? "",
      };
    }

    const wallet = {
      address: result.address,
      createdAt: result.createdAt,
      referralCode: result.referralCode,
    };

    // Prepare all additional data fetches in parallel
    const additionalDataPromises: Promise<any>[] = [];

    if (includes?.referralsCount) {
      additionalDataPromises.push(
        executeWithRetry(() => getReferralsCount(wallet.referralCode)).catch(
          (error) => {
            console.error("Error getting referrals count:", error);
            return 0;
          },
        ),
      );
    }

    if (includes?.referrals) {
      additionalDataPromises.push(
        executeWithRetry(() =>
          db
            .select()
            .from(referralTable)
            .where(eq(referralTable.referredByCode, wallet.referralCode)),
        ).catch((error) => {
          console.error("Error getting referrals:", error);
          return [];
        }),
      );
    }

    // Wait for all additional data
    const [referralsCount, referrals] = await Promise.all(
      additionalDataPromises,
    );

    const finalResult = {
      ...wallet,
      referredBy: includes?.referredBy ? referredBy : undefined,
      referrals: includes?.referrals ? referrals : undefined,
      ...(includes?.referralsCount ? { referralsCount } : {}),
    } as unknown as WalletWithIncludes<T>;

    return finalResult;
  } catch (error) {
    console.error("Error in getWallet:", error);
    throw error;
  }
};

export const updateWalletReferredByCode = async (
  address: string,
  referredByCode: string,
): Promise<WalletWithIncludes<{ referredBy: true }> | undefined> => {
  const wallet = await getWallet({ address, with: { referredBy: true } });
  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (wallet?.referredBy?.referredByCode) {
    throw new Error("Wallet already has a referral code");
  }

  const referredByWallet = await getWallet({
    referralCode: referredByCode,
  });

  if (!referredByWallet) {
    throw new Error("Referral code not found");
  }

  await createReferral({
    referredByCode: referredByWallet.referralCode,
    referredWalletAddress: address,
  });

  const updatedWallet = await getWallet({
    address,
    with: { referredBy: true },
  });
  return updatedWallet;
};

export interface HandleSubmitWalletRequest {
  address: string;
  referredByCode?: string;
}

export interface HandleSubmitWalletResponse {
  status: "success" | "error";
  message: string;
  data: WalletWithIncludes<{ referredBy: true }> | undefined;
}

export async function handleSubmitWallet({
  address,
  referredByCode,
}: HandleSubmitWalletRequest): Promise<HandleSubmitWalletResponse> {
  try {
    if (!isValidSolanaAddress(address)) {
      return {
        status: "error",
        message: "Invalid Solana address",
        data: undefined,
      };
    }

    // Get both wallets in parallel if needed
    const [existingWallet, referredByWallet] = await Promise.all([
      getWallet({ address, with: { referredBy: true } }).catch(() => undefined),
      referredByCode
        ? getWallet({ referralCode: referredByCode }).catch(() => undefined)
        : Promise.resolve(undefined),
    ]);

    // Handle existing wallet case
    if (existingWallet) {
      // Already has a referral
      if (existingWallet?.referredBy?.referredByCode) {
        return {
          status: "success",
          message: "Wallet already exists and Referral already exists",
          data: existingWallet,
        };
      }

      // No referral code provided or same as existing
      if (!referredByCode || referredByCode === existingWallet?.referralCode) {
        return {
          status: "success",
          message: "Wallet already exists",
          data: existingWallet,
        };
      }

      // Invalid referral code
      if (!referredByWallet) {
        return {
          status: "error",
          message: "Referral code not found",
          data: undefined,
        };
      }

      // Referral code created after wallet
      if (referredByWallet.createdAt > existingWallet.createdAt) {
        return {
          status: "error",
          message: "Referral code was created after the wallet",
          data: existingWallet,
        };
      }

      // Create referral and get updated wallet in parallel
      const [, updatedWallet] = await Promise.all([
        createReferral({
          referredByCode,
          referredWalletAddress: address,
        }).catch((error) => {
          console.error("Error creating referral:", error);
          return undefined;
        }),
        getWallet({
          address,
          with: { referredBy: true },
        }).catch(() => undefined),
      ]);

      if (!updatedWallet) {
        return {
          status: "error",
          message: "Failed to update wallet with referral",
          data: existingWallet,
        };
      }

      return {
        status: "success",
        message: "Wallet referred by code updated successfully",
        data: updatedWallet,
      };
    }

    // Handle new wallet case
    if (referredByCode && !referredByWallet) {
      return {
        status: "error",
        message: "Referral code not found",
        data: undefined,
      };
    }

    // Create new wallet and referral in parallel if needed
    const [newWallet, referral] = await Promise.all([
      createWallet({ address }).catch(() => undefined),
      referredByCode
        ? createReferral({
            referredByCode,
            referredWalletAddress: address,
          }).catch(() => undefined)
        : Promise.resolve(undefined),
    ]);

    if (!newWallet) {
      return {
        status: "error",
        message: "Failed to create wallet",
        data: undefined,
      };
    }

    // Get the final wallet state with referral
    const finalWallet = await getWallet({
      address,
      with: { referredBy: true },
    }).catch(() => undefined);

    if (!finalWallet) {
      return {
        status: "error",
        message: "Failed to get updated wallet",
        data: undefined,
      };
    }

    return {
      status: "success",
      message: "Wallet added successfully",
      data: finalWallet,
    };
  } catch (e) {
    const error = e as Error;
    console.error("Error in handleSubmitWallet:", error);
    return {
      status: "error",
      message: error.message,
      data: undefined,
    };
  }
}
