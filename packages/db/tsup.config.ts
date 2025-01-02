import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["@solana/web3.js", "drizzle-orm", "@vercel/postgres"],
});
