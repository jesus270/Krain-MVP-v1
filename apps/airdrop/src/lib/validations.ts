import { z } from "zod";
import { isValidSolanaAddress } from "@repo/utils";

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
  referredByCode: z.string().min(6).max(6),
  referredWalletAddress: z
    .string()
    .refine((val) => isValidSolanaAddress(val), "Invalid Solana address"),
});
