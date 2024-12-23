// Add TextEncoder polyfill
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js modules
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
  unstable_cache: jest.fn(),
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Headers()),
  cookies: jest.fn(() => new Map()),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Default mock user
const defaultMockUser = {
  id: "test-user",
  wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
};

// Mock auth module
jest.mock("../lib/auth", () => ({
  getPrivyUser: jest.fn().mockImplementation(async () => defaultMockUser),
}));

// Mock database
export const mockWallet = {
  id: 1,
  address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  referralCode: "TEST12",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const mockReferral = {
  id: 1,
  referredByCode: "TEST12",
  referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

type MockWallet = typeof mockWallet;
type MockReferral = typeof mockReferral;

// Track mock database state
let mockDbState = {
  wallets: [] as MockWallet[],
  referrals: [] as MockReferral[],
};

// Create Drizzle table symbols
const tableSymbols = {
  columns: Symbol.for("drizzle:Columns"),
  name: Symbol.for("drizzle:Name"),
  schema: Symbol.for("drizzle:Schema"),
  isAlias: Symbol.for("drizzle:IsAlias"),
};

// Mock database module
const createMockDb = () => {
  const mockDb = {
    insert: jest.fn().mockImplementation((table) => ({
      values: jest.fn().mockImplementation((values) => ({
        returning: jest.fn().mockImplementation(() => {
          if (table.Symbol?.description === "walletTable") {
            const wallet = { ...mockWallet, ...values };
            mockDbState.wallets.push(wallet);
            return Promise.resolve([wallet]);
          } else if (table.Symbol?.description === "referralTable") {
            const referral = { ...mockReferral, ...values };
            mockDbState.referrals.push(referral);
            return Promise.resolve([referral]);
          }
          return Promise.resolve([]);
        }),
        onConflictDoUpdate: jest.fn().mockReturnValue({
          target: jest.fn().mockReturnValue({
            set: jest.fn().mockReturnValue({
              returning: jest.fn().mockImplementation((values) => {
                const wallet = { ...mockWallet, ...values };
                const index = mockDbState.wallets.findIndex(
                  (w) => w.address === wallet.address,
                );
                if (index >= 0) {
                  mockDbState.wallets[index] = wallet;
                } else {
                  mockDbState.wallets.push(wallet);
                }
                return Promise.resolve([wallet]);
              }),
            }),
          }),
        }),
      })),
    })),
    select: jest.fn().mockImplementation((fields) => ({
      from: jest.fn().mockImplementation((table) => ({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockImplementation((limit = 1) => {
            if (fields && typeof fields === "object" && "count" in fields) {
              return Promise.resolve([{ count: mockDbState.referrals.length }]);
            }
            if (table.Symbol?.description === "walletTable") {
              return Promise.resolve(mockDbState.wallets.slice(0, limit));
            } else if (table.Symbol?.description === "referralTable") {
              return Promise.resolve(mockDbState.referrals.slice(0, limit));
            }
            return Promise.resolve([]);
          }),
        }),
      })),
    })),
  };

  return mockDb;
};

// Reset mock database state before each test
beforeEach(() => {
  mockDbState = {
    wallets: [mockWallet], // Initialize with mock wallet
    referrals: [mockReferral], // Initialize with mock referral
  };

  // Reset auth mock to default authenticated state
  const { getPrivyUser } = require("../lib/auth");
  getPrivyUser.mockImplementation(async () => defaultMockUser);
});

// Mock database modules
jest.mock("@repo/database", () => {
  const mockDb = createMockDb();
  const walletTable = {
    Symbol: { description: "walletTable" },
    [tableSymbols.columns]: {
      id: { name: "id", table: "wallets" },
      address: { name: "address", table: "wallets" },
      referralCode: { name: "referralCode", table: "wallets" },
      createdAt: { name: "createdAt", table: "wallets" },
      updatedAt: { name: "updatedAt", table: "wallets" },
    },
    [tableSymbols.name]: "wallets",
    [tableSymbols.schema]: "public",
    [tableSymbols.isAlias]: false,
  };
  const referralTable = {
    Symbol: { description: "referralTable" },
    [tableSymbols.columns]: {
      id: { name: "id", table: "referrals" },
      referredByCode: { name: "referredByCode", table: "referrals" },
      referredWalletAddress: {
        name: "referredWalletAddress",
        table: "referrals",
      },
      createdAt: { name: "createdAt", table: "referrals" },
      updatedAt: { name: "updatedAt", table: "referrals" },
    },
    [tableSymbols.name]: "referrals",
    [tableSymbols.schema]: "public",
    [tableSymbols.isAlias]: false,
  };
  return {
    db: mockDb,
    walletTable,
    referralTable,
    eq: jest.fn((a, b) => ({ operator: "=", left: a, right: b })),
    count: jest.fn((field) => ({ count: field })),
    sql: jest.fn((strings, ...values) => ({
      strings,
      values,
    })),
  };
});

// Also mock the local db module to prevent actual database connections
jest.mock("../lib/db", () => {
  const mockDb = createMockDb();
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
      return mockUser || defaultMockUser;
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
