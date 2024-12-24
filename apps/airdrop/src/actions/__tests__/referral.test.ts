// Mock database client first
jest.mock("@repo/database/client", () => ({
  db: jest.requireMock("@/lib/__mocks__/database").mockDatabase.db,
}));

// Mock database module
jest.mock("@repo/database", () => {
  const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase;
  return {
    ...jest.requireActual("@repo/database"),
    db: mockDb.db,
    walletTable: mockDb.walletTable,
    referralTable: mockDb.referralTable,
    eq: mockDb.eq,
    count: mockDb.count,
    sql: mockDb.sql,
  };
});

// Mock auth module with ability to return null user
jest.mock("@/lib/auth", () => ({
  getPrivyUser: jest.fn().mockImplementation(async () => ({
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  })),
}));

// Mock validation schema
jest.mock("@/lib/validations", () => ({
  referralSchema: {
    parse: jest.fn((input) => {
      if (
        !input ||
        !input.referredByCode ||
        input.referredByCode.length !== 6
      ) {
        throw new Error("String must contain exactly 6 character(s)");
      }
      if (
        !input.referredWalletAddress ||
        !input.referredWalletAddress.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)
      ) {
        throw new Error("Invalid Solana address");
      }
      return input;
    }),
  },
}));

// Mock console.error and console.log before tests
const originalConsoleError = console.error;
const originalConsoleLog = console.log;
beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
});

import { createReferral, getReferralsCount } from "../referral";
import { simulateServerAction } from "@/lib/__tests__/test-utils";
import { mockReferral } from "@/lib/__mocks__/database";
import { getPrivyUser } from "@/lib/auth";

describe("Referral Actions Security", () => {
  const mockUser = {
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("createReferral", () => {
    it("should create a referral successfully with valid data", async () => {
      const input = {
        referredByCode: "TEST12",
        referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      };

      // Mock the database insert to return a proper referral
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.insert.mockImplementationOnce((table: unknown) => ({
        values: jest.fn().mockImplementation((values: unknown) => ({
          returning: jest.fn().mockResolvedValue([
            {
              id: 1,
              referredByCode: input.referredByCode,
              referredWalletAddress: input.referredWalletAddress,
              createdAt: new Date("2024-01-01T00:00:00.000Z"),
              updatedAt: new Date("2024-01-01T00:00:00.000Z"),
            },
          ]),
        })),
      }));

      const { error, data } = await simulateServerAction(
        createReferral,
        [input],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toMatchObject({
        id: 1,
        referredByCode: input.referredByCode,
        referredWalletAddress: input.referredWalletAddress,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should reject invalid referral codes", async () => {
      const input = {
        referredByCode: "12345",
        referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      };

      const { error, data } = await simulateServerAction(
        createReferral,
        [input],
        { mockUser },
      );

      expect(error?.message).toContain(
        "String must contain exactly 6 character(s)",
      );
      expect(data).toBeUndefined();
    });

    it("should reject unauthorized referrals", async () => {
      const input = {
        referredByCode: "TEST12",
        referredWalletAddress: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz",
      };

      const { error, data } = await simulateServerAction(
        createReferral,
        [input],
        { mockUser },
      );

      expect(error?.message).toContain(
        "can only create referrals for your own wallet",
      );
      expect(data).toBeUndefined();
    });

    it("should reject unauthenticated users", async () => {
      // Mock getPrivyUser to return null for this test
      (getPrivyUser as jest.Mock).mockImplementationOnce(() => null);

      const input = {
        referredByCode: "TEST12",
        referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      };

      const { error, data } = await simulateServerAction(
        createReferral,
        [input],
        { mockUser: null },
      );

      expect(error?.message).toContain("Unauthorized: Please log in first");
      expect(data).toBeUndefined();
    });

    it("should reject invalid wallet addresses", async () => {
      const input = {
        referredByCode: "TEST12",
        referredWalletAddress: "invalid-wallet-address",
      };

      const { error, data } = await simulateServerAction(
        createReferral,
        [input],
        {
          mockUser: {
            id: "test-user",
            wallet: { address: "invalid-wallet-address" },
          },
        },
      );

      expect(error?.message).toContain("Invalid Solana address");
      expect(data).toBeUndefined();
    });

    it("should handle database errors gracefully", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.insert.mockImplementationOnce(() => {
        throw new Error("Database connection error");
      });

      const input = {
        referredByCode: "TEST12",
        referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      };

      const { error, data } = await simulateServerAction(
        createReferral,
        [input],
        { mockUser },
      );

      expect(error?.message).toContain(
        "Failed to create referral: Database connection error",
      );
      expect(data).toBeUndefined();
    });
  });

  describe("getReferralsCount", () => {
    it("should return referral count for valid requests", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.select.mockImplementationOnce(() => ({
        from: jest.fn().mockImplementation(() => ({
          where: jest.fn().mockResolvedValue([{ count: 1n }]),
        })),
      }));

      const { error, data } = await simulateServerAction(
        getReferralsCount,
        [{ referralCode: "TEST12" }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toBe(1);
    }, 15000);

    it("should reject invalid referral codes", async () => {
      const { error, data } = await simulateServerAction(
        getReferralsCount,
        [{ referralCode: "12345" }],
        { mockUser },
      );

      expect(error?.message).toContain(
        "String must contain exactly 6 character(s)",
      );
      expect(data).toBeUndefined();
    });

    it("should reject unauthenticated users", async () => {
      (getPrivyUser as jest.Mock).mockImplementationOnce(() => null);

      const { error, data } = await simulateServerAction(
        getReferralsCount,
        [{ referralCode: "TEST12" }],
        { mockUser: null },
      );

      expect(error?.message).toContain("Unauthorized: Please log in first");
      expect(data).toBeUndefined();
    });

    it("should handle database errors gracefully", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.select.mockImplementationOnce(() => {
        throw new Error("Database connection error");
      });

      const { error, data } = await simulateServerAction(
        getReferralsCount,
        [{ referralCode: "TEST12" }],
        { mockUser },
      );

      expect(error?.message).toContain(
        "Failed to get referrals count: Database connection error",
      );
      expect(data).toBeUndefined();
    });
  });
});
