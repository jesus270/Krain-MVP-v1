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
  optimizeFonts: false,
  poweredByHeader: false,
  env: {
    KV_REST_API_URL: process.env.KV_REST_API_URL,
    KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  },

  // Configure multiple CORS headers, one for each allowed origin
  async headers() {
    return [
      // Specific header for krain.ai
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "origin",
            value: "https://krain.ai",
          },
        ],
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://krain.ai" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
      // Specific header for landing.krain.ai
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "origin",
            value: "https://landing.krain.ai",
          },
        ],
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://landing.krain.ai",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
      // Specific header for www.krain.ai
      {
        source: "/(.*)",
        has: [
          {
            type: "header",
            key: "origin",
            value: "https://www.krain.ai",
          },
        ],
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://www.krain.ai" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      },
      // Default headers for all other requests (without specific CORS origin)
      {
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "X-Requested-With, Content-Type, Authorization",
          },
          { key: "Vary", value: "Origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
