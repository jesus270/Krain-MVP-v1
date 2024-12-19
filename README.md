# Krain Monorepo

This monorepo contains all the applications and shared packages for the Krain project. It uses [pnpm](https://pnpm.io/) for package management and [Turborepo](https://turbo.build/) for build system orchestration.

## Repository Structure

```
krain/
├── apps/               # Application projects
│   └── airdrop/       # Airdrop application
├── packages/          # Shared packages
│   ├── config/       # Shared configuration
│   ├── database/     # Database utilities and models
│   ├── ui/          # Shared UI components (shadcn/ui)
│   └── utils/       # Common utilities
```

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [pnpm](https://pnpm.io/) (v8 or later)

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run development servers:

   ```bash
   # Run all applications
   pnpm dev

   # Run a specific application
   pnpm dev --filter airdrop
   ```

3. Build:

   ```bash
   # Build all packages and applications
   pnpm build

   # Build a specific package or application
   pnpm build --filter <package-name>
   ```

## Development Workflow

### Package Management

- Add a dependency to a specific package/app:

  ```bash
  pnpm add <package> --filter <workspace-name>
  ```

- Add a dependency to all packages:
  ```bash
  pnpm add -w <package>
  ```

### Using Shared Packages

Packages in the `packages/` directory are automatically available to all applications. Import them using their package name as defined in their respective `package.json` files.

### UI Components with shadcn/ui

We use [shadcn/ui](https://ui.shadcn.com/) for our component library, which is maintained in the `packages/ui` directory. These components are available to all applications in the monorepo.

#### Adding New Components

To add a new shadcn component to the shared UI package:

1. Navigate to the UI package directory:

   ```bash
   cd packages/ui
   ```

2. Add the component using npx (since we're using pnpm):

   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```

   For example: `pnpm dlx shadcn@latest add button`

   Note: Make sure you're in the `packages/ui` directory when running this command, as it needs to access the local `components.json` configuration.

3. The component will be added to `packages/ui/components/` and can be imported in any application:
   ```typescript
   import { Button } from "ui/components/ui/button";
   ```

#### Customizing Components

- All shadcn components are customizable through the `components.json` file in the UI package
- Tailwind CSS configurations are shared across the monorepo
- Component styles can be modified in their respective files in `packages/ui/components/ui`

### Turborepo Features

This monorepo uses Turborepo for efficient build caching and task running:

- Cached builds for faster development
- Parallel task execution
- Dependency-aware task scheduling
- Shared configuration via `turbo.json`

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
