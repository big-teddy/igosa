const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'thumbnail.coupangcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'shopping-phinf.pstatic.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Enable instrumentation for Sentry
    instrumentationHook: true,
  },
  // Disable ESLint during build to prevent CI failures
  // ESLint is run separately in CI pipeline
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript errors during build (already checked in CI)
  typescript: {
    ignoreBuildErrors: false, // Keep TypeScript checks enabled
  },
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // Suppress source map upload logs during build
  silent: true,

  // Organization and project from environment or Sentry settings
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for uploading source maps
  authToken: process.env.SENTRY_AUTH_TOKEN,
};

// Only wrap with Sentry in production or if DSN is set
const shouldUseSentry = process.env.NEXT_PUBLIC_SENTRY_DSN && process.env.NODE_ENV === 'production';

module.exports = shouldUseSentry
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
