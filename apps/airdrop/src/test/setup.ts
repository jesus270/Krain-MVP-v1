/// <reference types="node" />

import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "node:util";

// Mock fetch and related APIs
const mockFetch = jest.fn();
const mockRequest = jest.fn();
const mockResponse = jest.fn();
const mockHeaders = jest.fn();

global.fetch = mockFetch;
global.Request = mockRequest as unknown as typeof Request;
global.Response = mockResponse as unknown as typeof Response;
global.Headers = mockHeaders as unknown as typeof Headers;

// Mock web APIs
global.Request = class MockRequest {
  constructor(input: string | Request, init?: RequestInit) {}
} as any;

global.Response = class MockResponse {
  constructor(body?: BodyInit | null, init?: ResponseInit) {}
} as any;

// Mock modules that use ESM
jest.mock("uuid", () => {
  const actual = jest.requireActual("uuid");
  return {
    ...actual,
    v4: jest.fn(() => "test-uuid"),
  };
});

// Mock iron-session
jest.mock("iron-session", () => ({
  getIronSession: jest.fn(() => ({
    user: {
      id: "test-user",
      wallet: { address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b" },
    },
    save: jest.fn(),
    destroy: jest.fn(),
  })),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "";
  },
  redirect: jest.fn(),
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
  headers: jest.fn(
    () =>
      new Headers({
        origin: "http://localhost:3000",
        host: "localhost:3000",
      }),
  ),
  cookies: jest.fn(() => new Map()),
}));

// Mock database
jest.mock("@repo/database", () => {
  const fixedDate = new Date("2024-01-01T00:00:00.000Z");

  const mockWalletTable = {
    id: { serial: "serial" },
    address: { text: "text" },
    referralCode: { text: "text" },
    createdAt: { timestamp: "timestamp" },
  };

  const mockReferralTable = {
    id: { serial: "serial" },
    referredByCode: { text: "text" },
    referredWalletAddress: { text: "text" },
    createdAt: { timestamp: "timestamp" },
  };

  const mockDb = {
    select: jest.fn().mockImplementation((fields) => {
      if (typeof window !== "undefined") {
        throw new Error("Database client cannot be used on the client side");
      }
      return {
        from: jest.fn().mockImplementation((table) => ({
          where: jest.fn().mockImplementation(() => {
            if (
              fields &&
              typeof fields === "object" &&
              "count" in fields &&
              table === mockReferralTable
            ) {
              return Promise.resolve([{ count: 1 }]);
            }
            if (table === mockWalletTable) {
              return {
                limit: jest.fn().mockResolvedValue([
                  {
                    id: 1,
                    address: "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
                    referralCode: "TEST12",
                    createdAt: fixedDate,
                    updatedAt: fixedDate,
                  },
                ]),
              };
            }
            if (table === mockReferralTable) {
              return {
                limit: jest.fn().mockResolvedValue([
                  {
                    id: 1,
                    referredByCode: "TEST12",
                    referredWalletAddress:
                      "9ZNTfG4NyQgxy2SWjSiQoUyBPEvXT2xo7fKc5hPYYJ7b",
                    createdAt: fixedDate,
                    updatedAt: fixedDate,
                  },
                ]),
              };
            }
            return {
              limit: jest.fn().mockResolvedValue([]),
            };
          }),
        })),
      };
    }),
    insert: jest.fn().mockImplementation((table) => {
      if (typeof window !== "undefined") {
        throw new Error("Database client cannot be used on the client side");
      }
      return {
        values: jest.fn().mockImplementation((values) => ({
          returning: jest.fn().mockResolvedValue(
            table === mockReferralTable
              ? [
                  {
                    id: 1,
                    referredByCode: values.referredByCode,
                    referredWalletAddress: values.referredWalletAddress,
                    createdAt: fixedDate,
                    updatedAt: fixedDate,
                  },
                ]
              : table === mockWalletTable
                ? [
                    {
                      id: 1,
                      address: values.address,
                      referralCode: values.referralCode || "TEST12",
                      createdAt: fixedDate,
                      updatedAt: fixedDate,
                    },
                  ]
                : [],
          ),
        })),
      };
    }),
    delete: jest.fn().mockImplementation(() => {
      if (typeof window !== "undefined") {
        throw new Error("Database client cannot be used on the client side");
      }
      return Promise.resolve();
    }),
    update: jest.fn().mockImplementation(() => {
      if (typeof window !== "undefined") {
        throw new Error("Database client cannot be used on the client side");
      }
      return Promise.resolve();
    }),
  };

  return {
    db: mockDb,
    walletTable: mockWalletTable,
    referralTable: mockReferralTable,
    eq: jest.fn((a, b) => ({ operator: "eq", left: a, right: b })),
    count: jest.fn(() => ({ value: 1 })),
  };
});

// Environment variable setup
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.DATABASE_URL = "mock://database-url";
process.env.SESSION_SECRET = "test_session_secret_at_least_32_characters";

// Global polyfills
Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
});

// FormData mock
if (typeof FormData === "undefined") {
  (global as any).FormData = class FormData {
    private data: Map<string, any> = new Map();
    append(key: string, value: any) {
      this.data.set(key, value);
    }
    get(key: string) {
      return this.data.get(key);
    }
  };
}

// Mock crypto for uuid
if (!global.crypto) {
  global.crypto = {
    getRandomValues: function (buffer: Uint8Array) {
      return require("crypto").randomFillSync(buffer);
    },
  } as Crypto;
}

// Ensure window is undefined for server-side tests
delete (global as any).window;

// Mock fetch
global.fetch = jest.fn();

// Mock console.error to suppress expected error messages during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});
