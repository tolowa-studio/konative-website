import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare Worker bindings available to Konative (see web/wrangler.jsonc). */
export interface KonativeBindings {
  DB?: D1Database;
  TILES?: R2Bucket;
  DATA?: R2Bucket;
  ASSETS?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
}

export class CloudflareBindingUnavailableError extends Error {
  constructor(binding: string) {
    super(`Cloudflare binding "${binding}" is unavailable in this runtime.`);
    this.name = "CloudflareBindingUnavailableError";
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function getBindings(): KonativeBindings {
  try {
    const { env } = getCloudflareContext();
    return env as KonativeBindings;
  } catch (error) {
    console.error("Konative Cloudflare binding unavailable", {
      binding: "runtime context",
      operation: "getBindings",
      error: errorMessage(error),
    });
    throw new CloudflareBindingUnavailableError("runtime context");
  }
}

export function getD1(): D1Database {
  const db = getBindings().DB;
  if (db) return db;

  console.error("Konative Cloudflare binding unavailable", {
    binding: "DB",
    operation: "getD1",
    error: "D1 binding is not configured",
  });
  throw new CloudflareBindingUnavailableError("DB");
}

export function rethrowD1OperationFailure(operation: string, error: unknown): never {
  console.error("Konative D1 operation failed", {
    dependency: "D1",
    operation,
    error: errorMessage(error),
  });
  throw error;
}
