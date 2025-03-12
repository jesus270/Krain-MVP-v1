/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig;
