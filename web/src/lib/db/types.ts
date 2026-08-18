/**
 * Minimal D1-shaped interface shared by Cloudflare D1 and the Postgres adapter.
 */
export interface IntelPreparedStatement {
  bind(...values: unknown[]): IntelPreparedStatement;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  first<T = Record<string, unknown>>(): Promise<T | null>;
}

export interface IntelDatabase {
  prepare(sql: string): IntelPreparedStatement;
}
