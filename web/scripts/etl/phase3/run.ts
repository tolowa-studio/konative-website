#!/usr/bin/env tsx
/**
 * Phase 3 ETL runner — builds PMTiles for:
 *   1. WRI Aqueduct 4.0 water risk (global, clipped to N. America)
 *   2. CWFIS fire weather / wildfire zones (Canada)
 *   3. CPCAD protected areas (Canada)
 *
 * Usage:
 *   npm run etl:phase3            # build all layers
 *   npm run etl:phase3 -- --layer global_wri_aqueduct_water_risk
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { LAYERS, type LayerConfig } from "./config";
import type { LayerManifestEntry } from "./manifest-types";
import { runLayerPipeline } from "./pipeline";
import { ensureBuildDirs, repoRoot, toIsoDate } from "./utils";

// ─── CLI arg parsing ──────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const layerFlag = args.indexOf("--layer");
const onlyLayer = layerFlag >= 0 ? args[layerFlag + 1] : undefined;

const layers: LayerConfig[] = onlyLayer
  ? LAYERS.filter((l) => l.id === onlyLayer)
  : LAYERS;

if (layers.length === 0) {
  console.error(`No layer found matching: ${onlyLayer}`);
  process.exit(1);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("Phase 3 ETL — environmental layers");
  console.log(`Building ${layers.length} layer(s): ${layers.map((l) => l.id).join(", ")}`);

  await ensureBuildDirs();

  const entries: LayerManifestEntry[] = [];
  const skipped: string[] = [];

  for (const layer of layers) {
    const result = await runLayerPipeline(layer);

    if (result.skipped) {
      skipped.push(`${layer.id}: ${result.skipReason}`);
      continue;
    }

    entries.push({
      id: layer.id,
      title: layer.title,
      category: layer.category,
      country: layer.country,
      tilesUrl: result.tilesUrl,
      sourceLayer: layer.sourceLayer,
      minZoom: layer.minZoom,
      maxZoom: layer.maxZoom,
      license: layer.license,
      attribution: layer.attribution,
      sourceUrl: layer.sourceUrl,
      lastUpdated: result.generatedAt,
      defaultVisible: layer.defaultVisible ?? false,
    });
  }

  // Write manifest shard
  const manifest = {
    version: 1,
    generatedAt: toIsoDate(),
    layers: entries,
  };

  const manifestPath = path.join(repoRoot, "tiles", "v1", "manifest-env.json");
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log(`\nManifest written → tiles/v1/manifest-env.json`);
  console.log(`  layers: ${entries.length} built, ${skipped.length} skipped`);

  if (skipped.length > 0) {
    console.warn("\nSkipped layers:");
    for (const s of skipped) console.warn(`  - ${s}`);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
