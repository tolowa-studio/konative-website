/**
 * Seed generation_pipeline from EIA-860M (Monthly Preliminary Electric Generator Inventory).
 *
 * Source: https://www.eia.gov/electricity/data/eia860m/
 * Sheet:  "Planned" (index 1) — proposed/planned utility-scale generators
 *
 * Usage (from web/):
 *   SUPABASE_SERVICE_ROLE_KEY=<key> npx tsx scripts/seed-eia860m.ts
 *
 * Optionally override the download URL:
 *   EIA860M_URL=https://... npx tsx scripts/seed-eia860m.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as XLSX from "xlsx";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tcbworxmlmxoyzcvdjhh.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error("ERROR: SUPABASE_SERVICE_ROLE_KEY required.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// EIA-860M URL: resolve current month from their index page, or override via env
const BASE_URL = "https://www.eia.gov/electricity/data/eia860m/";

async function resolveDownloadUrl(): Promise<string> {
  if (process.env.EIA860M_URL) return process.env.EIA860M_URL;

  // Fetch the index page and look for the most recent .xlsx link
  const html = await fetchText(BASE_URL);
  // Match both /electricity/data/eia860m/xls/... and relative xls/... forms
  // Prefer non-archive links first
  const allMatches = [...html.matchAll(/href="([^"]*eia860m\/(?!archive)[^"]*\.xlsx)"/gi)];
  if (allMatches.length > 0) return `https://www.eia.gov${allMatches[0][1]}`;
  const archiveMatch = html.match(/href="([^"]*eia860m\/[^"]*\.xlsx)"/i);
  if (archiveMatch) return `https://www.eia.gov${archiveMatch[1]}`;
  throw new Error("Could not find .xlsx link on EIA-860M page");
}

function fetchText(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    mod.get(url, { headers: { "User-Agent": "konative-ingest/1.0" } }, (res) => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
        fetchText(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = "";
      res.on("data", (c) => { data += c; });
      res.on("end", () => resolve(data));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function downloadBinary(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    const mod = url.startsWith("https") ? https : http;
    const go = (u: string) =>
      mod.get(u, { headers: { "User-Agent": "konative-ingest/1.0" } }, (res) => {
        if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location) {
          go(res.headers.location!);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} from ${u}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => { file.close(); resolve(); });
      }).on("error", reject);
    go(url);
  });
}

// EIA-860M column name normalisers (column names vary slightly by month)
function col(row: Record<string, unknown>, ...candidates: string[]): unknown {
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== "") return row[c];
    // case-insensitive fallback
    const key = Object.keys(row).find((k) => k.trim().toLowerCase() === c.toLowerCase());
    if (key && row[key] !== undefined && row[key] !== "") return row[key];
  }
  return null;
}

async function main() {
  const xlsxPath = path.join(process.cwd(), ".tmp-eia860m.xlsx");

  try {
    const url = await resolveDownloadUrl();
    console.log(`Downloading EIA-860M from:\n  ${url}`);
    await downloadBinary(url, xlsxPath);
    console.log("  ✓ Downloaded");
  } catch (e) {
    console.error("  ✗ Download failed:", e);
    console.error('  Try: EIA860M_URL="https://www.eia.gov/electricity/data/eia860m/xls/<file>.xlsx" npx tsx scripts/seed-eia860m.ts');
    process.exit(1);
  }

  const workbook = XLSX.readFile(xlsxPath);
  console.log("  Sheets:", workbook.SheetNames);

  // "Planned" sheet — may be named "Planned" or sheet index 1
  const sheetName =
    workbook.SheetNames.find((n) => n.toLowerCase().includes("planned")) ??
    workbook.SheetNames[1];
  if (!sheetName) throw new Error("Cannot find Planned sheet");

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
    raw: false,
    range: 2, // skip title row + blank row; real headers are on row 3 (0-indexed: 2)
  });
  console.log(`  ${rows.length} rows in "${sheetName}" sheet`);

  // Filter: skip header-ish rows and blank entries
  const valid = rows.filter((r) => {
    const name = col(r, "Plant Name", "plant_name_eia", "Plant name");
    const state = col(r, "Plant State", "State", "state");
    return name && state && String(state).length === 2;
  });
  console.log(`  ${valid.length} valid planned generator records`);

  const records = valid.map((r) => {
    const lat = parseFloat(String(col(r, "Latitude", "latitude") ?? ""));
    const lon = parseFloat(String(col(r, "Longitude", "longitude") ?? ""));
    const hasCoords = !isNaN(lat) && !isNaN(lon) && lat !== 0 && lon !== 0;
    const mw = parseFloat(String(col(r, "Nameplate Capacity (MW)", "capacity_mw", "Summer Capacity (MW)") ?? ""));

    return {
      plant_id: String(col(r, "Plant ID", "plant_id_eia") ?? ""),
      plant_name: String(col(r, "Plant Name", "plant_name_eia") ?? "Unknown"),
      utility_name: String(col(r, "Utility Name", "utility_name_eia") ?? "") || null,
      state: String(col(r, "Plant State", "State", "state") ?? ""),
      county: String(col(r, "County", "county") ?? "") || null,
      technology: String(col(r, "Technology", "technology_description") ?? "") || null,
      capacity_mw: isNaN(mw) ? null : mw,
      planned_year: parseInt(String(col(r, "Current Year", "current_planned_generator_operating_year") ?? "")) || null,
      planned_month: parseInt(String(col(r, "Current Month", "current_planned_generator_operating_month") ?? "")) || null,
      status_code: String(col(r, "Status", "operational_status_code") ?? "") || null,
      balancing_authority: String(col(r, "Balancing Authority Code", "balancing_authority_code_eia") ?? "") || null,
      location: hasCoords ? `POINT(${lon} ${lat})` : null,
    };
  });

  // Truncate and re-insert (monthly full refresh)
  console.log("  Truncating existing generation_pipeline…");
  await supabase.from("generation_pipeline").delete().neq("id", 0);

  const BATCH = 200;
  let inserted = 0;
  for (let i = 0; i < records.length; i += BATCH) {
    const batch = records.slice(i, i + BATCH);
    const { error } = await supabase.from("generation_pipeline").insert(batch);
    if (error) {
      console.error(`  ✗ batch ${i}:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  inserted ${inserted}/${records.length}`);
    }
  }
  console.log("\n  ✓ Done.");

  await supabase
    .from("data_sources")
    .update({ last_ingested_at: new Date().toISOString(), record_count: inserted })
    .eq("key", "eia_860m");

  fs.unlinkSync(xlsxPath);
  console.log(`\nEIA-860M seed complete. ${inserted} planned generators inserted.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
