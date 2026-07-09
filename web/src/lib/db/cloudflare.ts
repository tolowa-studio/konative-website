import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare Worker bindings available to Konative (see web/wrangler.jsonc). */
export interface KonativeBindings {
  DB?: D1Database;
  TILES?: R2Bucket;
  DATA?: R2Bucket;
  CACHE?: KVNamespace;
  METRICS?: AnalyticsEngineDataset;
  ASSETS?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
}

export function getBindings(): KonativeBindings | null {
  try {
    const { env } = getCloudflareContext();
    return env as KonativeBindings;
  } catch {
    return null;
  }
}

export function getD1(): D1Database | null {
  return getBindings()?.DB ?? null;
}

export function getMetrics(): AnalyticsEngineDataset | null {
  return getBindings()?.METRICS ?? null;
}

export function getCache(): KVNamespace | null {
  return getBindings()?.CACHE ?? null;
}
