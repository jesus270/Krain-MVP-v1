/** @type {import('next').NextConfig} */
module.exports = {
  experimental: {
    serverActions: {
      // Add your production domain and any trusted proxies here
      allowedOrigins: [
        "localhost:3000",
        "localhost",
        process.env.NEXT_PUBLIC_APP_URL,
      ].filter(Boolean),
    },
  },
};
