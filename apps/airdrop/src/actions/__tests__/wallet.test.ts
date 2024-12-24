// Mock database client first
jest.mock("@repo/database/client", () => ({
  db: jest.requireMock("@/lib/__mocks__/database").mockDatabase.db,
}));

// Mock auth module with ability to return null user
jest.mock("@/lib/auth", () => ({
  getPrivyUser: jest.fn().mockImplementation(async () => ({
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  })),
}));

// Mock validation schemas
jest.mock("@/lib/validations", () => ({
  walletAddressSchema: {
    parse: jest.fn((input) => {
      if (!input?.address?.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
        const error = new Error("Invalid Solana address");
        error.name = "ZodError";
        throw error;
      }
      return input;
    }),
  },
  referralCodeSchema: {
    parse: jest.fn((input) => {
      if (!input?.referralCode || input.referralCode.length !== 6) {
        const error = new Error("String must contain exactly 6 character(s)");
        error.name = "ZodError";
        throw error;
      }
      return input;
    }),
  },
  referredBySchema: {
    parse: jest.fn((input) => {
      if (!input?.referredByCode || input.referredByCode.length !== 6) {
        const error = new Error("String must contain exactly 6 character(s)");
        error.name = "ZodError";
        throw error;
      }
      return input;
    }),
  },
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

// Mock console.error before tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

import {
  createWallet,
  getWallet,
  handleSubmitWallet,
  getWalletByReferralCode,
  isValidReferralCode,
} from "../wallet";
import { simulateServerAction } from "@/lib/__tests__/test-utils";
import { mockWallet } from "@/lib/__mocks__/database";
import { getPrivyUser } from "@/lib/auth";

describe("Wallet Actions Security", () => {
  const mockUser = {
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("createWallet", () => {
    it("should create a wallet successfully with valid data", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.insert.mockImplementationOnce((table: unknown) => ({
        values: jest.fn().mockImplementation((values) => ({
          returning: jest.fn().mockResolvedValue([
            {
              id: 1,
              address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
              referralCode: "TEST12",
              createdAt: new Date("2024-01-01T00:00:00.000Z"),
              updatedAt: new Date("2024-01-01T00:00:00.000Z"),
            },
          ]),
        })),
      }));

      const { error, data } = await simulateServerAction(
        createWallet,
        [{ address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toMatchObject({
        id: 1,
        address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referralCode: "TEST12",
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it("should reject unauthorized wallet creation", async () => {
      const { error, data } = await simulateServerAction(
        createWallet,
        [{ address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz" }],
        { mockUser },
      );

      expect(error?.message).toContain(
        "Unauthorized: You can only create a wallet for your own address",
      );
      expect(data).toBeUndefined();
    });

    it("should reject unauthenticated users", async () => {
      // Mock getPrivyUser to return null for this test
      (getPrivyUser as jest.Mock).mockImplementationOnce(() => null);

      const { error, data } = await simulateServerAction(
        createWallet,
        [{ address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" }],
        { mockUser: null },
      );

      expect(error?.message).toContain("Unauthorized: Please log in first");
      expect(data).toBeUndefined();
    });

    it("should reject invalid wallet addresses", async () => {
      const input = {
        address: "invalid-wallet-address",
      };

      const { error, data } = await simulateServerAction(
        createWallet,
        [input],
        {
          mockUser: {
            ...mockUser,
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
        address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      };

      const { error, data } = await simulateServerAction(
        createWallet,
        [input],
        { mockUser },
      );

      expect(error?.message).toContain("Database connection error");
      expect(data).toBeUndefined();
    });
  });

  describe("getWallet", () => {
    it("should return wallet for valid requests", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(
        ({ where }: { where: unknown }) => {
          return Promise.resolve({
            id: 1,
            address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
            referralCode: "TEST12",
            createdAt: new Date("2024-01-01T00:00:00.000Z"),
            updatedAt: new Date("2024-01-01T00:00:00.000Z"),
          });
        },
      );

      const { error, data } = await simulateServerAction(
        getWallet,
        [{ address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toMatchObject({
        address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referralCode: "TEST12",
      });
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

    it("should reject unauthenticated users", async () => {
      // Mock getPrivyUser to return null for this test
      (getPrivyUser as jest.Mock).mockImplementationOnce(() => null);

      const { error, data } = await simulateServerAction(
        getWallet,
        [{ address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" }],
        { mockUser: null },
      );

      expect(error?.message).toContain("Unauthorized: Please log in first");
      expect(data).toBeUndefined();
    });

    it("should reject invalid wallet addresses", async () => {
      const input = {
        address: "invalid-wallet-address",
      };

      const { error, data } = await simulateServerAction(getWallet, [input], {
        mockUser: {
          ...mockUser,
          wallet: { address: "invalid-wallet-address" },
        },
      });

      expect(error?.message).toContain("Invalid Solana address");
      expect(data).toBeUndefined();
    });

    it("should handle database errors gracefully", async () => {
      // Mock db.query.walletTable.findFirst to throw an error
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => {
        throw new Error("Database connection error");
      });

      const { error, data } = await simulateServerAction(
        getWallet,
        [{ address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" }],
        { mockUser },
      );

      expect(error?.message).toContain(
        "Failed to get wallet: Database connection error",
      );
      expect(data).toBeUndefined();
    });
  });

  describe("handleSubmitWallet", () => {
    it("should create new wallet with referral successfully", async () => {
      const input = {
        walletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referredByCode: "TEST12",
      };

      // Mock getWallet to return null first time
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => null);

      // Mock insert operations
      mockDb.insert.mockImplementation((table: unknown) => ({
        values: jest.fn().mockImplementation((values) => ({
          returning: jest.fn().mockImplementation(() => {
            if (table === mockDb.walletTable) {
              return Promise.resolve([
                {
                  id: 1,
                  address: input.walletAddress,
                  referralCode: "TEST12",
                  createdAt: new Date("2024-01-01T00:00:00.000Z"),
                  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
                },
              ]);
            }
            if (table === mockDb.referralTable) {
              return Promise.resolve([
                {
                  id: 1,
                  referredByCode: input.referredByCode,
                  referredWalletAddress: input.walletAddress,
                  createdAt: new Date("2024-01-01T00:00:00.000Z"),
                  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
                },
              ]);
            }
            return Promise.resolve([]);
          }),
        })),
      }));

      const { error, data } = await simulateServerAction(
        handleSubmitWallet,
        [input],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toMatchObject({
        address: input.walletAddress,
        referralCode: "TEST12",
      });
    });

    it("should handle existing wallet with new referral", async () => {
      const input = {
        walletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referredByCode: "TEST12",
      };

      // Mock existing wallet but no referral
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => ({
        id: 1,
        address: input.walletAddress,
        referralCode: "TEST12",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
        referredBy: null,
      }));

      // Mock referral insert
      mockDb.insert.mockImplementation((table: unknown) => ({
        values: jest.fn().mockImplementation((values) => ({
          returning: jest.fn().mockImplementation(() => {
            if (table === mockDb.referralTable) {
              return Promise.resolve([
                {
                  id: 1,
                  referredByCode: input.referredByCode,
                  referredWalletAddress: input.walletAddress,
                  createdAt: new Date("2024-01-01T00:00:00.000Z"),
                  updatedAt: new Date("2024-01-01T00:00:00.000Z"),
                },
              ]);
            }
            return Promise.resolve([]);
          }),
        })),
      }));

      const { error, data } = await simulateServerAction(
        handleSubmitWallet,
        [input],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toMatchObject({
        address: input.walletAddress,
        referralCode: "TEST12",
      });
    });

    it("should reject unauthenticated users", async () => {
      // Mock getPrivyUser to return null for this test
      (getPrivyUser as jest.Mock).mockImplementationOnce(() => null);

      const input = {
        walletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referredByCode: "TEST12",
      };

      const { error, data } = await simulateServerAction(
        handleSubmitWallet,
        [input],
        { mockUser: null },
      );

      expect(error?.message).toContain("Unauthorized: Please log in first");
      expect(data).toBeUndefined();
    });

    it("should reject invalid wallet addresses", async () => {
      const input = {
        walletAddress: "invalid-wallet-address",
        referredByCode: "TEST12",
      };

      const { error, data } = await simulateServerAction(
        handleSubmitWallet,
        [input],
        {
          mockUser: {
            ...mockUser,
            wallet: { address: "invalid-wallet-address" },
          },
        },
      );

      expect(error?.message).toContain("Invalid Solana address");
      expect(data).toBeUndefined();
    });

    it("should reject invalid referral codes", async () => {
      const input = {
        walletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referredByCode: "12345",
      };

      const { error, data } = await simulateServerAction(
        handleSubmitWallet,
        [input],
        { mockUser },
      );

      expect(error?.message).toContain(
        "String must contain exactly 6 character(s)",
      );
      expect(data).toBeUndefined();
    });

    it("should handle database errors gracefully", async () => {
      // Mock db.query.walletTable.findFirst to throw an error
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => {
        throw new Error("Database connection error");
      });

      const input = {
        walletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referredByCode: "TEST12",
      };

      const { error, data } = await simulateServerAction(
        handleSubmitWallet,
        [input],
        { mockUser },
      );

      expect(error?.message).toBe(
        "Failed to submit wallet: Failed to get wallet: Database connection error",
      );
      expect(data).toBeUndefined();
    });
  });

  describe("getWalletByReferralCode", () => {
    it("should return wallet for valid referral code", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => ({
        id: 1,
        address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referralCode: "TEST12",
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      }));

      const { error, data } = await simulateServerAction(
        getWalletByReferralCode,
        [{ referralCode: "TEST12" }],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toMatchObject({
        address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        referralCode: "TEST12",
      });
    });

    it("should reject invalid referral codes", async () => {
      const { error, data } = await simulateServerAction(
        getWalletByReferralCode,
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
        getWalletByReferralCode,
        [{ referralCode: "TEST12" }],
        { mockUser: null },
      );

      expect(error?.message).toContain("Unauthorized: Please log in first");
      expect(data).toBeUndefined();
    });

    it("should handle non-existent referral codes", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => null);

      const { error, data } = await simulateServerAction(
        getWalletByReferralCode,
        [{ referralCode: "TEST12" }],
        { mockUser },
      );

      expect(data).toBeUndefined();
    });

    it("should handle database errors", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => {
        throw new Error("Database connection error");
      });

      const { error, data } = await simulateServerAction(
        getWalletByReferralCode,
        [{ referralCode: "TEST12" }],
        { mockUser },
      );

      expect(error?.message).toContain("Database connection error");
      expect(data).toBeUndefined();
    });
  });

  describe("isValidReferralCode", () => {
    const mockReferredWallet = {
      id: 1,
      address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
      referralCode: "TEST34",
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      referredBy: null,
    };

    it("should validate correct referral code", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => ({
        id: 2,
        address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz",
        referralCode: "TEST12",
        createdAt: new Date("2023-12-31T00:00:00.000Z"),
        updatedAt: new Date("2023-12-31T00:00:00.000Z"),
      }));

      const { error, data } = await simulateServerAction(
        isValidReferralCode,
        [
          {
            referredByCode: "TEST12",
            referredWallet: mockReferredWallet,
          },
        ],
        { mockUser },
      );

      expect(error).toBeUndefined();
      expect(data).toBe(true);
    });

    it("should reject if referred wallet already has referral", async () => {
      const walletWithReferral = {
        ...mockReferredWallet,
        referredBy: {
          id: 2,
          address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz",
          referralCode: "TEST12",
          createdAt: new Date("2023-12-31T00:00:00.000Z"),
          updatedAt: new Date("2023-12-31T00:00:00.000Z"),
        },
      };

      const { error, data } = await simulateServerAction(
        isValidReferralCode,
        [
          {
            referredByCode: "TEST12",
            referredWallet: walletWithReferral,
          },
        ],
        { mockUser },
      );

      expect(error?.message).toContain("Wallet already has a referral");
      expect(data).toBeUndefined();
    });

    it("should reject if referral wallet not found", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => null);

      const { error, data } = await simulateServerAction(
        isValidReferralCode,
        [
          {
            referredByCode: "TEST12",
            referredWallet: mockReferredWallet,
          },
        ],
        { mockUser },
      );

      expect(error?.message).toContain("Referral code wallet not found");
      expect(data).toBeUndefined();
    });

    it("should reject if referral wallet is same as referred wallet", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => ({
        ...mockReferredWallet,
      }));

      const { error, data } = await simulateServerAction(
        isValidReferralCode,
        [
          {
            referredByCode: "TEST34",
            referredWallet: mockReferredWallet,
          },
        ],
        { mockUser },
      );

      expect(error?.message).toContain(
        "Referral code wallet cannot be the same as referred wallet",
      );
      expect(data).toBeUndefined();
    });

    it("should reject if referral wallet is newer than referred wallet", async () => {
      const mockDb = jest.requireMock("@/lib/__mocks__/database").mockDatabase
        .db;
      mockDb.query.walletTable.findFirst.mockImplementationOnce(() => ({
        id: 2,
        address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz",
        referralCode: "TEST12",
        createdAt: new Date("2024-01-02T00:00:00.000Z"),
        updatedAt: new Date("2024-01-02T00:00:00.000Z"),
      }));

      const { error, data } = await simulateServerAction(
        isValidReferralCode,
        [
          {
            referredByCode: "TEST12",
            referredWallet: mockReferredWallet,
          },
        ],
        { mockUser },
      );

      expect(error?.message).toContain(
        "Referral code wallet is newer than referred wallet",
      );
      expect(data).toBeUndefined();
    });

    it("should reject unauthorized wallet check", async () => {
      const { error, data } = await simulateServerAction(
        isValidReferralCode,
        [
          {
            referredByCode: "TEST12",
            referredWallet: {
              ...mockReferredWallet,
              address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz",
            },
          },
        ],
        { mockUser },
      );

      expect(error?.message).toContain(
        "You can only check your own referral code",
      );
      expect(data).toBeUndefined();
    });

    it("should reject unauthenticated users", async () => {
      (getPrivyUser as jest.Mock).mockImplementationOnce(() => null);

      const { error, data } = await simulateServerAction(
        isValidReferralCode,
        [
          {
            referredByCode: "TEST12",
            referredWallet: mockReferredWallet,
          },
        ],
        { mockUser: null },
      );

      expect(error?.message).toContain("Unauthorized: Please log in first");
      expect(data).toBeUndefined();
    });
  });
});
