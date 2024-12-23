import { mockDatabase } from "./__mocks__/database";

jest.mock("./db", () => ({
  db: mockDatabase.db,
  executeWithRetry: jest.fn((_fn) => _fn()),
  executeWithTimeout: jest.fn((_fn) => _fn),
}));

export async function simulateServerAction<T>(
  action: (...args: any[]) => Promise<T>,
  _args: any[] = [],
  options: {
    authenticated?: boolean;
    mockUser?: any;
  } = {},
): Promise<{ data?: T; error?: Error }> {
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
      const result = await action(..._args);
      return { data: result };
    } catch (error) {
      return { error: error as Error };
    }
  } finally {
    // Reset auth mock
    const { getPrivyUser } = require("./auth");
    getPrivyUser.mockReset();
  }
}
