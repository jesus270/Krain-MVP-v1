import { createWallet, getWallet, handleSubmitWallet } from "../wallet";
import { simulateServerAction } from "../../lib/test-utils";

describe("Wallet Actions Security", () => {
  describe("createWallet", () => {
    it("should create a wallet successfully with valid data", async () => {
      const { error, data } = await simulateServerAction(createWallet, [
        { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
      ]);

      expect(error).toBeUndefined();
      expect(data).toEqual({
        id: 1,
        address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referralCode: "TEST12",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    }, 30000);

    it("should reject unauthorized wallet creation", async () => {
      const { error, data } = await simulateServerAction(
        createWallet,
        [{ address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz" }],
        { authenticated: false },
      );

      expect(error?.message).toContain("Unauthorized");
      expect(data).toBeUndefined();
    }, 30000);
  });

  describe("getWallet", () => {
    it("should return wallet for valid requests", async () => {
      const { error, data } = await simulateServerAction(getWallet, [
        { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
      ]);

      expect(error).toBeUndefined();
      expect(data).toEqual({
        id: 1,
        address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referralCode: "TEST12",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    }, 30000);

    it("should reject unauthorized wallet access", async () => {
      const { error, data } = await simulateServerAction(
        getWallet,
        [{ address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz" }],
        { authenticated: false },
      );

      expect(error?.message).toContain("Unauthorized");
      expect(data).toBeUndefined();
    }, 30000);
  });

  describe("handleSubmitWallet", () => {
    it("should submit wallet successfully with valid data", async () => {
      const formData = new FormData();
      formData.append(
        "address",
        "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      );
      formData.append("referredByCode", "TEST12");

      const { error, data } = await simulateServerAction(handleSubmitWallet, [
        formData,
      ]);

      expect(error).toBeUndefined();
      expect(data).toBeUndefined(); // handleSubmitWallet redirects on success
    }, 30000);

    it("should reject invalid referral codes", async () => {
      const formData = new FormData();
      formData.append(
        "address",
        "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      );
      formData.append("referredByCode", "12345");

      const { error, data } = await simulateServerAction(handleSubmitWallet, [
        formData,
      ]);

      expect(error?.message).toContain("Invalid");
      expect(data).toBeUndefined();
    }, 30000);
  });
});
