/**
 * Server-only helpers for /cms system page: dashboard URLs and integration health.
 *
 * Beehiiv was retired 2026-05-23 — see STRATEGY.md B6. Newsletter is now the
 * shared Tolowa Studio Ghost instance on Railway.
 */

const FETCH_TIMEOUT_MS = 8000;

function withTimeout(signal?: AbortSignal): AbortSignal | undefined {
  if (typeof AbortSignal !== "undefined" && "timeout" in AbortSignal) {
    return AbortSignal.timeout(FETCH_TIMEOUT_MS);
  }
  return signal;
}

/** Ghost Admin lives at {site}/ghost/ — use public or server GHOST base URL. */
export function getGhostAdminUrl(): string | null {
  const base =
    process.env.NEXT_PUBLIC_GHOST_URL?.trim() ||
    process.env.GHOST_URL?.trim() ||
    null;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/ghost/`;
}

export type IntegrationHealth = {
  sanity: { configured: boolean; reachable: boolean };
  /** Public key present; optional server private key for drafts. Production `/` is never Builder — see `/builder/*`. */
  builder: {
    configured: boolean;
    privateKey: boolean;
  };
  ghost: { configured: boolean; reachable: boolean };
};

async function fetchOk(url: string, init?: RequestInit): Promise<boolean> {
  try {
    const res = await fetch(url, {
      ...init,
      signal: withTimeout(),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Lightweight checks: env present + live API/CDN where applicable. */
export async function getIntegrationHealth(): Promise<IntegrationHealth> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim();
  const dataset = (process.env.NEXT_PUBLIC_SANITY_DATASET || "production").trim();
  const builderKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY?.trim();
  const builderPrivate = process.env.BUILDER_PRIVATE_API_KEY?.trim();

  const ghostUrl =
    process.env.NEXT_PUBLIC_GHOST_URL?.trim() || process.env.GHOST_URL?.trim();
  const ghostContentKey =
    process.env.NEXT_PUBLIC_GHOST_CONTENT_API_KEY?.trim() ||
    process.env.GHOST_CONTENT_API_KEY?.trim();

  const sanityConfigured = !!projectId;

  let sanityReachable = false;
  if (sanityConfigured && projectId) {
    const q = encodeURIComponent(`count(*)`);
    const url = `https://${projectId}.apicdn.sanity.io/v2024-01-01/data/query/${dataset}?query=${q}`;
    sanityReachable = await fetchOk(url);
  }

  let ghostReachable = false;
  if (ghostUrl && ghostContentKey) {
    const base = ghostUrl.replace(/\/$/, "");
    ghostReachable = await fetchOk(
      `${base}/ghost/api/content/posts/?key=${encodeURIComponent(ghostContentKey)}&limit=1`,
    );
  }

  return {
    sanity: { configured: sanityConfigured, reachable: sanityReachable },
    builder: {
      configured: !!builderKey,
      privateKey: !!builderPrivate,
    },
    ghost: {
      configured: !!(ghostUrl && ghostContentKey),
      reachable: ghostReachable,
    },
  };
}
