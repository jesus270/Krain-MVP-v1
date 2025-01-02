# Development Guide

This guide covers the development workflow and best practices for working with the Krain monorepo.

## Development Environment

### Requirements

1. **Node.js**: v18 or later
2. **pnpm**: v8.9.0 or later
3. **Git**: Latest version recommended
4. **Code Editor**: VS Code recommended with the following extensions:
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - Tailwind CSS IntelliSense

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-org/krain.git
   cd krain
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

## Development Workflow

### Running Applications

1. Start all applications:

   ```bash
   pnpm dev
   ```

2. Start a specific application:
   ```bash
   pnpm dev --filter airdrop
   ```

### Building

1. Build all packages and applications:

   ```bash
   pnpm build
   ```

2. Build specific packages:
   ```bash
   pnpm build --filter "@krain/ui"
   ```

### Testing

1. Run all tests:

   ```bash
   pnpm test
   ```

2. Run tests in watch mode:

   ```bash
   pnpm test:watch
   ```

3. Run tests for a specific package:
   ```bash
   pnpm test --filter "@krain/utils"
   ```

### Code Quality

1. Lint code:

   ```bash
   pnpm lint
   ```

2. Format code:

   ```bash
   pnpm format
   ```

3. Type check:
   ```bash
   pnpm type-check
   ```

## Project Structure

### Applications (`apps/`)

Each application follows this structure:

```
apps/app-name/
├── src/
│   ├── app/            # Next.js App Router pages
│   ├── components/     # React components
│   ├── lib/           # Utilities and configurations
│   ├── hooks/         # React hooks
│   └── server/        # Server-side code
├── public/            # Static assets
├── tests/            # Test files
└── package.json      # Dependencies and scripts
```

### Packages (`packages/`)

Each package follows this structure:

```
packages/package-name/
├── src/
│   ├── index.ts      # Main entry point
│   └── components/   # Package components/functions
├── tests/           # Test files
└── package.json     # Dependencies and scripts
```

## Best Practices

### Code Organization

1. **Component Structure**

   - One component per file
   - Co-locate related files (tests, styles, types)
   - Use index files for clean exports

2. **State Management**

   - Use React hooks for local state
   - Consider Zustand for global state
   - Keep state as close to usage as possible

3. **Performance**
   - Lazy load components when possible
   - Memoize expensive computations
   - Use proper React hooks dependencies

### TypeScript

1. **Type Safety**

   - Avoid using `any`
   - Use strict type checking
   - Create reusable type definitions

2. **Type Definitions**
   - Place shared types in `types.ts`
   - Use descriptive type names
   - Document complex types

### Testing

1. **Unit Tests**

   - Test individual components and functions
   - Mock external dependencies
   - Focus on behavior, not implementation

2. **Integration Tests**
   - Test component interactions
   - Test data flow
   - Test user workflows

### Git Workflow

1. **Branches**

   - `main`: Production-ready code
   - `develop`: Development branch
   - Feature branches: `feature/name`
   - Bug fixes: `fix/name`

2. **Commits**
   - Use conventional commits
   - Keep commits focused
   - Write descriptive messages

## Troubleshooting

### Common Issues

1. **Build Failures**

   - Clear Turborepo cache: `pnpm clean`
   - Remove node_modules: `pnpm clean:deps`
   - Rebuild: `pnpm install && pnpm build`

2. **Type Errors**

   - Update dependencies
   - Check type definitions
   - Run `pnpm type-check`

3. **Test Failures**
   - Update test snapshots
   - Check test environment
   - Verify test data

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [pnpm Documentation](https://pnpm.io/motivation)
