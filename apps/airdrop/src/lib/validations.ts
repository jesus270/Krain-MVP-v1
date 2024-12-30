import { z } from "zod";
import { isValidSolanaAddress } from "@krain/utils";

export const walletSchema = z.object({
  address: z
    .string()
    .refine((val) => isValidSolanaAddress(val), "Invalid Solana address"),
});

export const walletSubmitSchema = z.object({
  address: z
    .string()
    .refine((val) => isValidSolanaAddress(val), "Invalid Solana address"),
  referredByCode: z.string().min(6).max(6).optional(),
});

export const referralSchema = z.object({
  referredByCode: z.string().length(6),
  referredWalletAddress: z
    .string()
    .refine((address) => isValidSolanaAddress(address), {
      message: "Invalid Solana address",
    }),
});

export const referralCodeSchema = z.object({
  referralCode: z.string().length(6),
});

export type ReferralInput = z.infer<typeof referralSchema>;
export type ReferralCodeInput = z.infer<typeof referralCodeSchema>;
