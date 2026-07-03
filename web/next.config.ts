import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

const webDir = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  async redirects() {
    return [
      { source: "/powered-land", destination: "/data-center-connectivity", permanent: true },
      { source: "/readiness-audit", destination: "/contact?projectType=data_center", permanent: true },
      { source: "/land/:path*", destination: "/data-center-connectivity", permanent: true },
      { source: "/capacity/:path*", destination: "/data-center-connectivity", permanent: true },
      { source: "/invest", destination: "/intelligence", permanent: true },
      { source: "/deals", destination: "/intelligence", permanent: true },
      { source: "/assessment", destination: "/contact", permanent: true },
      { source: "/for", destination: "/", permanent: true },
      { source: "/for/tribes", destination: "/tribal", permanent: true },
      { source: "/for/:path*", destination: "/connectivity", permanent: true },
      // /admin has no page route — redirect to Sanity Studio to prevent catch-all 500.
      { source: "/admin", destination: "/studio", permanent: false },
      { source: "/admin/:path*", destination: "/studio", permanent: false },
    ];
  },
  allowedDevOrigins: ["127.0.0.1"],
  /** Scope tracing to the app dir so OpenNext finds standalone at .next/standalone/.next (Cloudflare/OpenNext target). */
  outputFileTracingRoot: webDir,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/**" },
      { protocol: "https", hostname: "cdn.builder.io", pathname: "/**" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  sourcemaps: { disable: true },
  disableLogger: true,
});
