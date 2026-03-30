import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      { hostname: "flagcdn.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/drug-timing", destination: "/medication-hub", permanent: true },
      { source: "/medication-schedule", destination: "/medication-hub", permanent: true },
      { source: "/smart-reminders", destination: "/medication-hub", permanent: true },
      { source: "/health-goal-coach", destination: "/health-goals", permanent: true },
      { source: "/medication-reader", destination: "/prospectus-reader", permanent: true },
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

export default withSentryConfig(nextConfig, {
  org: "phytotherapyai",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  tunnelRoute: "/monitoring",
  widenClientFileUpload: true,
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
});
