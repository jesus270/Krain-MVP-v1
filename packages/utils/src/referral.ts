export function generateReferralCode(length: number = 6): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join("");
}
