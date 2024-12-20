import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["ui"],
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;
