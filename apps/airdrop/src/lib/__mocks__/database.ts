import { type Wallet, type Referral } from "@repo/database";

const fixedDate = new Date("2024-01-01T00:00:00.000Z");

// Mock data
export const mockWallet = {
  id: 1,
  address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  referralCode: "TEST12",
  createdAt: fixedDate,
  updatedAt: fixedDate,
} as Wallet;

export const mockReferral = {
  id: 1,
  referredByCode: "TEST12",
  referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  createdAt: fixedDate,
  updatedAt: fixedDate,
} as Referral;

// Create mock column
const createMockColumn = (name: string, table: any) => {
  const column = {
    name,
    table,
    [Symbol.for("drizzle:Name")]: name,
    [Symbol.for("drizzle:Type")]: "string",
    [Symbol.for("drizzle:IsAlias")]: false,
  };
  return column;
};

// Create mock table schemas that match Drizzle's expectations
const createMockTable = (name: string, columns: string[]) => {
  const table: Record<string | symbol, any> = {
    $inferSelect: () => ({}),
  };

  // Add column definitions
  columns.forEach((col) => {
    table[col] = createMockColumn(col, table);
  });

  // Add table symbols and properties
  Object.defineProperties(table, {
    [Symbol.for("drizzle:Name")]: { value: name, enumerable: true },
    [Symbol.for("drizzle:Columns")]: {
      value: Object.fromEntries(columns.map((col) => [col, table[col]])),
      enumerable: true,
    },
    [Symbol.for("drizzle:IsAlias")]: { value: false, enumerable: true },
  });

  return table;
};

// Create mock tables
const mockWalletTable = createMockTable("wallet", [
  "id",
  "address",
  "referralCode",
  "createdAt",
  "updatedAt",
]);

const mockReferralTable = createMockTable("referral", [
  "id",
  "referredByCode",
  "referredWalletAddress",
  "createdAt",
  "updatedAt",
]);

// Create mock database instance
const createMockDb = () => {
  const mockDb = {
    select: jest.fn().mockImplementation((fields) => ({
      from: jest.fn().mockImplementation((table) => ({
        where: jest.fn().mockImplementation((condition) => {
          try {
            // Handle count queries
            if (fields && typeof fields === "object" && "count" in fields) {
              return Promise.resolve([{ count: 1n }]);
            }
            // Handle regular queries
            if (table === mockReferralTable) {
              return Promise.resolve([mockReferral]);
            }
            return Promise.resolve([mockWallet]);
          } catch (error) {
            throw new Error("Database connection error");
          }
        }),
      })),
    })),
    insert: jest.fn().mockImplementation((table) => ({
      values: jest.fn().mockImplementation((values) => ({
        returning: jest.fn().mockImplementation(() => {
          try {
            if (table === mockReferralTable) {
              if (
                !values ||
                !values.referredByCode ||
                !values.referredWalletAddress
              ) {
                throw new Error("Database connection error");
              }
              const referral = {
                id: 1,
                referredByCode: values.referredByCode,
                referredWalletAddress: values.referredWalletAddress,
                createdAt: fixedDate,
                updatedAt: fixedDate,
              };
              return Promise.resolve([referral]);
            }
            if (table === mockWalletTable) {
              if (!values || !values.address) {
                throw new Error("Database connection error");
              }
              const wallet = {
                id: 1,
                address: values.address,
                referralCode: values.referralCode || "TEST12",
                createdAt: fixedDate,
                updatedAt: fixedDate,
              };
              return Promise.resolve([wallet]);
            }
            return Promise.resolve([]);
          } catch (error) {
            throw new Error("Database connection error");
          }
        }),
      })),
    })),
    query: {
      walletTable: {
        findFirst: jest
          .fn()
          .mockImplementation(({ where, with: withRelations }) => {
            try {
              if (where?.operator === "eq" && where?.left?.name === "address") {
                const address = where.right;
                if (!address.match(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/)) {
                  throw new Error("Invalid Solana address");
                }
                return Promise.resolve({
                  id: 1,
                  address,
                  referralCode: "TEST12",
                  createdAt: fixedDate,
                  updatedAt: fixedDate,
                  referredBy: withRelations?.referredBy ? null : undefined,
                });
              }
              if (
                where?.operator === "eq" &&
                where?.left?.name === "referralCode"
              ) {
                const referralCode = where.right;
                if (!referralCode || referralCode.length !== 6) {
                  throw new Error("Invalid referral code");
                }
                return Promise.resolve({
                  id: 2,
                  address: "7WNkYqGXFvpGxYKqAJegvhRtZrXv4uqFCQH1NfJNdJYz",
                  referralCode,
                  createdAt: new Date("2023-12-31T00:00:00.000Z"),
                  updatedAt: new Date("2023-12-31T00:00:00.000Z"),
                });
              }
              return Promise.resolve(null);
            } catch (error) {
              throw new Error("Database connection error");
            }
          }),
      },
      referralTable: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          try {
            if (
              where?.operator === "eq" &&
              where?.left?.name === "referredByCode"
            ) {
              const referralCode = where.right;
              if (!referralCode || referralCode.length !== 6) {
                throw new Error("Invalid referral code");
              }
              return Promise.resolve(mockReferral);
            }
            return Promise.resolve(null);
          } catch (error) {
            throw new Error("Database connection error");
          }
        }),
      },
    },
  };

  return mockDb;
};

// Export mock database
export const mockDatabase = {
  db: createMockDb(),
  walletTable: mockWalletTable,
  referralTable: mockReferralTable,
  eq: jest.fn((a, b) => ({ operator: "eq", left: a, right: b })),
  count: jest.fn(() => ({ value: 1 })),
  sql: jest.fn(),
};
