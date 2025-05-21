# Telegram Bot App

This application is the Krain Telegram Bot.

## Getting Started

1. **Install dependencies from the root of the monorepo:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   - Copy `apps/tgbot/.env.example` to `apps/tgbot/.env` (if it exists).
   - Fill in the required environment variables, especially your Telegram Bot token.

3. **Build the bot:**
   ```bash
   pnpm build --filter tgbot
   ```

4. **Run the bot:**
   ```bash
   pnpm start --filter tgbot
   ```

Consult the `package.json` in `apps/tgbot` for other available scripts. 