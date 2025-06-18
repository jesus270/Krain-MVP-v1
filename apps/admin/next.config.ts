/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@krain/ui", "@krain/utils", "@krain/db"],
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  serverExternalPackages: ["@krain/session"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    optimizePackageImports: ["@krain/ui", "@krain/utils", "@krain/db"],
  },
  poweredByHeader: false,
  env: {
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  },
};

export default nextConfig;
