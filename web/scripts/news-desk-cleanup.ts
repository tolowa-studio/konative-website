/**
 * Soft-archive aged newsItems + dedupe DCD/URL duplicates in the live window.
 *
 * Soft-archive = status "draft" (schema has draft|published; public queries
 * filter status == "published"). Idempotent — re-runs only patch remaining
 * published matches.
 *
 * Usage (from web/):
 *   npx tsx --env-file=.env.local scripts/news-desk-cleanup.ts
 *   npx tsx --env-file=.env.local scripts/news-desk-cleanup.ts --dry-run
 *   npx tsx --env-file=.env.local scripts/news-desk-cleanup.ts --archive-only
 *   npx tsx --env-file=.env.local scripts/news-desk-cleanup.ts --dedupe-only
 */

import { createClient, type SanityClient } from "@sanity/client";

import { NEWS_CURATION_WINDOW_DAYS, newsCurationSinceIso } from "../src/lib/newsConstants";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || process.env.SANITY_DATASET || "production";
const token = process.env.SANITY_API_TOKEN;

if (!projectId || !token) {
  console.error("ERROR: NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_TOKEN are required.");
  process.exit(1);
}

const dryRun = process.argv.includes("--dry-run");
const archiveOnly = process.argv.includes("--archive-only");
const dedupeOnly = process.argv.includes("--dedupe-only");

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const BATCH = 50;
const LEGACY_DCD_SOURCE = "newsSource-dcd";
const CANONICAL_DCD_SOURCE = "newsSource-datacenter-dynamics";

type NewsDoc = {
  _id: string;
  _createdAt?: string;
  title?: string;
  url?: string;
  status?: string;
  publishedAt?: string;
  imageUrl?: string;
  source?: { _ref?: string };
  sourceName?: string;
  ingestFingerprint?: string;
};

function normalizeUrl(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  try {
    const u = new URL(raw.trim());
    u.hash = "";
    u.hostname = u.hostname.toLowerCase().replace(/^www\./, "");
    // Strip trailing slash on pathname (keep root as "/")
    if (u.pathname.length > 1 && u.pathname.endsWith("/")) {
      u.pathname = u.pathname.slice(0, -1);
    }
    return u.toString();
  } catch {
    return raw.trim().toLowerCase().replace(/\/+$/, "");
  }
}

function normalizeTitle(title: string | undefined): string {
  return (title || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function countPublished(since?: string): Promise<number> {
  if (since) {
    return client.fetch<number>(
      `count(*[_type == "newsItem" && status == "published" && defined(publishedAt) && publishedAt >= $since])`,
      { since },
    );
  }
  return client.fetch<number>(`count(*[_type == "newsItem" && status == "published"])`);
}

async function countDraft(): Promise<number> {
  return client.fetch<number>(`count(*[_type == "newsItem" && status == "draft"])`);
}

async function patchStatusDraft(ids: string[], label: string): Promise<number> {
  if (ids.length === 0) return 0;
  if (dryRun) {
    console.log(`[dry-run] would soft-archive ${ids.length} ${label}`);
    return ids.length;
  }

  let patched = 0;
  for (let i = 0; i < ids.length; i += BATCH) {
    const slice = ids.slice(i, i + BATCH);
    const tx = client.transaction();
    for (const id of slice) {
      tx.patch(id, (p) => p.set({ status: "draft" }));
    }
    await tx.commit({ visibility: "async" });
    patched += slice.length;
    console.log(`  patched ${patched}/${ids.length} ${label}`);
  }
  return patched;
}

function canonicalScore(doc: NewsDoc): number {
  let score = 0;
  const sourceRef = doc.source?._ref || "";
  if (sourceRef === CANONICAL_DCD_SOURCE) score += 100;
  if (sourceRef === LEGACY_DCD_SOURCE) score -= 50;
  if (doc.imageUrl) score += 10;
  if (doc.publishedAt) score += Math.min(5, new Date(doc.publishedAt).getTime() / 1e13);
  // Prefer older document (first ingest) as slight tie-break
  if (doc._createdAt) score += 1 / (1 + new Date(doc._createdAt).getTime() / 1e15);
  return score;
}

async function softArchiveAged(since: string): Promise<{ candidates: number; archived: number }> {
  const aged = await client.fetch<NewsDoc[]>(
    `*[_type == "newsItem" && status == "published" && defined(publishedAt) && publishedAt < $since]{
      _id, title, url, publishedAt, sourceName, "source": source
    }`,
    { since },
  );

  console.log(`\n=== Soft-archive (publishedAt < ${since.slice(0, 10)}, window=${NEWS_CURATION_WINDOW_DAYS}d) ===`);
  console.log(`Candidates still published outside window: ${aged.length}`);

  const ids = aged.map((d) => d._id);
  const archived = await patchStatusDraft(ids, "aged items");
  return { candidates: aged.length, archived };
}

async function dedupeLiveWindow(since: string): Promise<{
  groups: number;
  extras: number;
  archived: number;
  byUrl: number;
  byTitle: number;
}> {
  const live = await client.fetch<NewsDoc[]>(
    `*[_type == "newsItem" && status == "published" && defined(publishedAt) && publishedAt >= $since]{
      _id, _createdAt, title, url, publishedAt, imageUrl, sourceName, ingestFingerprint,
      "source": source
    }`,
    { since },
  );

  console.log(`\n=== Dedupe live window (${live.length} published in-window) ===`);

  // Pass 1: group by normalized URL
  const byUrl = new Map<string, NewsDoc[]>();
  for (const doc of live) {
    const key = normalizeUrl(doc.url);
    if (!key) continue;
    const list = byUrl.get(key) || [];
    list.push(doc);
    byUrl.set(key, list);
  }

  const toArchive = new Set<string>();
  let urlGroups = 0;
  let urlExtras = 0;

  for (const [key, docs] of byUrl) {
    if (docs.length < 2) continue;
    urlGroups += 1;
    const ranked = [...docs].sort((a, b) => canonicalScore(b) - canonicalScore(a));
    const keep = ranked[0];
    const drop = ranked.slice(1);
    console.log(
      `  URL group (${docs.length}): keep ${keep._id} [${keep.source?._ref || keep.sourceName}] — ${keep.title?.slice(0, 60)}`,
    );
    for (const d of drop) {
      console.log(`    archive ${d._id} [${d.source?._ref || d.sourceName}]`);
      toArchive.add(d._id);
      urlExtras += 1;
    }
    void key;
  }

  // Pass 2: similar titles among remaining (no URL match), especially DCD legacy
  const remaining = live.filter((d) => !toArchive.has(d._id));
  const byTitle = new Map<string, NewsDoc[]>();
  for (const doc of remaining) {
    const t = normalizeTitle(doc.title);
    if (t.length < 24) continue; // skip short/ambiguous titles
    const list = byTitle.get(t) || [];
    list.push(doc);
    byTitle.set(t, list);
  }

  let titleGroups = 0;
  let titleExtras = 0;
  for (const [, docs] of byTitle) {
    if (docs.length < 2) continue;
    // Only soft-archive title dupes when at least one is legacy DCD or same hostname family
    const involvesDcd = docs.some(
      (d) => d.source?._ref === LEGACY_DCD_SOURCE || d.source?._ref === CANONICAL_DCD_SOURCE,
    );
    const urls = docs.map((d) => normalizeUrl(d.url)).filter(Boolean);
    const sameHost =
      urls.length >= 2 &&
      urls.every((u) => {
        try {
          return new URL(u!).hostname === new URL(urls[0]!).hostname;
        } catch {
          return false;
        }
      });
    if (!involvesDcd && !sameHost) continue;

    titleGroups += 1;
    const ranked = [...docs].sort((a, b) => canonicalScore(b) - canonicalScore(a));
    const keep = ranked[0];
    const drop = ranked.slice(1);
    console.log(
      `  Title group (${docs.length}): keep ${keep._id} — ${keep.title?.slice(0, 60)}`,
    );
    for (const d of drop) {
      if (toArchive.has(d._id)) continue;
      console.log(`    archive ${d._id} [${d.source?._ref || d.sourceName}]`);
      toArchive.add(d._id);
      titleExtras += 1;
    }
  }

  const ids = [...toArchive];
  const archived = await patchStatusDraft(ids, "duplicate extras");
  return {
    groups: urlGroups + titleGroups,
    extras: urlExtras + titleExtras,
    archived,
    byUrl: urlExtras,
    byTitle: titleExtras,
  };
}

async function reportLegacyDcd(since: string, client: SanityClient) {
  const counts = await client.fetch<{
    publishedAll: number;
    publishedInWindow: number;
    draftAll: number;
  }>(
    `{
      "publishedAll": count(*[_type == "newsItem" && status == "published" && source._ref == $legacy]),
      "publishedInWindow": count(*[_type == "newsItem" && status == "published" && source._ref == $legacy && publishedAt >= $since]),
      "draftAll": count(*[_type == "newsItem" && status == "draft" && source._ref == $legacy])
    }`,
    { legacy: LEGACY_DCD_SOURCE, since },
  );
  console.log(`\nLegacy ${LEGACY_DCD_SOURCE}: published=${counts.publishedAll} (in-window=${counts.publishedInWindow}) draft=${counts.draftAll}`);
}

async function main() {
  const since = newsCurationSinceIso();
  console.log(`News desk cleanup ${dryRun ? "(DRY RUN)" : "(LIVE)"}`);
  console.log(`Dataset=${dataset} project=${projectId}`);
  console.log(`Curation window since: ${since}`);

  const beforePublished = await countPublished();
  const beforeInWindow = await countPublished(since);
  const beforeDraft = await countDraft();
  console.log(`\nBEFORE: published=${beforePublished} in-window=${beforeInWindow} draft=${beforeDraft}`);
  await reportLegacyDcd(since, client);

  let archiveResult = { candidates: 0, archived: 0 };
  let dedupeResult = { groups: 0, extras: 0, archived: 0, byUrl: 0, byTitle: 0 };

  if (!dedupeOnly) {
    archiveResult = await softArchiveAged(since);
  }
  if (!archiveOnly) {
    dedupeResult = await dedupeLiveWindow(since);
  }

  const afterPublished = await countPublished();
  const afterInWindow = await countPublished(since);
  const afterDraft = await countDraft();

  console.log(`\n=== Summary ===`);
  console.log(`Aged soft-archived: ${archiveResult.archived} (candidates ${archiveResult.candidates})`);
  console.log(
    `Dedupe soft-archived: ${dedupeResult.archived} (url extras ${dedupeResult.byUrl}, title extras ${dedupeResult.byTitle}, groups ${dedupeResult.groups})`,
  );
  console.log(`AFTER:  published=${afterPublished} in-window=${afterInWindow} draft=${afterDraft}`);
  await reportLegacyDcd(since, client);

  if (dryRun) {
    console.log("\nDry run complete — no writes.");
  } else {
    console.log("\nCleanup complete.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
