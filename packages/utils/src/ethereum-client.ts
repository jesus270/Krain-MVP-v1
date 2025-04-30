import { isAddress } from "ethers";

/**
 * Validates if a string is a valid Ethereum address using ethers.js for robustness.
 * @param address The address string to validate.
 * @returns boolean indicating if the address is valid.
 */
export function isValidEthereumAddress(
  address: string | null | undefined,
): boolean {
  if (!address) return false;
  try {
    // ethers.isAddress handles checksums and basic format validation.
    return isAddress(address);
  } catch (e) {
    // isAddress might throw for fundamentally invalid formats, catch just in case.
    return false;
  }
}
