/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@krain/ui", "@krain/utils", "@krain/session"],
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  env: {
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  },
  async redirects() {
    return [
      {
        source: "/terms",
        destination: "https://krain.gitbook.io/krain/legal",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
