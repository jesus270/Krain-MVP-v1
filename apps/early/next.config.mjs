/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@krain/ui"],
  pageExtensions: ["js", "jsx", "ts", "tsx"],
  serverExternalPackages: ["@krain/session"],
};

export default nextConfig;
