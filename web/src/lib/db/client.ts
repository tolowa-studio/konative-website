/**
 * Unified Konative database client — routes to Worker D1 or Cloud SQL Postgres.
 */
import type { IntelDatabase } from "./types";
import { getKonativeDataRuntime } from "./runtime";
import { getWorkerBindings, getWorkerD1 } from "./worker-bindings";
import { PostgresDatabaseUnavailableError } from "./postgres-errors";

export class CloudflareBindingUnavailableError extends Error {
  constructor(binding: string) {
    super(`Cloudflare binding "${binding}" is unavailable in this runtime.`);
    this.name = "CloudflareBindingUnavailableError";
  }
}

export class DatabaseUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseUnavailableError";
  }
}

/** Cloudflare Worker bindings (Worker runtime only). */
export interface KonativeBindings {
  DB?: D1Database;
  TILES?: R2Bucket;
  DATA?: R2Bucket;
  ASSETS?: { fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> };
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function getBindings(): KonativeBindings {
  const runtime = getKonativeDataRuntime();
  if (runtime !== "cloudflare-workers") {
    console.error("Konative Cloudflare binding unavailable", {
      binding: "runtime context",
      operation: "getBindings",
      runtime,
      error: "Cloudflare bindings are not available outside the Worker runtime",
    });
    throw new CloudflareBindingUnavailableError("runtime context");
  }

  return getWorkerBindings();
}

type IntelDatabaseClient = IntelDatabase;

export async function getD1(): Promise<IntelDatabaseClient> {
  const runtime = getKonativeDataRuntime();

  if (runtime === "cloudflare-workers") {
    try {
      return getWorkerD1() as unknown as IntelDatabaseClient;
    } catch (error) {
      console.error("Konative Cloudflare binding unavailable", {
        binding: "DB",
        operation: "getD1",
        error: errorMessage(error),
      });
      throw new CloudflareBindingUnavailableError("DB");
    }
  }

  if (runtime === "postgres") {
    try {
      const { getPostgresD1 } = await import("./postgres");
      return getPostgresD1();
    } catch (error) {
      console.error("Konative Postgres database unavailable", {
        dependency: "postgres",
        operation: "getD1",
        error: errorMessage(error),
      });
      if (error instanceof PostgresDatabaseUnavailableError) {
        throw new DatabaseUnavailableError(error.message);
      }
      throw error;
    }
  }

  console.error("Konative database unavailable", {
    dependency: "database",
    operation: "getD1",
    runtime,
    error: "DATABASE_URI is required on Cloud Run until TOL-314 completes",
  });
  throw new DatabaseUnavailableError(
    "DATABASE_URI is not configured for Cloud Run. Cloud SQL migration (TOL-314) is required.",
  );
}

export function rethrowD1OperationFailure(operation: string, error: unknown): never {
  const runtime = getKonativeDataRuntime();
  console.error("Konative database operation failed", {
    dependency: runtime === "postgres" ? "postgres" : "D1",
    operation,
    error: errorMessage(error),
  });
  throw error;
}
