/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  webpack: (config, { dev, isServer }) => {
    // Exclude test files from the build
    config.module.rules.push({
      test: /(__tests__|__mocks__|\.test|\.spec)\.[jt]sx?$/,
      exclude: /node_modules/,
      loader: "ignore-loader",
    });
    return config;
  },
};

export default nextConfig;
