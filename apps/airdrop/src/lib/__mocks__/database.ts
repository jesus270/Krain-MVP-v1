import { type Wallet, type Referral } from "@repo/database";

const fixedDate = new Date("2024-01-01T00:00:00.000Z");

// Mock data
export const mockWallet = {
  address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  referralCode: "TEST12",
  createdAt: fixedDate,
} as Wallet;

export const mockReferral = {
  id: 1,
  referredByCode: "TEST12",
  referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  createdAt: fixedDate,
  updatedAt: fixedDate,
} as Referral;

// Create mock table schemas that match Drizzle's expectations
const createMockTable = (name: string, columns: string[]) => {
  const table: Record<string, any> = {
    name,
  };

  // Add Drizzle symbols
  Object.defineProperties(table, {
    [Symbol.for("drizzle:Columns")]: { value: columns },
    [Symbol.for("drizzle:Name")]: { value: name },
    [Symbol.for("drizzle:IsAlias")]: { value: false },
  });

  // Add column definitions
  columns.forEach((col) => {
    table[col] = { name: col, table };
  });

  return table;
};

// Create mock tables
const mockWalletTable = createMockTable("wallets", [
  "address",
  "referralCode",
  "createdAt",
]);

const mockReferralTable = createMockTable("referrals", [
  "id",
  "referredByCode",
  "referredWalletAddress",
  "createdAt",
  "updatedAt",
]);

// Create mock database instance
const createMockDb = () => {
  const mockSelect = {
    from: jest.fn().mockImplementation((table) => ({
      where: jest.fn().mockImplementation(() => ({
        limit: jest.fn().mockImplementation(() => {
          if (table === mockReferralTable) {
            return Promise.resolve([mockReferral]);
          }
          return Promise.resolve([mockWallet]);
        }),
      })),
    })),
  };

  const mockDb = {
    select: jest.fn().mockImplementation((fields) => {
      if (fields && fields.count) {
        return {
          from: jest.fn().mockImplementation(() => ({
            where: jest.fn().mockImplementation(() => {
              return Promise.resolve([{ count: 1 }]);
            }),
          })),
        };
      }
      return mockSelect;
    }),
    insert: jest.fn().mockImplementation((table) => ({
      values: jest.fn().mockImplementation(() => ({
        returning: jest.fn().mockImplementation(() => {
          if (table === mockReferralTable) {
            return Promise.resolve([mockReferral]);
          }
          return Promise.resolve([mockWallet]);
        }),
        onConflictDoUpdate: jest.fn().mockReturnValue({
          target: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              returning: jest.fn().mockImplementation(() => {
                if (table === mockReferralTable) {
                  return Promise.resolve([mockReferral]);
                }
                return Promise.resolve([mockWallet]);
              }),
            }),
          }),
        }),
      })),
    })),
    from: jest.fn().mockImplementation((table) => ({
      where: jest.fn().mockImplementation(() => {
        if (table === mockReferralTable) {
          return Promise.resolve([mockReferral]);
        }
        return Promise.resolve([mockWallet]);
      }),
    })),
  };

  return mockDb;
};

// Export mock database module
export const mockDatabase = {
  db: createMockDb(),
  walletTable: mockWalletTable,
  referralTable: mockReferralTable,
  eq: jest.fn((a, b) => ({ operator: "=", left: a, right: b })),
  count: jest.fn((field) => ({ count: field })),
  sql: jest.fn((strings, ...values) => ({ strings, values })),
};
