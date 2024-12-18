import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { PublicKey } from "@solana/web3.js";

/**
 * Merges multiple class names or class value arrays using clsx and tailwind-merge.
 * Useful for combining Tailwind CSS classes conditionally while avoiding conflicts.
 * @param inputs - Array of class values (strings, objects, or arrays)
 * @returns Merged and optimized class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validates if a given string is a valid Solana public key address.
 * @param address - The string to validate as a Solana address
 * @returns boolean indicating if the address is valid
 * @example
 * isValidSolanaAddress("7EqQi...") // returns true
 * isValidSolanaAddress("invalid") // returns false
 */
export function isValidSolanaAddress(address: string): boolean {
  try {
    new PublicKey(address);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_error) {
    return false;
  }
}

/**
 * Generates a random referral code using unambiguous characters.
 * Excludes potentially confusing characters (0, O, 1, I, L) for better readability.
 * @param length - Length of the referral code (default: 6)
 * @returns A random referral code string
 * @example
 * generateReferralCode() // returns "X4M9PH"
 * generateReferralCode(4) // returns "B5NK"
 */
export function generateReferralCode(length: number = 6): string {
  // Use characters that are unambiguous (no 1/l, 0/O confusion)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}
