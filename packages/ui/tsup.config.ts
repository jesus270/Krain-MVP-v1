import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.tsx"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: [
    "react",
    "react-dom",
    "next-themes",
    "sonner",
    "@solana/web3.js",
    "react-hook-form",
  ],
});
