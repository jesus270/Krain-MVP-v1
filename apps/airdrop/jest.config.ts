const nextJest = require("next/jest");
const { Config } = require("jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "babel-jest",
      {
        presets: [
          ["@babel/preset-env", { targets: { node: "current" } }],
          "@babel/preset-typescript",
          ["@babel/preset-react", { runtime: "automatic" }],
        ],
      },
    ],
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid|@solana/buffer-layout|superstruct|@noble|node-fetch|web-encoding|@project-serum|borsh|buffer|bn.js|bs58|rpc-websockets|eventemitter3|ws|node-gyp-build|utf-8-validate|bufferutil)/)",
  ],
  moduleDirectories: ["node_modules", "<rootDir>/"],
  testTimeout: 20000,
  resolver: "<rootDir>/jest.resolver.js",
  extensionsToTreatAsEsm: [".ts", ".tsx", ".jsx"],
  modulePathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
  roots: ["<rootDir>/src"],
};

module.exports = createJestConfig(customJestConfig);
