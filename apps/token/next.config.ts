import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@krain/ui", "@krain/utils"],
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  serverExternalPackages: ["@krain/session"],
};

export default nextConfig;
