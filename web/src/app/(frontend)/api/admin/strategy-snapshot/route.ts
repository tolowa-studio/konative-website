import { NextRequest, NextResponse } from "next/server";
import {
  ghostAdminFetch,
  ghostContentFetch,
  ghostContentKey,
  ghostUrl,
  KONATIVE_NEWSLETTER_ID,
  KONATIVE_NEWSLETTER_SLUG,
  KONATIVE_TAG_SLUG,
} from "@/lib/ghost";

// B11 — STRATEGY.md bet B11.
//
// The weekly review reads this endpoint so confirm/reject calls on
// hypotheses are driven by telemetry, not vibes.
//
// Auth: Bearer or `x-strategy-token` header matching STRATEGY_SNAPSHOT_TOKEN.
// If the env var is not set, the endpoint returns 503 — never accidentally
// public.
//
// Curl pattern:
//   curl -H "Authorization: Bearer $STRATEGY_SNAPSHOT_TOKEN" \
//        https://konative.com/api/admin/strategy-snapshot
export const dynamic = "force-dynamic";

interface MetaPagination {
  total?: number;
}

interface GhostListResponse<T> {
  posts?: T[];
  members?: T[];
  meta?: { pagination?: MetaPagination };
}

async function ghostAdminCount(path: string): Promise<number | null> {
  try {
    const res = await ghostAdminFetch(path);
    if (!res.ok) return null;
    const data = (await res.json()) as GhostListResponse<unknown>;
    return data.meta?.pagination?.total ?? null;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const expected = process.env.STRATEGY_SNAPSHOT_TOKEN;
  if (!expected) {
    return NextResponse.json(
      { error: "STRATEGY_SNAPSHOT_TOKEN is not set on this deployment" },
      { status: 503 },
    );
  }
  const header =
    req.headers.get("authorization") ||
    req.headers.get("x-strategy-token") ||
    "";
  const provided = header.replace(/^Bearer\s+/i, "").trim();
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const startedAt = Date.now();

  // --- Ghost reachability + identity ---------------------------------------
  const ghostConfigured = Boolean(ghostUrl()) && Boolean(ghostContentKey());
  let ghostReachable = false;
  let ghostVersion: string | null = null;
  if (ghostConfigured) {
    try {
      const res = await ghostContentFetch("/ghost/api/content/settings/");
      if (res.ok) {
        ghostReachable = true;
        const data = (await res.json()) as { settings?: { version?: string } };
        ghostVersion = data.settings?.version ?? null;
      }
    } catch {
      ghostReachable = false;
    }
  }

  // --- Members (total + Konative Dispatch subscribers) ---------------------
  // Ghost's /members endpoint accepts ?limit=1 and returns meta.pagination.total
  // — efficient way to get a count without pulling the full list.
  const totalMembers = await ghostAdminCount(
    "/ghost/api/admin/members/?limit=1",
  );
  const konativeSubscribers = await ghostAdminCount(
    `/ghost/api/admin/members/?limit=1&filter=${encodeURIComponent(
      `newsletters.slug:${KONATIVE_NEWSLETTER_SLUG}`,
    )}`,
  );

  // --- Konative Dispatch posts (count + last 5 slugs) ----------------------
  let dispatchPostCount: number | null = null;
  let dispatchRecent: Array<{ slug: string; title: string; published_at: string | null }> = [];
  if (ghostConfigured) {
    try {
      const filter = encodeURIComponent(`primary_tag:${KONATIVE_TAG_SLUG}+status:published`);
      const res = await ghostContentFetch(
        `/ghost/api/content/posts/?filter=${filter}&fields=slug,title,published_at&limit=5&order=published_at%20desc`,
      );
      if (res.ok) {
        const data = (await res.json()) as GhostListResponse<{
          slug: string;
          title: string;
          published_at: string | null;
        }> & { meta?: { pagination?: MetaPagination } };
        dispatchRecent = data.posts ?? [];
        dispatchPostCount = data.meta?.pagination?.total ?? null;
      }
    } catch {
      /* swallow */
    }
  }

  // --- Site / deployment identity ------------------------------------------
  const site = {
    commit_sha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) ?? null,
    commit_ref: process.env.VERCEL_GIT_COMMIT_REF ?? null,
    deployment_url: process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : null,
    env: process.env.VERCEL_ENV ?? "local",
  };

  // --- Config presence (booleans only — never echo secrets) ----------------
  const config = {
    ghost_url: ghostUrl() || null,
    ghost_admin_key_present: Boolean(process.env.GHOST_ADMIN_API_KEY),
    ghost_content_key_present: Boolean(ghostContentKey()),
    mailgun_present:
      Boolean(process.env.MAILGUN_API_KEY) ||
      // Ghost wires Mailgun via bulkEmail__mailgun__* — not exposed here for
      // the Next runtime, but we can at least signal whether the helper key is set.
      false,
    google_site_verification: Boolean(process.env.GOOGLE_SITE_VERIFICATION),
    konative_newsletter_id: KONATIVE_NEWSLETTER_ID,
    konative_tag_slug: KONATIVE_TAG_SLUG,
  };

  // --- Compose snapshot ----------------------------------------------------
  const snapshot = {
    generated_at: new Date().toISOString(),
    duration_ms: Date.now() - startedAt,
    ghost: {
      configured: ghostConfigured,
      reachable: ghostReachable,
      version: ghostVersion,
      members: {
        total: totalMembers,
        konative_dispatch_subscribers: konativeSubscribers,
      },
      dispatch: {
        total_posts: dispatchPostCount,
        recent: dispatchRecent,
      },
    },
    site,
    config,
    // Tag for downstream pipeline parsing.
    schema_version: 1,
  };

  return NextResponse.json(snapshot, {
    headers: { "cache-control": "no-store" },
  });
}
