# Krain Database

Shared database utilities and models using [Drizzle ORM](https://orm.drizzle.team/) with [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres).

## Overview

This package provides:

- Database schema definitions
- Type-safe query builders
- Migration utilities
- Connection management

## Installation

The package is automatically available to all applications in the monorepo. For manual installation:

```bash
pnpm add @krain/db
```

## Usage

```typescript
import { db } from "@krain/db";
import { airdrop } from "@krain/db/schema";

// Query example
const records = await db.select().from(airdrop);

// Insert example
const result = await db.insert(airdrop).values({
  tokenMint: "...",
  amount: 1000,
  recipients: ["..."],
});
```

## Schema

The database schema is defined using Drizzle ORM:

```typescript
// Example schema - update with actual schema
export const airdrop = pgTable("airdrop", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenMint: text("token_mint").notNull(),
  amount: numeric("amount").notNull(),
  recipients: array(text("recipients")).notNull(),
  status: text("status", {
    enum: ["pending", "completed", "failed"],
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

## Migrations

### Generate Migrations

```bash
pnpm generate
```

This will create a new migration file in `drizzle/migrations/`.

### Run Migrations

```bash
pnpm migrate
```

This will apply any pending migrations to the database.

## Environment Variables

Required environment variables:

- `DATABASE_URL` - Vercel Postgres connection URL

## Scripts

- `pnpm generate` - Generate migrations from schema changes
- `pnpm migrate` - Run pending migrations
- `pnpm studio` - Open Drizzle Studio for database management
- `pnpm type-check` - Run TypeScript type checking

## Contributing

See the [Contributing Guide](../../docs/CONTRIBUTING.md) for details on making contributions.

## Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
