# Token App

This application is for managing Krain tokens.

## Getting Started

1. **Install dependencies from the root of the monorepo:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   - Copy `apps/token/.env.example` to `apps/token/.env` (if it exists).
   - Fill in the required environment variables.

3. **Run the development server:**
   ```bash
   pnpm dev --filter token
   ```

Open [http://localhost:3000](http://localhost:3000) (or the port specified by the app) with your browser to see the result. 