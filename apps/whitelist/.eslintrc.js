/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ["@krain/eslint-config/next.js"],
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
  },
  ignorePatterns: [".next/**/*", ".turbo/**/*", "node_modules/**/*"],
  overrides: [
    {
      files: ["**/*.ts", "**/*.tsx"],
      rules: {
        "@typescript-eslint/no-unused-vars": "warn",
      },
    },
  ],
};
