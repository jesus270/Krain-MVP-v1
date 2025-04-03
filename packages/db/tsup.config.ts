import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: false,
  clean: true,
  external: ["@solana/web3.js", "drizzle-orm", "@vercel/postgres"],
});
