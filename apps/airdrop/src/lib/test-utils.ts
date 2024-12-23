// Mock modules
jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Headers()),
  cookies: jest.fn(() => new Map()),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
  revalidateTag: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

// Mock auth
export const mockGetPrivyUser = jest.fn().mockImplementation(() =>
  Promise.resolve({
    id: "test-user",
    wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
  }),
);

jest.mock("../lib/auth", () => {
  return {
    getPrivyUser: mockGetPrivyUser,
  };
});

// Mock database
const mockWallet = {
  id: 1,
  address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  referralCode: "TEST12",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

const mockReferral = {
  id: 1,
  referredByCode: "TEST12",
  referredWalletAddress: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

jest.mock("@repo/database", () => {
  const mockDb = {
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([mockWallet]),
      }),
    }),
    select: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue([mockWallet]),
        }),
      }),
    }),
    count: jest.fn().mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue([{ count: 1 }]),
        }),
      }),
    }),
    query: jest.fn().mockImplementation((query) => {
      if (query.includes("COUNT")) {
        return Promise.resolve([{ count: 1 }]);
      }
      if (query.includes("wallet")) {
        return Promise.resolve([mockWallet]);
      }
      if (query.includes("referral")) {
        return Promise.resolve([mockReferral]);
      }
      return Promise.resolve([]);
    }),
  };

  return {
    db: mockDb,
    walletTable: {
      id: { name: "id", table: "wallets" },
      address: { name: "address", table: "wallets" },
      referralCode: { name: "referralCode", table: "wallets" },
      createdAt: { name: "createdAt", table: "wallets" },
      updatedAt: { name: "updatedAt", table: "wallets" },
    },
    referralTable: {
      id: { name: "id", table: "referrals" },
      referredByCode: { name: "referredByCode", table: "referrals" },
      referredWalletAddress: {
        name: "referredWalletAddress",
        table: "referrals",
      },
      createdAt: { name: "createdAt", table: "referrals" },
      updatedAt: { name: "updatedAt", table: "referrals" },
    },
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

    if (!authenticated) {
      mockGetPrivyUser.mockResolvedValueOnce(null);
    } else if (mockUser) {
      mockGetPrivyUser.mockResolvedValueOnce(mockUser);
    }

    const result = await action(...args);
    return { data: result };
  } catch (error) {
    return {
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}
