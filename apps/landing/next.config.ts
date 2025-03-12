import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@krain/ui", "@krain/utils"],
  serverExternalPackages: ["@krain/session", "@krain/db"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
