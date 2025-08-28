import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static exports and optimizations for Vercel
  output: 'standalone',
  
  // Fix the workspace root warning
  outputFileTracingRoot: __dirname,
  
  // TypeScript and ESLint config
  eslint: {
    ignoreDuringBuilds: true, // Ignore linting in production builds for deployment
  },
  typescript: {
    ignoreBuildErrors: false, // Keep strict TypeScript checking
  },
  
  // Optimize images for Vercel
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable Server Actions if needed in future
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Disable CSS optimization that's causing issues
    optimizeCss: false,
  },

  // Compiler optimizations for production
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Enable compression and optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },

  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
