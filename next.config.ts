import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  allowedDevOrigins: [
    '127.0.0.1',
    'localhost',
    '*.replit.dev',
  ],
};

export default nextConfig;
