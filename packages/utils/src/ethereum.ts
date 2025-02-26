/**
 * Validates if a string is a valid Ethereum address
 * @param address The address to validate
 * @returns boolean indicating if the address is valid
 */
export function isValidEthereumAddress(address: string): boolean {
  // Check if address matches Ethereum address format (0x followed by 40 hex characters)
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
