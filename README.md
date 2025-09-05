# Krain Monorepo

This monorepo contains all the applications and shared packages for the Krain project. It uses [pnpm](https://pnpm.io/) for package management and [Turborepo](https://turbo.build/) for build system orchestration.

## Overview

The Krain monorepo is structured into two main directories:

### Applications (`apps/`)

- [**Admin**](apps/admin/README.md) - Admin dashboard
- [**Airdrop**](apps/airdrop/README.md) - Solana airdrop application for token distribution
- [**Early**](apps/early/README.md) - Early access application
- [**Landing**](apps/landing/README.md) - Landing page
- [**Marketplace**](apps/marketplace/README.md) - Marketplace application
- [**Token**](apps/token/README.md) - Token management application
- [**Whitelist**](apps/whitelist/README.md) - Whitelist application
- [**TgBot**](apps/tgbot/README.md) - Telegram Bot

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
   ```bash
   npm install -g pnpm@latest
   ```

## Quick Start

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   - Copy `.env.example` to `.env` in the respective app or package directory.
   - Fill in the required environment variables.

3. **Build workspace packages:**
   ```bash
   pnpm build
   ```

4. **Run a specific application (e.g., landing):**
   ```bash
   pnpm dev --filter landing
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
