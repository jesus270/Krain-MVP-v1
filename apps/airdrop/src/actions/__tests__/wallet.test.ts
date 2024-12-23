import { simulateServerAction } from "../../lib/test-utils";
import { createWallet, getWallet, handleSubmitWallet } from "../wallet";

describe("Wallet Actions Security", () => {
  const mockUser = {
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  };

  const mockWallet = {
    id: 1,
    address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
    referralCode: "TEST12",
    createdAt: expect.any(Date),
  };

  describe("createWallet", () => {
    it("should reject unauthenticated requests", async () => {
      const { error } = await simulateServerAction(
        createWallet,
        [{ address: mockUser.wallet.address }],
        { authenticated: false },
      );
      expect(error?.message).toContain("Unauthorized");
    }, 30000);

    it("should reject requests for different wallet addresses", async () => {
      const { error } = await simulateServerAction(
        createWallet,
        [{ address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz" }],
        { mockUser },
      );
      expect(error?.message).toContain(
        "can only create a wallet for your own address",
      );
    }, 30000);

    it("should create a wallet successfully with valid data", async () => {
      const { data, error } = await simulateServerAction(
        createWallet,
        [{ address: mockUser.wallet.address }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(mockWallet);
    }, 30000);
  });

  describe("getWallet", () => {
    it("should reject unauthenticated requests", async () => {
      const { error } = await simulateServerAction(
        getWallet,
        [{ address: mockUser.wallet.address }],
        { authenticated: false },
      );
      expect(error?.message).toContain("Unauthorized");
    }, 30000);

    it("should reject requests for other users wallets", async () => {
      const { error } = await simulateServerAction(
        getWallet,
        [{ address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz" }],
        { mockUser },
      );
      expect(error?.message).toContain("can only access your own wallet");
    }, 30000);

    it("should return wallet for valid requests", async () => {
      const { data, error } = await simulateServerAction(
        getWallet,
        [{ address: mockUser.wallet.address }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toEqual(mockWallet);
    }, 30000);
  });

  describe("handleSubmitWallet", () => {
    it("should reject unauthenticated requests", async () => {
      const formData = new FormData();
      formData.append("address", mockUser.wallet.address);
      formData.append("referredByCode", "TEST12");

      const { error } = await simulateServerAction(
        handleSubmitWallet,
        [formData],
        { authenticated: false },
      );
      expect(error?.message).toContain("Unauthorized");
    }, 30000);

    it("should reject invalid referral codes", async () => {
      const formData = new FormData();
      formData.append("address", mockUser.wallet.address);
      formData.append("referredByCode", "12345");

      const { error } = await simulateServerAction(
        handleSubmitWallet,
        [formData],
        { mockUser },
      );
      expect(error?.message).toContain(
        "String must contain exactly 6 character(s)",
      );
    }, 30000);

    it("should submit wallet successfully with valid data", async () => {
      const formData = new FormData();
      formData.append("address", mockUser.wallet.address);
      formData.append("referredByCode", "TEST12");

      const { error } = await simulateServerAction(
        handleSubmitWallet,
        [formData],
        { mockUser },
      );

      expect(error).toBeUndefined();
    }, 30000);
  });
});
