# Package Management Guide

This guide covers package management in the Krain monorepo using pnpm workspaces and Turborepo.

## Overview

The monorepo uses:
- [pnpm](https://pnpm.io/) for package management
- [Turborepo](https://turbo.build/repo/docs) for build system
- Workspaces for package organization

## Workspace Structure

```
krain/
├── apps/               # Applications
│   └── airdrop/       # Airdrop application
├── packages/          # Shared packages
│   ├── database/     # Database utilities
│   ├── ui/          # UI components
│   ├── utils/       # Shared utilities
│   ├── eslint-config/
│   └── typescript-config/
└── pnpm-workspace.yaml
```

## Package Management Commands

### Installing Dependencies

1. **Install all dependencies**
   ```bash
   pnpm install
   ```

2. **Add dependency to specific package**
   ```bash
   pnpm add <package> --filter <workspace-name>
   ```
   Example:
   ```bash
   pnpm add react --filter @repo/ui
   ```

3. **Add development dependency**
   ```bash
   pnpm add -D <package> --filter <workspace-name>
   ```

4. **Add dependency to all packages**
   ```bash
   pnpm add -w <package>
   ```

### Removing Dependencies

1. **Remove from specific package**
   ```bash
   pnpm remove <package> --filter <workspace-name>
   ```

2. **Remove from all packages**
   ```bash
   pnpm remove -w <package>
   ```

### Updating Dependencies

1. **Check for updates**
   ```bash
   pnpm update --interactive
   ```

2. **Update specific package**
   ```bash
   pnpm update <package> --filter <workspace-name>
   ```

3. **Update all dependencies**
   ```bash
   pnpm update
   ```

## Workspace Management

### Adding New Package

1. Create package directory:
   ```bash
   mkdir packages/new-package
   ```

2. Initialize package:
   ```bash
   cd packages/new-package
   pnpm init
   ```

3. Update `package.json`:
   ```json
   {
     "name": "@repo/new-package",
     "version": "0.1.0",
     "private": true,
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsup",
       "dev": "tsup --watch",
       "lint": "eslint .",
       "type-check": "tsc --noEmit"
     }
   }
   ```

4. Add to `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - 'packages/*'
     - 'apps/*'
   ```

### Adding New Application

1. Create application:
   ```bash
   pnpm create next-app apps/new-app
   ```

2. Update `package.json`:
   ```json
   {
     "name": "new-app",
     "private": true,
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "eslint ."
     }
   }
   ```

## Dependencies Between Packages

### Internal Dependencies

1. **Add workspace dependency**
   ```bash
   pnpm add @repo/ui --filter airdrop
   ```

2. In `package.json`:
   ```json
   {
     "dependencies": {
       "@repo/ui": "workspace:*"
     }
   }
   ```

### External Dependencies

1. **Shared dependencies** should be added to root `package.json`
2. **Package-specific** dependencies in package's `package.json`

## Version Management

### Package Versioning

1. **Update version**
   ```bash
   pnpm version <major|minor|patch> --filter <package-name>
   ```

2. **Publish changes**
   ```bash
   pnpm publish --filter <package-name>
   ```

### Lockfile Management

1. **Update lockfile**
   ```bash
   pnpm install --lockfile-only
   ```

2. **Clean install**
   ```bash
   pnpm install --frozen-lockfile
   ```

## Scripts

### Running Scripts

1. **Run script in all packages**
   ```bash
   pnpm -r <script>
   ```

2. **Run script in specific package**
   ```bash
   pnpm --filter <package-name> <script>
   ```

3. **Run script with dependencies**
   ```bash
   pnpm -r --filter <package-name>... <script>
   ```

### Common Scripts

```json
{
  "scripts": {
    "build": "turbo build",
    "dev": "turbo dev",
    "lint": "turbo lint",
    "type-check": "turbo type-check",
    "test": "turbo test",
    "clean": "turbo clean && rm -rf node_modules"
  }
}
```

## Best Practices

1. **Dependency Management**
   - Keep dependencies up to date
   - Use exact versions
   - Minimize duplicate dependencies

2. **Workspace Organization**
   - Group related packages
   - Use consistent naming
   - Maintain clean dependencies

3. **Version Control**
   - Commit lockfile changes
   - Review dependency updates
   - Keep versions in sync

4. **Performance**
   - Use Turborepo cache
   - Optimize build order
   - Share common configurations

## Troubleshooting

### Common Issues

1. **Dependency Conflicts**
   - Check version requirements
   - Update lockfile
   - Clean install

2. **Build Issues**
   - Clear Turborepo cache
   - Check package.json scripts
   - Verify dependencies

3. **Workspace Issues**
   - Check workspace config
   - Verify package names
   - Check file paths

## Additional Resources

- [pnpm Workspace Guide](https://pnpm.io/workspaces)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Node.js Package Management](https://nodejs.org/en/docs/guides/package-management)