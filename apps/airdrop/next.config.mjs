/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@krain/ui"],
  pageExtensions: ["js", "jsx", "ts", "tsx"],
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

export default nextConfig;
