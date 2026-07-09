#!/usr/bin/env node
/**
 * Provision Cloudflare D1 + KV for Konative intelligence.
 *
 * Prerequisites: CLOUDFLARE_API_TOKEN (or wrangler login)
 *
 *   cd web && npm run d1:provision
 *
 * Steps:
 * 1. Create D1 database konative-intel (if missing)
 * 2. Create KV namespace (if missing)
 * 3. Patch wrangler.jsonc with real IDs
 * 4. Apply migrations locally + remote
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEB_ROOT = path.join(__dirname, "..");
const WRANGLER = path.join(WEB_ROOT, "wrangler.jsonc");
const MIGRATION = path.join(WEB_ROOT, "d1/migrations/0001_konative_intel.sql");

function run(cmd, args, opts = {}) {
  console.log(`→ ${cmd} ${args.join(" ")}`);
  return execFileSync(cmd, args, {
    cwd: WEB_ROOT,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "inherit"],
    ...opts,
  });
}

function parseJson(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    const match = stdout.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
}

function parseUuid(text) {
  const match = text.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  return match?.[0] ?? null;
}

function patchWrangler({ d1Id, kvId }) {
  let text = fs.readFileSync(WRANGLER, "utf8");
  if (d1Id) {
    text = text.replace(
      /"database_id": "[^"]+"/,
      `"database_id": "${d1Id}"`,
    );
  }
  if (kvId) {
    text = text.replace(/"id": "0+"/, `"id": "${kvId}"`);
  }
  fs.writeFileSync(WRANGLER, text);
  console.log("✓ patched wrangler.jsonc");
}

function findOrCreateD1() {
  let dbs = [];
  try {
    const list = run("npx", ["wrangler", "d1", "list", "--json"]);
    dbs = parseJson(list) || [];
  } catch {
    const list = run("npx", ["wrangler", "d1", "list"]);
    const names = [...list.matchAll(/│\s*([0-9a-f-]{36})\s*│\s*konative-intel\s*│/gi)];
    if (names[0]?.[1]) return names[0][1];
    dbs = [];
  }
  const existing = dbs.find((d) => d.name === "konative-intel");
  if (existing?.uuid) return existing.uuid;
  const created = run("npx", ["wrangler", "d1", "create", "konative-intel"]);
  return parseUuid(created);
}

function findOrCreateKv() {
  let ns = [];
  try {
    const list = run("npx", ["wrangler", "kv", "namespace", "list", "--json"]);
    ns = parseJson(list) || [];
  } catch {
    ns = [];
  }
  const existing = ns.find(
    (n) => n.title === "konative-cache" || n.title === "CACHE",
  );
  if (existing?.id) return existing.id;
  const created = run("npx", ["wrangler", "kv", "namespace", "create", "konative-cache"]);
  return parseUuid(created);
}

function applyMigrations() {
  run("npx", ["wrangler", "d1", "execute", "konative-intel", "--local", "--file", MIGRATION]);
  run("npx", ["wrangler", "d1", "execute", "konative-intel", "--remote", "--file", MIGRATION]);
}

async function main() {
  const d1Id = findOrCreateD1();
  const kvId = findOrCreateKv();
  if (!d1Id) throw new Error("Could not resolve D1 database_id");
  patchWrangler({ d1Id, kvId });
  applyMigrations();
  console.log(JSON.stringify({ ok: true, d1Id, kvId }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
