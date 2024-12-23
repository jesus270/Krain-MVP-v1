// Mock auth module first
jest.mock("../../lib/auth", () => ({
  getPrivyUser: jest.fn().mockImplementation(async () => ({
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  })),
}));

import { createWallet, getWallet } from "../wallet";
import { simulateServerAction } from "../../lib/test-utils";
import { mockWallet } from "../../lib/__mocks__/database";

describe("Wallet Actions Security", () => {
  const mockUser = {
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  };

  describe("createWallet", () => {
    it("should create a wallet successfully with valid data", async () => {
      const { error, data } = await simulateServerAction(
        createWallet,
        [{ address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(mockWallet);
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
      expect(data).toEqual(mockWallet);
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
});
