import { existsSync } from "node:fs";
import { statSync } from "node:fs";
import { OSM_LAYERS, getOsmLayer } from "./config";
import { writeOsmManifest } from "./manifest";
import { runOsmLayerPipeline } from "./pipeline";
import {
  buildRoot,
  cleanBuildDir,
  cleanBuildSubDirs,
  commandExists,
  ensureBuildDirs,
  OSM_PBF_URL,
  RAW_PBF_PATH,
  runCommand,
} from "./utils";

interface CliOptions {
  layer?: string;
  skipDownload: boolean;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = { skipDownload: false, dryRun: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--layer" && argv[i + 1]) {
      options.layer = argv[i + 1];
      i += 1;
      continue;
    }
    if (arg === "--skip-download") {
      options.skipDownload = true;
      continue;
    }
    if (arg === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      console.log(`Usage: npx tsx scripts/etl/osm-canada/run.ts [options]

Options:
  --layer <layerId>    Run a single layer only
  --skip-download      Skip download if canada-latest.osm.pbf already present
  --dry-run            Validate config + tooling only

Layer IDs:
${OSM_LAYERS.map((l) => `  ${l.id}`).join("\n")}
`);
      process.exit(0);
    }
  }
  return options;
}

async function assertTooling(): Promise<void> {
  const required = ["osmium", "ogr2ogr", "tippecanoe", "curl"];
  const missing: string[] = [];
  for (const cmd of required) {
    // eslint-disable-next-line no-await-in-loop
    const ok = await commandExists(cmd);
    if (!ok) missing.push(cmd);
  }
  if (missing.length > 0) {
    throw new Error(
      `Missing required tooling: ${missing.join(", ")}.\n` +
        `  osmium: brew install osmium-tool\n` +
        `  ogr2ogr: brew install gdal\n` +
        `  tippecanoe: brew install tippecanoe`
    );
  }
}

async function downloadPbf(skipIfPresent: boolean): Promise<void> {
  if (skipIfPresent && existsSync(RAW_PBF_PATH)) {
    const { size } = statSync(RAW_PBF_PATH);
    console.log(
      `  Skipping download — using existing ${RAW_PBF_PATH} (${(size / 1024 / 1024).toFixed(0)} MB)`
    );
    return;
  }
  console.log(`  Downloading ${OSM_PBF_URL} → ${RAW_PBF_PATH}`);
  await runCommand("curl", [
    "-fLC",
    "-",
    "--output",
    RAW_PBF_PATH,
    OSM_PBF_URL,
  ]);
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (options.dryRun) {
    console.log("Dry run: validating config (skipping tooling checks).");
    if (options.layer) {
      const one = getOsmLayer(options.layer);
      console.log(`Layer selected: ${one.id}`);
    } else {
      console.log(
        `Layers configured: ${OSM_LAYERS.map((l) => l.id).join(", ")}`
      );
    }
    console.log("Dry run OK.");
    return;
  }

  await assertTooling();
  if (options.skipDownload) {
    await cleanBuildSubDirs();
  } else {
    await cleanBuildDir();
  }
  await ensureBuildDirs();

  console.log("\n── Step 1: Download Canada OSM PBF ──");
  await downloadPbf(options.skipDownload);

  const targets = options.layer ? [getOsmLayer(options.layer)] : OSM_LAYERS;
  const results: Array<{
    layerId: string;
    fileSizeBytes: number;
    generatedAt: string;
  }> = [];

  for (const layer of targets) {
    // eslint-disable-next-line no-await-in-loop
    const result = await runOsmLayerPipeline(layer, RAW_PBF_PATH);
    results.push({
      layerId: result.layerId,
      fileSizeBytes: result.fileSizeBytes,
      generatedAt: result.generatedAt,
    });
  }

  await writeOsmManifest(results);

  console.log("\n── Summary ──");
  for (const r of results) {
    console.log(
      `  ${r.layerId}: ${(r.fileSizeBytes / 1024 / 1024).toFixed(1)} MB`
    );
  }
  console.log("\nOSM Canada ETL complete.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
