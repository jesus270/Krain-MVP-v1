# Krain Monorepo

This monorepo contains all the applications and shared packages for the Krain project. It uses [pnpm](https://pnpm.io/) for package management and [Turborepo](https://turbo.build/) for build system orchestration.

## Overview

The Krain monorepo is structured into two main directories:

### Applications (`apps/`)

- [**Airdrop**](apps/airdrop/README.md) - Solana airdrop application for token distribution

### Packages (`packages/`)

- [**Database**](packages/database/README.md) - Database utilities and models using Drizzle ORM
- [**UI**](packages/ui/README.md) - Shared UI component library using shadcn/ui
- [**Utils**](packages/utils/README.md) - Common utility functions and helpers
- [**ESLint Config**](packages/eslint-config/README.md) - Shared ESLint configuration
- [**TypeScript Config**](packages/typescript-config/README.md) - Shared TypeScript configuration

## Tech Stack

### Core Technologies
- **Frontend**: [Next.js](https://nextjs.org/docs) 15.1 with [React](https://react.dev/) 19
- **Styling**: [Tailwind CSS](https://tailwindcss.com/docs) with [shadcn/ui](https://ui.shadcn.com/) components
- **Database**: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) with [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- **Build System**: [Turborepo](https://turbo.build/repo/docs) for monorepo management
- **Package Management**: [pnpm workspace](https://pnpm.io/workspaces)
- **Type Safety**: [TypeScript](https://www.typescriptlang.org/docs/) with shared configuration
- **Blockchain**: [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [pnpm](https://pnpm.io/) (v8.9.0 or later)

## Quick Start

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run all applications:
   ```bash
   pnpm dev
   ```

3. Run a specific application:
   ```bash
   pnpm dev --filter <app-name>
   ```

## Development

For detailed development instructions, see:
- [Development Guide](docs/DEVELOPMENT.md)
- [Contributing Guide](docs/CONTRIBUTING.md)
- [Package Management](docs/PACKAGE-MANAGEMENT.md)

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build all packages and applications
- `pnpm lint` - Run linting across the monorepo
- `pnpm test` - Run tests across the monorepo
- `pnpm clean` - Clean build artifacts

## Contributing

1. Create a new branch for your feature/fix
2. Make your changes
3. Run tests and linting
4. Submit a pull request

For detailed contribution guidelines, see our [Contributing Guide](docs/CONTRIBUTING.md).

## License

MIT License - see [LICENSE](LICENSE) for details
