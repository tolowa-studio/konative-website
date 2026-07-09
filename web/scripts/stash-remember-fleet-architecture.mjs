#!/usr/bin/env node
/**
 * Write Konative Cloudflare-native architecture decisions to Stash memory.
 * Run from web/: node scripts/stash-remember-fleet-architecture.mjs
 */
import { StashMcpStdioClient } from "../../../../../../repos/motion-core/lib/stashMcpStdioClient.mjs";

const DECISIONS = [
  {
    namespace: "/tools",
    content:
      "On 2026-07-09, Tolowa/MotionOS default data placement for Cloudflare Workers apps is Cloudflare D1 (tabular), R2 (objects/geo snapshots), KV (hot cache), and Analytics Engine (metrics) — co-located with the Worker. Do NOT recommend Supabase or new Railway Postgres for edge app intelligence data. Railway Postgres is reserved for shared Tolowa services (n8n, Umami, GlitchTip, Stash, Metabase app DB). Cost rationale: ~$5/mo Workers Paid vs $25–45/mo Supabase. Notion: GTM Stack Reference + Konative Project Hub updated 2026-07-09.",
  },
  {
    namespace: "/projects/konative",
    content:
      "Konative (konative.com) intelligence data migrates Supabase → Cloudflare D1 database konative-intel (2026-07-09, operator approved). Sanity stays for curated CMS (tribalProject, newsItem). R2 bucket konative-tiles already holds PMTiles. Supabase project tcbworxmlmxoyzcvdjhh is deprecated — decommission after D1 migration verified. PostGIS radius search replaced with Haversine+bbox in D1. Architecture doc: .context/konative-api-platform-architecture.md rev 3.",
  },
  {
    namespace: "/tools",
    content:
      "Deprecated for Tolowa in-house ventures (do not recommend for new work): Vercel hosting (decommissioned 2026-07-01), Supabase as app data layer, Sentry/Centuri (use GlitchTip + Langfuse), Beehiiv (use Ghost on Railway), Resend for Konative email (use Cloudflare Email Sending). Vercel and Supabase references in old docs are stale — check Stash /tools and Notion AI Router Canonical Tool Stack before advising stack choices.",
  },
  {
    namespace: "/projects/konative",
    content:
      "Konative product direction (2026-07-09): central repository for tribal infrastructure news, data center news, interconnectivity intelligence. Content stack: Sanity curated news + tribalProject registry, Ghost newsletter (Tribal Infrastructure Brief on shared Tolowa Railway instance), D1 for tabular ingest (TBCP, queue, PeeringDB). News nav at /news; tribal DC tracker planned at /tribal/projects.",
  },
];

async function main() {
  const client = new StashMcpStdioClient({ timeoutMs: 90000 });
  const results = [];
  for (const { namespace, content } of DECISIONS) {
    try {
      const payload = await client.callTool("remember", { content, namespace });
      results.push({ namespace, ok: true, payload });
      console.log(`✓ remembered → ${namespace}`);
    } catch (err) {
      results.push({ namespace, ok: false, error: String(err?.message || err) });
      console.error(`✗ ${namespace}:`, err?.message || err);
    }
  }
  await client.close?.();
  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error(JSON.stringify({ ok: false, results }, null, 2));
    process.exit(1);
  }
  console.log(JSON.stringify({ ok: true, count: results.length }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
