"use server";

import { db, Referral, Wallet, walletTable } from "database";
import { isValidSolanaAddress } from "utils";
import { eq } from "drizzle-orm";
import { createReferral, getReferralsCount } from "./referral";

export const createWallet = async ({ address }: { address: string }) => {
  if (!isValidSolanaAddress(address)) {
    throw new Error("Invalid Solana address");
  }

  const wallet = await db.insert(walletTable).values({
    address,
  });

  return wallet;
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
  const where = address
    ? eq(walletTable.address, address)
    : referralCode
      ? eq(walletTable.referralCode, referralCode)
      : undefined;

  const wallet = await db.query.walletTable.findFirst({
    where,
    with: {
      ...(includes?.referredBy ? { referredBy: true } : {}),
      ...(includes?.referrals ? { referrals: true } : {}),
    },
  });

  if (!wallet) {
    return undefined;
  }

  const result = {
    ...wallet,
    referredBy: includes?.referredBy ? wallet.referredBy : undefined,
    referrals: includes?.referrals ? wallet.referrals : undefined,
  } as unknown as WalletWithIncludes<T>;

  if (includes?.referralsCount) {
    const referralsCount = await getReferralsCount(wallet.referralCode);
    result.referralsCount = referralsCount;
  }

  return result;
};

export const updateWalletReferredByCode = async (
  address: string,
  referredByCode: string
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
  console.info("handleSubmitWallet received", { address, referredByCode });
  try {
    if (!isValidSolanaAddress(address)) {
      return {
        status: "error",
        message: "Invalid Solana address",
        data: undefined,
      };
    }
    console.info("handleSubmitWallet isValidSolanaAddress true");

    const existingWallet = await getWallet({
      address,
      with: { referredBy: true },
    });
    if (existingWallet) {
      console.info("handleSubmitWallet existingWallet", existingWallet);

      if (existingWallet?.referredBy?.referredByCode) {
        const response: HandleSubmitWalletResponse = {
          status: "success",
          message: "Wallet already exists and Referral already exists",
          data: existingWallet,
        };
        console.info("handleSubmitWallet response", response);
        return response;
      } else if (
        referredByCode &&
        !existingWallet?.referredBy?.referredByCode &&
        referredByCode !== existingWallet?.referralCode
      ) {
        const existingReferredByWallet = await getWallet({
          referralCode: referredByCode,
        });

        if (!existingReferredByWallet) {
          const response: HandleSubmitWalletResponse = {
            status: "error",
            message: "Referral code not found",
            data: undefined,
          };
          console.info("handleSubmitWallet response", response);
          return response;
        } else {
          console.info(
            "handleSubmitWallet existingReferredByWallet",
            existingReferredByWallet
          );
          // check if the referredByWallet was created after the existingWallet
          if (existingReferredByWallet.createdAt > existingWallet.createdAt) {
            const response: HandleSubmitWalletResponse = {
              status: "error",
              message: "Referral code was created after the wallet",
              data: existingWallet,
            };
            console.info("handleSubmitWallet response", response);
            return response;
          } else {
            const updatedWallet = await updateWalletReferredByCode(
              address,
              referredByCode
            );
            const response: HandleSubmitWalletResponse = {
              status: "success",
              message: "Wallet referred by code updated successfully",
              data: updatedWallet,
            };
            console.info("handleSubmitWallet response", response);
            return response;
          }
        }
      } else {
        const response: HandleSubmitWalletResponse = {
          status: "success",
          message: "Wallet already exists",
          data: existingWallet,
        };
        console.info("handleSubmitWallet response", response);
        return response;
      }
    } else {
      await createWallet({ address });
      if (referredByCode) {
        const existingReferredByWallet = await getWallet({
          referralCode: referredByCode,
        });
        if (!existingReferredByWallet) {
          const response: HandleSubmitWalletResponse = {
            status: "error",
            message: "Referral code not found",
            data: undefined,
          };
          console.info("handleSubmitWallet response", response);
          return response;
        }
        await createReferral({
          referredByCode,
          referredWalletAddress: address,
        });
      }
      const newWallet = await getWallet({
        address,
        with: { referredBy: true },
      });
      const response: HandleSubmitWalletResponse = {
        status: "success",
        message: "Wallet added successfully",
        data: newWallet,
      };
      console.info("handleSubmitWallet response", response);
      return response;
    }
  } catch (e) {
    const error = e as Error;
    console.error(error);
    const response: HandleSubmitWalletResponse = {
      status: "error",
      message: error.message,
      data: undefined,
    };
    console.info("handleSubmitWallet response", response);
    return response;
  }
}
