import { getD1 } from "./cloudflare";

let cachedReady: boolean | null = null;
let cachedAt = 0;
const CACHE_MS = 60_000;

/** True when D1 binding exists and tbcp_awards has been migrated. */
export async function isD1TbcpReady(): Promise<boolean> {
  const db = getD1();
  if (!db) return false;
  try {
    const row = await db
      .prepare("SELECT 1 AS ok FROM tbcp_awards LIMIT 1")
      .first<{ ok: number }>();
    return !!row;
  } catch {
    return false;
  }
}

/** True when D1 binding exists and interconnection_queue has been migrated. */
export async function isD1QueueReady(): Promise<boolean> {
  const db = getD1();
  if (!db) return false;

  const now = Date.now();
  if (cachedReady !== null && now - cachedAt < CACHE_MS) {
    return cachedReady;
  }

  try {
    const row = await db
      .prepare("SELECT 1 AS ok FROM interconnection_queue LIMIT 1")
      .first<{ ok: number }>();
    cachedReady = !!row;
  } catch {
    cachedReady = false;
  }
  cachedAt = now;
  return cachedReady;
}

export function resetD1ReadyCache(): void {
  cachedReady = null;
  cachedAt = 0;
}
