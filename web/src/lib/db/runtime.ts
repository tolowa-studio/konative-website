/**
 * Runtime detection for Konative data access.
 *
 * - Cloudflare Workers (production today): D1 via wrangler bindings.
 * - Cloud Run / Node (TOL-321): Postgres via DATABASE_URI (TOL-314 migration).
 * - Local `next dev`: no D1 binding; map routes fall back to Supabase where coded.
 */

export type KonativeDataRuntime = "cloudflare-workers" | "postgres" | "unconfigured-node";

/** True when running on Google Cloud Run (K_SERVICE is injected by the platform). */
export function isCloudRunRuntime(): boolean {
  return Boolean(process.env.K_SERVICE);
}

export function getKonativeDataRuntime(): KonativeDataRuntime {
  if (isCloudRunRuntime() || process.env.DATABASE_URI) {
    return process.env.DATABASE_URI ? "postgres" : "unconfigured-node";
  }
  return "cloudflare-workers";
}
