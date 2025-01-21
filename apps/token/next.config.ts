import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@krain/ui", "@krain/utils", "@krain/session"],
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  serverExternalPackages: ["@krain/session"],
};

export default nextConfig;
