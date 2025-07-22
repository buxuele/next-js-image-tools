import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ["sharp"],
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // Compression
  compress: true,

  // Headers for caching and security
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
            },
            sharp: {
              test: /[\\/]node_modules[\\/]sharp[\\/]/,
              name: "sharp",
              chunks: "all",
              priority: 10,
            },
          },
        },
      };
    }

    // Optimize Sharp for server-side usage
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        sharp: "commonjs sharp",
      });
    }

    return config;
  },

  // Output configuration for deployment
  output: "standalone",

  // Environment variables (NODE_ENV is not allowed in Next.js 15)
  env: {
    MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || "67108864", // 64MB
    MAX_CONCURRENT_OPERATIONS: process.env.MAX_CONCURRENT_OPERATIONS || "3",
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Note: API configuration is handled in individual route files in Next.js 15
};

export default nextConfig;
