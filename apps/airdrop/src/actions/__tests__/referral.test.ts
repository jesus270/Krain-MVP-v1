import { simulateServerAction } from "../../lib/test-utils";
import { createReferral, getReferralsCount } from "../referral";

describe("Referral Actions Security", () => {
  const mockUser = {
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  };

  const mockReferral = {
    id: 1,
    referredByCode: "TEST12",
    referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
    createdAt: expect.any(Date),
  };

  describe("createReferral", () => {
    it("should reject unauthenticated requests", async () => {
      const { error } = await simulateServerAction(
        createReferral,
        [
          {
            referredByCode: "TEST12",
            referredWalletAddress:
              "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
          },
        ],
        { authenticated: false },
      );
      expect(error?.message).toContain("Unauthorized");
    }, 30000);

    it("should reject referrals for other wallets", async () => {
      const { error } = await simulateServerAction(
        createReferral,
        [
          {
            referredByCode: "TEST12",
            referredWalletAddress:
              "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz",
          },
        ],
        { mockUser },
      );
      expect(error?.message).toContain(
        "can only create referrals for your own wallet",
      );
    }, 30000);

    it("should validate referral code format", async () => {
      const { error } = await simulateServerAction(
        createReferral,
        [
          {
            referredByCode: "12345",
            referredWalletAddress:
              "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
          },
        ],
        { mockUser },
      );
      expect(error?.message).toContain(
        "String must contain at least 6 character(s)",
      );
    }, 30000);

    it("should create a referral successfully with valid data", async () => {
      const { data, error } = await simulateServerAction(
        createReferral,
        [
          {
            referredByCode: "TEST12",
            referredWalletAddress:
              "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
          },
        ],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(mockReferral);
    }, 30000);
  });

  describe("getReferralsCount", () => {
    it("should reject unauthenticated requests", async () => {
      const { error } = await simulateServerAction(
        getReferralsCount,
        ["TEST12"],
        { authenticated: false },
      );
      expect(error?.message).toContain("Unauthorized");
    }, 30000);

    it("should reject invalid referral codes", async () => {
      const { error } = await simulateServerAction(
        getReferralsCount,
        ["12345"],
        { mockUser },
      );
      expect(error?.message).toContain("Invalid referral code");
    }, 30000);

    it("should return referral count for valid requests", async () => {
      const { data, error } = await simulateServerAction(
        getReferralsCount,
        ["TEST12"],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toBe(1);
    }, 30000);
  });
});
