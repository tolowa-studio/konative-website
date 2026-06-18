import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { withSentryConfig } from "@sentry/nextjs";

/** Parent of `web/` — must match Vercel `outputFileTracingRoot` when Root Directory is `web`. */
const webDir = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(webDir, "..");

const nextConfig: NextConfig = {
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
    ];
  },
  allowedDevOrigins: ["127.0.0.1"],
  /** Tracing includes monorepo root so Vercel serverless output matches local builds when app lives in `web/`. */
  outputFileTracingRoot: monorepoRoot,
  turbopack: {
    root: monorepoRoot,
  },
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
  automaticVercelMonitors: true,
});
