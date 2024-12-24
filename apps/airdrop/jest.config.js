/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@repo/database$": "<rootDir>/../../packages/database",
    "^@repo/database/(.*)$": "<rootDir>/../../packages/database/$1",
    "^@repo/(.*)$": "<rootDir>/../../packages/$1",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@/lib/test-utils$": "<rootDir>/src/lib/__tests__/test-utils.ts",
  },
  moduleDirectories: ["node_modules", "<rootDir>/../../packages/database"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }],
  },
  testTimeout: 10000,
  verbose: true,
  detectOpenHandles: true,
  forceExit: true,
  automock: false,
  unmockedModulePathPatterns: [
    "node_modules",
    "src/lib/__tests__/test-utils.ts",
    "src/lib/__mocks__/database.ts",
  ],
};

module.exports = config;
