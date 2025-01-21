import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@krain/ui", "@krain/utils"],
  serverExternalPackages: ["@krain/session", "@krain/db"],
};

export default nextConfig;
