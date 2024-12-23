import { type Wallet, type Referral } from "@repo/database";

const fixedDate = new Date("2024-01-01T00:00:00.000Z");

// Mock database for testing
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

// Track mock database state
let mockDbState = {
  wallets: [mockWallet],
  referrals: [mockReferral],
};

// Reset mock database state before each test
beforeEach(() => {
  mockDbState = {
    wallets: [mockWallet],
    referrals: [mockReferral],
  };
});

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

// Mock database operations
jest.mock("@repo/database", () => {
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

  const mockDb: Record<string, jest.Mock> = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn((table) => {
      if (table === mockReferralTable) {
        return Promise.resolve([mockReferral]);
      }
      return Promise.resolve([mockWallet]);
    }),
    select: jest.fn(
      (fields): Record<string, jest.Mock> | Record<string, jest.Mock> => {
        if (fields.count) {
          return {
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnValue(Promise.resolve([{ count: 1 }])),
          };
        }
        return mockDb;
      },
    ),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn((table) => {
      if (table === mockReferralTable) {
        return Promise.resolve([mockReferral]);
      }
      return Promise.resolve([mockWallet]);
    }),
    count: jest.fn().mockResolvedValue([{ count: 1 }]),
    onConflictDoUpdate: jest.fn().mockReturnThis(),
    target: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  };

  return {
    db: mockDb,
    walletTable: mockWalletTable,
    referralTable: mockReferralTable,
    eq: jest.fn((a, b) => ({ operator: "=", left: a, right: b })),
    count: jest.fn((field) => ({ count: field })),
    sql: jest.fn((strings, ...values) => ({ strings, values })),
  };
});

// Also mock the local db module to prevent actual database connections
jest.mock("../lib/db", () => {
  const mockDb = {
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockResolvedValue([mockReferral]),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn().mockResolvedValue([mockReferral]),
    count: jest.fn().mockResolvedValue([{ count: 1 }]),
    onConflictDoUpdate: jest.fn().mockReturnThis(),
    target: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
  };

  return {
    db: mockDb,
    executeWithRetry: jest.fn((fn) => fn()),
    executeWithTimeout: jest.fn((fn) => fn),
  };
});

export type SimulateServerActionResult<T> = {
  error?: Error;
  data?: T;
};

export async function simulateServerAction<T>(
  action: (...args: any[]) => Promise<T>,
  args: any[] = [],
  options: {
    authenticated?: boolean;
    mockUser?: any;
  } = {},
): Promise<SimulateServerActionResult<T>> {
  try {
    // Handle auth mocking
    const { authenticated = true, mockUser } = options;

    // Update auth mock
    const { getPrivyUser } = require("../lib/auth");
    getPrivyUser.mockImplementation(async () => {
      if (!authenticated) return null;
      return (
        mockUser || {
          id: "test-user",
          wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
        }
      );
    });

    try {
      const result = await action(...args);
      return { data: result };
    } catch (error) {
      if (error instanceof Error) {
        return { error };
      }
      return { error: new Error(String(error)) };
    }
  } catch (error) {
    if (error instanceof Error) {
      return { error };
    }
    return {
      error: new Error(String(error)),
    };
  }
}
