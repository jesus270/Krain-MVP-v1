// Mock auth module first
jest.mock("../../lib/auth", () => ({
  getPrivyUser: jest.fn().mockImplementation(async () => ({
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  })),
}));

import { createWallet, getWallet, handleSubmitWallet } from "../wallet";
import { simulateServerAction } from "../../lib/test-utils";

describe("Wallet Actions Security", () => {
  const mockUser = {
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  };

  const expectedWallet = {
    address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
    referralCode: "TEST12",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
  };

  describe("createWallet", () => {
    it("should create a wallet successfully with valid data", async () => {
      const { error, data } = await simulateServerAction(
        createWallet,
        [{ address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(expectedWallet);
    });

    it("should reject unauthorized wallet creation", async () => {
      const { error, data } = await simulateServerAction(
        createWallet,
        [{ address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz" }],
        { mockUser },
      );

      expect(error?.message).toContain(
        "You can only create a wallet for your own address",
      );
      expect(data).toBeUndefined();
    });
  });

  describe("getWallet", () => {
    it("should return wallet for valid requests", async () => {
      const { error, data } = await simulateServerAction(
        getWallet,
        [{ address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(expectedWallet);
    });

    it("should reject unauthorized wallet access", async () => {
      const { error, data } = await simulateServerAction(
        getWallet,
        [{ address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz" }],
        { mockUser },
      );

      expect(error?.message).toContain("You can only access your own wallet");
      expect(data).toBeUndefined();
    });
  });

  describe("handleSubmitWallet", () => {
    it("should submit wallet successfully with valid data", async () => {
      const formData = new FormData();
      formData.append(
        "address",
        "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      );
      formData.append("referredByCode", "TEST12");

      const { error, data } = await simulateServerAction(
        handleSubmitWallet,
        [formData],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(expectedWallet);
    });

    it("should reject invalid referral codes", async () => {
      const formData = new FormData();
      formData.append(
        "address",
        "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      );
      formData.append("referredByCode", "12345");

      const { error, data } = await simulateServerAction(
        handleSubmitWallet,
        [formData],
        { mockUser },
      );

      expect(error?.message).toContain(
        "String must contain exactly 6 character(s)",
      );
      expect(data).toBeUndefined();
    });
  });
});
