import type { PrivyUser } from "./auth";

type SimulateOptions = {
  authenticated?: boolean;
  mockUser?: PrivyUser;
  headers?: {
    origin?: string;
    host?: string;
  };
};

// Mock modules
jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Headers()),
  cookies: jest.fn(() => new Map()),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock("./auth", () => ({
  getPrivyUser: jest.fn(),
  validateOrigin: jest.fn(),
}));

// Mock database operations
jest.mock("./db", () => {
  const db = {
    insert: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn().mockImplementation(() => [
      {
        id: 1,
        referredByCode: "TEST12",
        referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
        createdAt: new Date(),
      },
    ]),
  };

  // Mock count query for getReferralsCount
  db.select.mockImplementation((args) => {
    if (args && args.count) {
      return {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnValue([{ count: 1 }]),
      };
    }
    return db;
  });

  return { db, executeWithRetry: jest.fn() };
});

export async function simulateServerAction<
  T extends (...args: any[]) => Promise<any>,
>(
  action: T,
  args: Parameters<T>,
  options: SimulateOptions = {},
): Promise<{ data?: Awaited<ReturnType<T>>; error?: Error }> {
  try {
    // Get mocked modules
    const { headers } = require("next/headers");
    const { getPrivyUser, validateOrigin } = require("./auth");

    // Mock headers
    const mockHeaders = new Headers({
      origin: options.headers?.origin || "http://localhost:3000",
      host: options.headers?.host || "localhost:3000",
    });
    headers.mockReturnValue(mockHeaders);

    // Mock authentication
    if (options.authenticated === false) {
      getPrivyUser.mockResolvedValue(null);
    } else if (options.mockUser) {
      getPrivyUser.mockResolvedValue(options.mockUser);
    } else {
      getPrivyUser.mockResolvedValue({
        id: "test-user",
        wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
      });
    }

    // Mock origin validation
    validateOrigin.mockImplementation((origin: string, host: string) => {
      if (options.headers?.origin && options.headers?.host) {
        return (
          origin === options.headers.origin && host === options.headers.host
        );
      }
      return true;
    });

    const result = await action(...args);
    return { data: result };
  } catch (error) {
    return { error: error as Error };
  }
}
