import { defineConfig, Options } from "tsup";

export default defineConfig((options): Options[] => [
  {
    // Client bundle configuration
    entry: ["src/index.ts"], // Entry point for client bundle
    outDir: "dist", // Specify output directory
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true, // Clean only once for the whole build
    minify: !options.watch,
    external: ["react", "react-dom", "next"],
    banner: {
      // Apply "use client" only to client code
      js: `"use client";`,
    },
    treeshake: true,
    outExtension({ format }) {
      // Ensure consistent naming (index.js, index.mjs)
      return {
        js: format === "cjs" ? `.js` : `.mjs`,
      };
    },
  },
  {
    // Server bundle configuration
    entry: ["src/server.ts"], // Entry point for server bundle
    outDir: "dist", // Specify output directory
    format: ["esm", "cjs"],
    dts: true,
    splitting: false,
    sourcemap: true,
    // clean: false, // Don't clean again
    minify: !options.watch,
    external: ["react", "react-dom", "next"],
    // NO "use client" banner for server code
    treeshake: true,
    outExtension({ format }) {
      // Ensure consistent naming (server.js, server.mjs)
      return {
        js: format === "cjs" ? `.js` : `.mjs`,
      };
    },
  },
]);
