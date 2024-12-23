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
import { mockReferral } from "../../lib/__mocks__/database";

describe("Referral Actions Security", () => {
  const mockUser = {
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  };

  describe("createReferral", () => {
    it("should create a referral successfully with valid data", async () => {
      const { error, data } = await simulateServerAction(
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
    });

    it("should reject invalid referral codes", async () => {
      const { error, data } = await simulateServerAction(
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
      expect(data).toBeUndefined();
    });

    it("should reject unauthorized referrals", async () => {
      const { error, data } = await simulateServerAction(
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
      expect(data).toBeUndefined();
    });
  });

  describe("getReferralsCount", () => {
    it("should return referral count for valid requests", async () => {
      const { error, data } = await simulateServerAction(
        getReferralsCount,
        ["TEST12"],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toBe(1);
    });

    it("should reject invalid referral codes", async () => {
      const { error, data } = await simulateServerAction(
        getReferralsCount,
        ["12345"],
        { mockUser },
      );

      expect(error?.message).toContain("Invalid referral code");
      expect(data).toBeUndefined();
    });
  });
});
