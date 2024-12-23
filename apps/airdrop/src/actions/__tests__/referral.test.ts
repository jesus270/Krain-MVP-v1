// Add TextEncoder polyfill
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock auth module first
jest.mock("../../lib/auth", () => ({
  getPrivyUser: jest.fn().mockImplementation(async () => ({
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  })),
}));

import { createReferral, getReferralsCount } from "../referral";
import { simulateServerAction } from "../../lib/test-utils";

describe("Referral Actions Security", () => {
  const mockUser = {
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  };

  const expectedReferral = {
    id: 1,
    referredByCode: "TEST12",
    referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
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
      expect(error?.message).toContain("Please log in first");
    });

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
    });

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
    });

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
      expect(data).toEqual(expectedReferral);
    });
  });

  describe("getReferralsCount", () => {
    it("should reject unauthenticated requests", async () => {
      const { error } = await simulateServerAction(
        getReferralsCount,
        ["TEST12"],
        { authenticated: false },
      );
      expect(error?.message).toContain("Please log in first");
    });

    it("should reject invalid referral codes", async () => {
      const { error } = await simulateServerAction(
        getReferralsCount,
        ["12345"],
        { mockUser },
      );
      expect(error?.message).toContain("Invalid referral code");
    });

    it("should return referral count for valid requests", async () => {
      // First create a referral
      await simulateServerAction(
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

      // Then check the count
      const { data, error } = await simulateServerAction(
        getReferralsCount,
        ["TEST12"],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toBe(1);
    });
  });
});
