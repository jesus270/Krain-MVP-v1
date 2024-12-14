import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PublicKey } from "@solana/web3.js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return false;
  }
}
