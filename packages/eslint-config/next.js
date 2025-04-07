const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    require.resolve("@vercel/style-guide/eslint/next"),
    "plugin:@typescript-eslint/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project,
    ecmaVersion: "latest",
    sourceType: "module",
  },
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    node: true,
    browser: true,
    es2022: true,
  },
  plugins: ["only-warn", "@typescript-eslint"],
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    ".next",
    "dist",
    "build",
  ],
  overrides: [
    {
      files: ["*.js?(x)", "*.ts?(x)"],
      parser: "@typescript-eslint/parser",
    },
  ],
};
