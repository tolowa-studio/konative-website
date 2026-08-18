/**
 * Cloudflare Worker binding accessors — Worker / OpenNext runtime only.
 *
 * Do not import this module from Cloud Run code paths. Use `@/lib/db/client` instead.
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare Worker bindings available to Konative (see web/wrangler.jsonc). */
export interface KonativeBindings {
  DB?: D1Database;
  TILES?: R2Bucket;
  DATA?: R2Bucket;
  ASSETS?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function getWorkerBindings(): KonativeBindings {
  try {
    const { env } = getCloudflareContext();
    return env as KonativeBindings;
  } catch (error) {
    console.error("Konative Cloudflare binding unavailable", {
      binding: "runtime context",
      operation: "getWorkerBindings",
      error: errorMessage(error),
    });
    throw error;
  }
}

export function getWorkerD1(): D1Database {
  const db = getWorkerBindings().DB;
  if (db) return db;

  console.error("Konative Cloudflare binding unavailable", {
    binding: "DB",
    operation: "getWorkerD1",
    error: "D1 binding is not configured",
  });
  throw new Error("D1 binding is not configured");
}
