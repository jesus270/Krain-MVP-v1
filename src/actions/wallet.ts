"use server";

import { db } from "@/db";
import { Referral, Wallet, walletTable } from "@/db/schema";
import { isValidSolanaAddress } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { createReferral } from "./referral";

export const createWallet = async ({ address }: { address: string }) => {
  if (!isValidSolanaAddress(address)) {
    throw new Error("Invalid Solana address");
  }

  const wallet = await db.insert(walletTable).values({
    address,
  });

  return wallet;
};

export interface WalletWithReferrals extends Wallet {
  referredBy: Referral;
  referrals: Referral[];
}

export const getWallet = async ({
  address,
  referralCode,
}: {
  address?: string;
  referralCode?: string;
}): Promise<WalletWithReferrals | undefined> => {
  const where = address
    ? eq(walletTable.address, address)
    : referralCode
      ? eq(walletTable.referralCode, referralCode)
      : undefined;
  const wallet = await db.query.walletTable.findFirst({
    where,
    with: {
      referredBy: true,
      referrals: true,
    },
  });
  return wallet;
};

export const updateWalletReferredByCode = async (
  address: string,
  referredByCode: string
): Promise<WalletWithReferrals | undefined> => {
  const wallet = await getWallet({ address });
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

  const walletWithReferrals = await getWallet({ address });
  return walletWithReferrals;
};

export interface HandleSubmitWalletRequest {
  address: string;
  referredByCode?: string;
}

export interface HandleSubmitWalletResponse {
  status: "success" | "error";
  message: string;
  data: WalletWithReferrals | undefined;
}

export async function handleSubmitWallet({
  address,
  referredByCode,
}: HandleSubmitWalletRequest): Promise<HandleSubmitWalletResponse> {
  console.log("handleSubmitWallet received", { address, referredByCode });
  try {
    if (!isValidSolanaAddress(address)) {
      return {
        status: "error",
        message: "Invalid Solana address",
        data: undefined,
      };
    }
    console.log("handleSubmitWallet isValidSolanaAddress true");

    const existingWallet = await getWallet({ address });
    if (existingWallet) {
      console.log("handleSubmitWallet existingWallet", existingWallet);

      if (existingWallet?.referredBy?.referredByCode) {
        const response: HandleSubmitWalletResponse = {
          status: "success",
          message: "Wallet already exists and Referral already exists",
          data: existingWallet,
        };
        console.log("handleSubmitWallet response", response);
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
          console.log("handleSubmitWallet response", response);
          return response;
        } else {
          console.log(
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
            console.log("handleSubmitWallet response", response);
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
            console.log("handleSubmitWallet response", response);
            return response;
          }
        }
      } else {
        const response: HandleSubmitWalletResponse = {
          status: "success",
          message: "Wallet already exists",
          data: existingWallet,
        };
        console.log("handleSubmitWallet response", response);
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
          console.log("handleSubmitWallet response", response);
          return response;
        }
        await createReferral({
          referredByCode,
          referredWalletAddress: address,
        });
      }
      const newWalletWithReferrals = await getWallet({ address });
      const response: HandleSubmitWalletResponse = {
        status: "success",
        message: "Wallet added successfully",
        data: newWalletWithReferrals,
      };
      console.log("handleSubmitWallet response", response);
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
    console.log("handleSubmitWallet response", response);
    return response;
  }
}
