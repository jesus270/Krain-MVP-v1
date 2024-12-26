/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@repo/ui"],
  pageExtensions: ["js", "jsx", "ts", "tsx"],
};

export default nextConfig;
