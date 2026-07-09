#!/usr/bin/env node
/**
 * Export Supabase tables → import into Cloudflare D1.
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   CLOUDFLARE_API_TOKEN (for remote D1 execute)
 *
 *   cd web && node scripts/migrate-supabase-to-d1.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../.env.local") });

const TABLES = (process.env.D1_MIGRATE_TABLES?.split(",") ?? [
  "tbcp_awards",
  "interconnection_queue",
  "connectivity_signals",
  "sponsorship_placements",
  "dc_facilities",
  "dc_availability_scores",
  "network_facilities",
  "generation_pipeline",
  "investment_deals",
  "connectivity_briefs",
  "commission_statements",
  "data_sources",
  "feed_sources",
]).map((t) => t.trim()).filter(Boolean);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

function sqlValue(v) {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "NULL";
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
  return `'${String(v).replace(/'/g, "''")}'`;
}

const TABLE_COLUMNS = {
  tbcp_awards: [
    "id", "ntia_award_id", "grantee_name", "tribe_name", "state", "award_amount_usd",
    "award_date", "nofo_round", "project_type", "project_description", "lat", "lng",
    "households_served", "slug", "raw_properties", "connectivity_gap_assessment",
    "edc_present", "casino_present", "datacenter_potential", "estimated_mrc_potential",
    "outreach_status", "notes", "created_at", "updated_at",
  ],
  interconnection_queue: [
    "id", "authority", "source_id", "project_name", "capacity_mw", "resource_type",
    "study_phase", "queue_date", "expected_cod", "poi_name", "poi_lat", "poi_lng",
    "source_url", "last_updated", "metadata", "created_at", "updated_at",
  ],
  connectivity_signals: [
    "id", "signal_id", "source", "lane", "entity_name", "location_state",
    "location_lat", "location_lng", "signal_type", "estimated_mrc_band", "capacity_mw",
    "description", "source_url", "raw_data", "discovered_at", "map_permalink", "status",
    "outreach_draft", "twenty_crm_deal_id", "reviewed_by", "reviewed_at", "notes",
    "created_at", "updated_at",
  ],
  sponsorship_placements: [
    "id", "sponsor_name", "logo_url", "tagline", "cta_url", "cta_text",
    "placement_type", "is_active", "start_date", "end_date", "impressions", "clicks",
    "created_at", "updated_at",
  ],
  dc_facilities: [
    "id", "name", "operator", "city", "state", "status", "capacity_mw",
    "facility_type", "lat", "lng", "raw_data", "created_at", "updated_at",
  ],
  dc_availability_scores: [
    "id", "availability_score", "power_score", "water_score", "fiber_score",
    "land_score", "permitting_score", "momentum_score", "lat", "lng", "updated_at",
  ],
  network_facilities: [
    "id", "pdb_id", "name", "org_name", "city", "state", "net_count", "ix_count",
    "lat", "lng", "raw_data",
  ],
  generation_pipeline: [
    "id", "plant_id", "plant_name", "utility_name", "county", "state", "technology",
    "capacity_mw", "planned_year", "lat", "lng", "raw_data",
  ],
  investment_deals: [
    "id", "title", "slug", "status", "deal_type", "amount_usd", "announced_at",
    "location_state", "description", "source_url", "raw_data", "created_at",
  ],
  connectivity_briefs: [
    "id", "issue_number", "slug", "title", "published_at", "status", "intro_text",
    "signals", "map_spotlight_lat", "map_spotlight_lng", "map_spotlight_description",
    "funding_alert", "provider_insight", "resend_broadcast_id", "linkedin_post_ids",
    "email_opens", "email_clicks", "linkedin_impressions", "created_at", "updated_at",
  ],
  commission_statements: [
    "id", "statement_month", "provider", "customer_name", "service_description",
    "net_billed_usd", "commission_rate", "commission_amount_usd", "spiff_amount_usd",
    "expected_rate", "variance_amount_usd", "variance_pct", "evergreen_status",
    "contract_end_date", "alert_flag", "alert_reason", "pathfinder_line_id", "raw_data",
    "created_at",
  ],
  data_sources: [
    "id", "source_key", "display_name", "last_ingested_at", "row_count", "status",
    "notes", "updated_at",
  ],
  feed_sources: [
    "id", "name", "url", "lane", "is_active", "last_fetched_at", "created_at",
  ],
};

const COLUMN_ALIASES = {
  sponsorship_placements: { slot_type: "placement_type" },
  data_sources: {
    key: "source_key",
    name: "display_name",
    record_count: "row_count",
  },
  feed_sources: {
    category: "lane",
  },
};

const SKIP_COLUMNS = new Set(["poi_geog"]);

function rowForInsert(table, row) {
  const aliases = COLUMN_ALIASES[table] ?? {};
  const allowed = TABLE_COLUMNS[table];
  if (!allowed) return row;
  const out = {};
  for (const col of allowed) {
    if (row[col] !== undefined) out[col] = row[col];
    else {
      for (const [from, to] of Object.entries(aliases)) {
        if (to === col && row[from] !== undefined) out[col] = row[from];
      }
    }
  }
  for (const [from, to] of Object.entries(aliases)) {
    if (out[to] === undefined && row[from] !== undefined) out[to] = row[from];
  }
  for (const col of SKIP_COLUMNS) delete out[col];
  if (table === "investment_deals" && !out.title) {
    out.title = out.slug || out.id || "Untitled deal";
  }
  if (table === "data_sources" && !out.source_key) {
    out.source_key = row.source_key || row.key || row.id || "unknown";
  }
  if (table === "data_sources" && !out.display_name) {
    out.display_name = row.display_name || row.name || out.source_key;
  }
  return out;
}

function rowsToInsert(table, rows, batchSize = 50) {
  if (!rows.length) return [];
  const normalized = rows.map((row) => rowForInsert(table, row));
  const cols = TABLE_COLUMNS[table] ?? Object.keys(normalized[0]);
  const insertCols = cols.filter((c) =>
    normalized.some((row) => row[c] !== undefined),
  );
  const statements = [];
  for (let i = 0; i < normalized.length; i += batchSize) {
    const batch = normalized.slice(i, i + batchSize);
    const values = batch
      .map((row) => `(${insertCols.map((c) => sqlValue(row[c])).join(", ")})`)
      .join(",\n");
    statements.push(
      `INSERT OR REPLACE INTO ${table} (${insertCols.join(", ")}) VALUES\n${values};`,
    );
  }
  return statements;
}

async function exportTable(table) {
  const { data, error } = await supabase.from(table).select("*");
  if (error) {
    console.warn(`skip ${table}: ${error.message}`);
    return [];
  }
  if (!data?.length) {
    console.log(`· ${table}: 0 rows`);
    return [];
  }
  console.log(`· ${table}: ${data.length} rows`);
  return rowsToInsert(table, data);
}

function executeSql(sql, label) {
  const tmp = path.join(os.tmpdir(), `konative-d1-import-${Date.now()}.sql`);
  fs.writeFileSync(tmp, sql);
  console.log(`→ ${label}`);
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", "konative-intel", "--remote", "--file", tmp],
    { cwd: path.join(__dirname, ".."), stdio: "inherit" },
  );
  fs.unlinkSync(tmp);
}

async function main() {
  let total = 0;
  for (const table of TABLES) {
    const statements = await exportTable(table);
    for (const sql of statements) {
      executeSql(sql, `${table} (${sql.length} bytes)`);
      total += 1;
    }
  }
  if (!total) {
    console.log("No data exported.");
    return;
  }
  console.log(`✓ imported to D1 (${total} batches)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
