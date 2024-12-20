# Krain UI

Shared UI components for Krain applications using [shadcn/ui](https://ui.shadcn.com/).

## Overview

This package provides a collection of reusable UI components built with:
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)

## Installation

The package is automatically available to all applications in the monorepo. For manual installation:

```bash
pnpm add @repo/ui
```

## Usage

Import components directly from the package:

```typescript
import { Button } from "@repo/ui/components/ui/button";
import { Input } from "@repo/ui/components/ui/input";
```

## Available Components

- **Core**
  - Button
  - Input
  - Label
  - Slot
  - Card
  - Form

- **Layout**
  - Container
  - Section
  - Grid

- **Feedback**
  - Toast
  - Alert
  - Progress

## Adding New Components

1. Navigate to the package directory:
   ```bash
   cd packages/ui
   ```

2. Add a new shadcn component:
   ```bash
   pnpm dlx shadcn@latest add <component-name>
   ```

3. The component will be added to `components/ui/`.

## Customization

### Theme

The theme is customizable through:
- `tailwind.config.js` - Tailwind configuration
- `components.json` - shadcn/ui configuration
- `styles/globals.css` - Global styles

### Component Styles

Each component can be customized in its respective file:

```typescript
// components/ui/button.tsx
export const Button = ({
  variant = "default",
  size = "default",
  ...props
}) => {
  // Customize component here
};
```

## Contributing

See the [Contributing Guide](../../docs/CONTRIBUTING.md) for details on making contributions.

## Documentation

- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/docs/primitives/overview/introduction) 