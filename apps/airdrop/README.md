# Krain Airdrop

A Next.js application for managing Solana token airdrops.

## Features

- Server-side rendering with [Next.js App Router](https://nextjs.org/docs/app)
- Solana wallet integration with [Solana Web3.js](https://solana-labs.github.io/solana-web3.js/)
- Type-safe database operations with [Drizzle ORM](https://orm.drizzle.team/docs/overview)
- Modern UI with [shadcn/ui](https://ui.shadcn.com/docs)
- Dark mode support via [next-themes](https://github.com/pacocoursey/next-themes)
- Form handling with [react-hook-form](https://react-hook-form.com/docs) and [zod](https://zod.dev/)
- Toast notifications using [sonner](https://sonner.emilkowal.ski/)

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your configuration.

3. Run the development server:
   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `DATABASE_URL` - Vercel Postgres connection URL
- `NEXT_PUBLIC_SOLANA_NETWORK` - Solana network to connect to (mainnet-beta, testnet, or devnet)
- `NEXT_PUBLIC_RPC_URL` - Custom Solana RPC URL (optional)

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm clean` - Clean build artifacts

## Architecture

The application follows Next.js 13+ conventions with the App Router:

```
src/
├── app/              # App Router pages and layouts
├── components/       # React components
├── lib/             # Utility functions and configurations
├── hooks/           # Custom React hooks
└── server/          # Server-side code and API routes
```

## Database Schema

The application uses Drizzle ORM with the following schema:

```typescript
// Example schema - update with actual schema
interface Airdrop {
  id: string;
  tokenMint: string;
  amount: number;
  recipients: string[];
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
}
```

## Contributing

See the [Contributing Guide](../../docs/CONTRIBUTING.md) for details on making contributions. 