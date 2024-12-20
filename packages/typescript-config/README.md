# Krain TypeScript Config

Shared TypeScript configuration for Krain applications and packages.

## Overview

This package provides consistent TypeScript configurations for different types of packages in the Krain monorepo:
- Base configuration
- React configuration
- Next.js configuration
- Library configuration

## Installation

The package is automatically available to all applications in the monorepo. For manual installation:

```bash
pnpm add -D @repo/typescript-config
```

## Usage

Extend the appropriate configuration in your `tsconfig.json`:

### For Next.js Applications
```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### For React Libraries
```json
{
  "extends": "@repo/typescript-config/react-library.json",
  "include": ["src/**/*.ts", "src/**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### For Base Libraries
```json
{
  "extends": "@repo/typescript-config/base.json",
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Available Configurations

### Base Configuration (`base.json`)
```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Default",
  "compilerOptions": {
    "composite": false,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "inlineSources": false,
    "isolatedModules": true,
    "moduleResolution": "node",
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "preserveWatchOutput": true,
    "skipLibCheck": true,
    "strict": true
  },
  "exclude": ["node_modules"]
}
```

### React Library Configuration (`react-library.json`)
Extends the base configuration with React-specific settings.

### Next.js Configuration (`nextjs.json`)
Extends the base configuration with Next.js-specific settings.

## Type Checking

To run type checking:

```bash
pnpm type-check
```

## Contributing

See the [Contributing Guide](../../docs/CONTRIBUTING.md) for details on making contributions.

## Documentation

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TSConfig Reference](https://www.typescriptlang.org/tsconfig) 