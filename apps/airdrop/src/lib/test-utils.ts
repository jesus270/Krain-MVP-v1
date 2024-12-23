import { type Wallet, type Referral } from "@repo/database";
import { mockDatabase, mockWallet, mockReferral } from "./__mocks__/database";

// Add TextEncoder polyfill
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

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

// Mock database operations
jest.mock("@repo/database", () => mockDatabase);

// Also mock the local db module to prevent actual database connections
jest.mock("./db", () => ({
  db: mockDatabase.db,
  executeWithRetry: jest.fn((fn) => fn()),
  executeWithTimeout: jest.fn((fn) => fn),
}));

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
    const { getPrivyUser } = require("./auth");
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
