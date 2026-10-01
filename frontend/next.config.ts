import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    '62.220.123.21',
    '62.220.123.21:*',
    'localhost:3000',
    'localhost:4000',
    '127.0.0.1:3000',
    '127.0.0.1:4000',
    '*.run.app'
  ],
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
      {
        source: "/api-docs/:path*",
        destination: "http://localhost:5000/api-docs/:path*",
      },
    ];
  },
};

export default nextConfig;
