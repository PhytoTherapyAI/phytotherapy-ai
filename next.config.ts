import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { hostname: "flagcdn.com" },
    ],
    formats: ["image/webp", "image/avif"],
    minimumCacheTTL: 31536000,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      { source: "/drug-timing", destination: "/medication-hub", permanent: true },
      { source: "/medication-schedule", destination: "/medication-hub", permanent: true },
      { source: "/smart-reminders", destination: "/medication-hub", permanent: true },
      { source: "/health-goal-coach", destination: "/health-goals", permanent: true },
      { source: "/medication-reader", destination: "/prospectus-reader", permanent: true },
      // Legal consolidation: /privacy retired in favour of /aydinlatma v2.1
      // (KVKK Md.10 disclosure — single source of truth). Preserves old
      // bookmarks + SEO inbound.
      { source: "/privacy", destination: "/aydinlatma", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

// Only apply Sentry source map upload if auth token is available
const hasSentryToken = !!process.env.SENTRY_AUTH_TOKEN;

export default hasSentryToken
  ? withSentryConfig(nextConfig, {
      org: "phytotherapyai",
      project: "javascript-nextjs",
      silent: !process.env.CI,
      tunnelRoute: "/monitoring",
      widenClientFileUpload: true,
      bundleSizeOptimizations: {
        excludeDebugStatements: true,
      },
    })
  : nextConfig;
