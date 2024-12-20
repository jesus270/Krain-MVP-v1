# Krain ESLint Config

Shared ESLint configuration for Krain applications and packages.

## Overview

This package provides a consistent ESLint configuration across all packages and applications in the Krain monorepo. It includes:
- TypeScript support
- React best practices
- Import sorting
- Prettier integration

## Installation

The package is automatically available to all applications in the monorepo. For manual installation:

```bash
pnpm add -D @repo/eslint-config
```

## Usage

Add to your `.eslintrc.js`:

```javascript
module.exports = {
  extends: ["@repo/eslint-config"],
};
```

## Configuration

The configuration includes:

### Core Rules
- TypeScript rules
- React hooks rules
- Import sorting and organization
- Prettier integration

### Plugins
- `@typescript-eslint`
- `react`
- `react-hooks`
- `import`
- `prettier`

### Example Configuration

```javascript
module.exports = {
  extends: [
    "next/core-web-vitals",
    "turbo",
    "prettier",
  ],
  rules: {
    "@next/next/no-html-link-for-pages": "off",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "import/order": [
      "error",
      {
        groups: ["builtin", "external", "internal"],
        "newlines-between": "always",
        alphabetize: { order: "asc", caseInsensitive: true },
      },
    ],
  },
};
```

## Scripts

- `pnpm lint` - Run ESLint
- `pnpm format` - Run Prettier

## Contributing

See the [Contributing Guide](../../docs/CONTRIBUTING.md) for details on making contributions.

## Documentation

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Prettier Documentation](https://prettier.io/docs/en/) 