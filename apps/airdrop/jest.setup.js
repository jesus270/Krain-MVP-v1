import "@testing-library/jest-dom";

// Mock data
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

// Mock next/router
jest.mock("next/router", () => require("next-router-mock"));

// Mock next/navigation
const useRouter = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter() {
    return useRouter();
  },
  usePathname() {
    return "";
  },
  redirect: jest.fn(),
}));

// Mock database client
jest.mock("@repo/database", () => {
  const insertMock = jest.fn().mockReturnValue({
    values: jest.fn().mockReturnValue({
      returning: jest.fn().mockResolvedValue([mockWallet]),
    }),
  });

  const selectMock = jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue([mockWallet]),
      }),
    }),
  });

  const countMock = jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      where: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue([{ count: 1 }]),
      }),
    }),
  });

  return {
    db: {
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
      transaction: jest.fn(),
      insert: insertMock,
      select: selectMock,
      count: countMock,
      delete: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue([mockWallet]),
    },
  };
});

// Mock auth
const mockSession = {
  user: {
    id: "1",
    address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
  },
  isLoggedIn: true,
};

jest.mock("./src/lib/auth", () => ({
  getSession: jest.fn().mockImplementation(() => Promise.resolve(mockSession)),
}));

// Set up test environment
global.window = undefined;
