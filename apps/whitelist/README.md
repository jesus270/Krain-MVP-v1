# Whitelist App

This application is for managing whitelists.

## Getting Started

1. **Install dependencies from the root of the monorepo:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   - Copy `apps/whitelist/.env.example` to `apps/whitelist/.env` (if it exists).
   - Fill in the required environment variables.

3. **Run the development server:**
   ```bash
   pnpm dev --filter whitelist
   ```

Open [http://localhost:3000](http://localhost:3000) (or the port specified by the app) with your browser to see the result. 