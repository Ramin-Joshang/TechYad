import type { NextConfig } from "next";

const rawBackend = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';
const backendUrl = rawBackend.replace(/\/api\/?$/, '');

const nextConfig: NextConfig = {
  typescript: {
    // Enforce TypeScript validation for production safety
    ignoreBuildErrors: false,
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
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 60,
    },
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/api-docs/:path*",
        destination: `${backendUrl}/api-docs/:path*`,
      },
    ];
  },
};

export default nextConfig;
