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
    const backendUrl = process.env.INTERNAL_BACKEND_URL || 'http://127.0.0.1:5000';
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
