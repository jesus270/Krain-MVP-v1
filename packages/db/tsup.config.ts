import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts", "schema.ts", "client.ts", "telegram.ts", "privy.ts"],
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: true,
  external: ["@solana/web3.js", "drizzle-orm", "@vercel/postgres"],
});
