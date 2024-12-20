# Krain Utils

Common utility functions and helpers for Krain applications.

## Overview

This package provides shared utility functions for:
- Solana address formatting and validation
- Date and time formatting
- Number formatting and calculations
- Common type definitions
- Shared constants

## Installation

The package is automatically available to all applications in the monorepo. For manual installation:

```bash
pnpm add @repo/utils
```

## Usage

```typescript
import { formatAddress, formatAmount } from "@repo/utils";

// Format Solana address
const address = formatAddress("3Kq9v.....mBLL");  // "3Kq9v...mBLL"

// Format token amount
const amount = formatAmount(1000000);  // "1,000,000"
```

## Available Utilities

### Address Utilities
```typescript
formatAddress(address: string, length?: number): string
isValidSolanaAddress(address: string): boolean
```

### Number Utilities
```typescript
formatAmount(amount: number, decimals?: number): string
parseAmount(amount: string): number
```

### Date Utilities
```typescript
formatDate(date: Date): string
formatDateTime(date: Date): string
formatRelativeTime(date: Date): string
```

### Validation Utilities
```typescript
isValidEmail(email: string): boolean
isValidAmount(amount: string): boolean
```

### Constants
```typescript
export const LAMPORTS_PER_SOL = 1000000000;
export const SECONDS_PER_DAY = 86400;
```

## Type Definitions

```typescript
export type NetworkType = 'mainnet-beta' | 'testnet' | 'devnet';

export interface TokenInfo {
  mint: string;
  symbol: string;
  decimals: number;
}
```

## Contributing

See the [Contributing Guide](../../docs/CONTRIBUTING.md) for details on making contributions.

## Testing

```bash
pnpm test
```

This will run the test suite using Jest.

## Documentation

For more detailed documentation on specific utilities, see the JSDoc comments in the source code. 