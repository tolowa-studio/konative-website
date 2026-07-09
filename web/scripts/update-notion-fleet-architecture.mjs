#!/usr/bin/env node
/**
 * Append Cloudflare-native architecture decision to Notion pages.
 * Run: node scripts/update-notion-fleet-architecture.mjs
 *
 * Requires: gcloud auth + motion-notion-api-key in GCP Secret Manager
 */
import { execFileSync } from "node:child_process";

const PAGES = {
  konativeHub: "34232e0a547481b39bc1e081765d6df6",
  gtmStack: "35232e0a547481812f9d2e88b12b0146b",
  aiRouter: "35432e0a547481d29e0ec7886e859f11",
};

function getToken() {
  if (process.env.NOTION_API_KEY || process.env.NOTION_TOKEN) {
    return process.env.NOTION_API_KEY || process.env.NOTION_TOKEN;
  }
  return execFileSync(
    "gcloud",
    [
      "secrets",
      "versions",
      "access",
      "latest",
      "--secret=motion-notion-api-key",
      "--project=tolowa-studio",
    ],
    { encoding: "utf8" },
  ).trim();
}

async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion ${method} ${path} -> ${res.status}: ${text}`);
  }
  return res.json();
}

function heading(text, level = 2) {
  const type = level === 3 ? "heading_3" : "heading_2";
  return {
    object: "block",
    type,
    [type]: { rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }] },
  };
}

function para(text) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }],
    },
  };
}

function bullet(text) {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }],
    },
  };
}

function callout(text) {
  return {
    object: "block",
    type: "callout",
    callout: {
      icon: { emoji: "☁️" },
      rich_text: [{ type: "text", text: { content: text.slice(0, 2000) } }],
    },
  };
}

const DECISION_BLOCKS = [
  heading("Architecture decision — Cloudflare-native data (2026-07-09)", 2),
  callout(
    "Operator approved: Konative site intelligence data lives on Cloudflare (D1 + R2 + KV + Analytics Engine), not Supabase or Railway Postgres. Sanity stays for curated CMS. Supabase project tcbworxmlmxoyzcvdjhh is deprecated — decommission after D1 migration verified.",
  ),
  heading("Data placement", 3),
  bullet("Sanity — tribalProject, newsItem, CMS pages, forms"),
  bullet("Cloudflare D1 (konative-intel) — TBCP, interconnection queue, PeeringDB, sponsors, signals"),
  bullet("Cloudflare R2 (konative-tiles + konative-data) — PMTiles, dataset snapshots"),
  bullet("Cloudflare KV — layer manifests, sponsor-of-day cache"),
  bullet("Cloudflare Analytics Engine — page/sponsor/API metrics"),
  bullet("Ghost on Railway — newsletter / Tribal Infrastructure Brief"),
  bullet("Motion Control ingest — GTM campaign events only (separate D1 ledger)"),
  heading("Deprecated for Konative (do not recommend)", 3),
  bullet("Supabase — external Postgres, ~$25–45/mo; being decommissioned"),
  bullet("Railway Postgres for Konative site data — use Cloudflare D1 instead"),
  bullet("Vercel — decommissioned 2026-07-01"),
  bullet("Sentry — use GlitchTip + Langfuse"),
  heading("Fleet default (all Cloudflare Workers apps)", 3),
  para(
    "Tabular app data → D1. Objects/geo → R2. Hot cache → KV. Metrics → Analytics Engine. Railway Postgres is for shared Tolowa services (n8n, Umami, GlitchTip, Stash, Metabase app DB) — not edge app intelligence.",
  ),
  para("Repo doc: .context/konative-api-platform-architecture.md (rev 3). Stash: /tools + /projects/konative."),
];

async function appendToPage(pageId, label) {
  await notion("PATCH", `/blocks/${pageId}/children`, { children: DECISION_BLOCKS });
  console.log(`✓ appended architecture decision to ${label} (${pageId})`);
}

async function main() {
  await appendToPage(PAGES.konativeHub, "Konative Project Hub");
  await appendToPage(PAGES.gtmStack, "GTM Stack Reference");
  console.log(JSON.stringify({ ok: true, pages: Object.keys(PAGES) }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
