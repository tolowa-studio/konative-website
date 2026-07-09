/** Minimal Cloudflare binding types for Konative D1/R2/KV (see wrangler.jsonc). */
declare global {
  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(): Promise<T | null>;
    all<T = unknown>(): Promise<{ results?: T[] }>;
    run(): Promise<unknown>;
  }

  interface D1Database {
    prepare(query: string): D1PreparedStatement;
  }

  interface R2Bucket {
    get(key: string): Promise<R2ObjectBody | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | string): Promise<unknown>;
  }

  interface R2ObjectBody {
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
  }

  interface KVNamespace {
    get(key: string): Promise<string | null>;
    put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
  }

  interface AnalyticsEngineDataset {
    writeDataPoint(data: {
      indexes?: string[];
      blobs?: string[];
      doubles?: number[];
    }): void;
  }
}

export {};
