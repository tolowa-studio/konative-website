/**
 * Phase 3 ETL pipeline:
 *  download zip → unzip → ogr2ogr (→GeoJSON, optional bbox clip) → tippecanoe (→PMTiles) → copy to tiles/v1/
 */
import { copyFile, mkdir, readdir } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import * as https from "node:https";
import * as http from "node:http";
import path from "node:path";
import type { LayerConfig } from "./config";
import { buildRoot, repoRoot, runCommand } from "./utils";

// ─── helpers ─────────────────────────────────────────────────────────────────

const MAX_DOWNLOAD_BYTES = 500 * 1024 * 1024; // 500 MB

function download(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = createWriteStream(dest);

    function get(u: string) {
      proto.get(u, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          return get(res.headers.location!);
        }
        if (res.statusCode !== 200) {
          file.close();
          return reject(new Error(`HTTP ${res.statusCode} for ${u}`));
        }
        // Reject before streaming if Content-Length signals >500 MB
        const contentLength = parseInt(res.headers["content-length"] ?? "0", 10);
        if (contentLength > MAX_DOWNLOAD_BYTES) {
          file.close();
          res.destroy();
          return reject(
            new Error(
              `File too large (${(contentLength / 1024 / 1024).toFixed(0)} MB > 500 MB limit), skipping`
            )
          );
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve()));
        file.on("error", reject);
      }).on("error", reject);
    }

    get(url);
  });
}

/** Try URLs in order; return the first that downloads successfully */
async function downloadWithFallback(
  urls: string[],
  dest: string
): Promise<void> {
  let lastErr: unknown;
  for (const url of urls) {
    try {
      console.log(`  fetch: ${url}`);
      await download(url, dest);
      return;
    } catch (e) {
      console.warn(`  download failed (${(e as Error).message}), trying next…`);
      lastErr = e;
    }
  }
  throw lastErr;
}

/** Find the first file with the given extension in a directory tree */
async function findGeoFile(
  dir: string,
  ext: string
): Promise<string | undefined> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      const found = await findGeoFile(full, ext);
      if (found) return found;
    } else if (e.name.toLowerCase().endsWith(ext)) {
      return full;
    }
  }
  return undefined;
}

/** Find the first FileGDB directory (.gdb) in a directory tree */
async function findGdbDir(dir: string): Promise<string | undefined> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name.toLowerCase().endsWith(".gdb")) return full;
      const found = await findGdbDir(full);
      if (found) return found;
    }
  }
  return undefined;
}

// ─── main pipeline ────────────────────────────────────────────────────────────

export interface LayerRunResult {
  layerId: string;
  tilesUrl: string;
  generatedAt: string;
  skipped?: boolean;
  skipReason?: string;
}

export async function runLayerPipeline(
  config: LayerConfig
): Promise<LayerRunResult> {
  const rawDir = path.join(buildRoot, "raw", config.id);
  const zipPath = path.join(buildRoot, "raw", `${config.id}.zip`);
  const geoJsonPath = path.join(buildRoot, "geojson", `${config.id}.geojson`);
  const pmtilesPath = path.join(buildRoot, "pmtiles", `${config.id}.pmtiles`);
  const tilesUrl = `/tiles/v1/${config.id}.pmtiles`;

  console.log(`\n${"=".repeat(60)}`);
  console.log(`Layer: ${config.id}`);

  // When an ArcGIS REST URL is configured, skip download/unzip and feed the
  // GeoJSON query URL directly to ogr2ogr.
  let srcFile: string;

  if (config.esriQueryUrl) {
    // Fetch paginated ArcGIS GeoJSON into a scratch file, then ogr2ogr reads that.
    await mkdir(rawDir, { recursive: true });
    const arcgisGeoJson = path.join(rawDir, `${config.id}_arcgis.geojson`);
    console.log(`  source: ArcGIS REST (paginated) → ${config.esriQueryUrl}`);
    try {
      await runCommand("npx", [
        "tsx",
        path.join(__dirname, "fetch-arcgis.ts"),
        config.esriQueryUrl,
        arcgisGeoJson,
        "2000",
      ]);
    } catch (e) {
      const msg = (e as Error).message;
      console.warn(`  SKIP ${config.id}: ArcGIS fetch failed — ${msg}`);
      return { layerId: config.id, tilesUrl, generatedAt: new Date().toISOString(), skipped: true, skipReason: msg };
    }
    srcFile = arcgisGeoJson;
  } else {
    // 1. Download (skip if zip already present from a prior run)
    await mkdir(rawDir, { recursive: true });
    const zipExists = await import("node:fs/promises").then((fs) =>
      fs.stat(zipPath).then(() => true).catch(() => false)
    );
    if (zipExists) {
      console.log(`  zip cached — skipping download`);
    } else {
      const urls = [config.downloadUrl, ...(config.altDownloadUrls ?? [])].filter(Boolean);
      try {
        await downloadWithFallback(urls, zipPath);
      } catch (e) {
        const msg = (e as Error).message;
        console.warn(`  SKIP ${config.id}: download failed — ${msg}`);
        return { layerId: config.id, tilesUrl, generatedAt: new Date().toISOString(), skipped: true, skipReason: msg };
      }
    }

    // 2. Unzip
    try {
      await runCommand("unzip", ["-o", "-q", zipPath, "-d", rawDir]);
    } catch (e) {
      const msg = (e as Error).message;
      console.warn(`  SKIP ${config.id}: unzip failed — ${msg}`);
      return { layerId: config.id, tilesUrl, generatedAt: new Date().toISOString(), skipped: true, skipReason: msg };
    }

    // 3. Find source: GDB directory (if gdbLayer specified), .shp, or .geojson
    let foundFile: string | undefined;
    if (config.gdbLayer) {
      foundFile = await findGdbDir(rawDir);
      if (!foundFile) {
        const msg = "gdbLayer specified but no .gdb directory found after unzip";
        console.warn(`  SKIP ${config.id}: ${msg}`);
        return { layerId: config.id, tilesUrl, generatedAt: new Date().toISOString(), skipped: true, skipReason: msg };
      }
    } else {
      foundFile = await findGeoFile(rawDir, ".shp");
      if (!foundFile) foundFile = await findGeoFile(rawDir, ".geojson");
      if (!foundFile) {
        const msg = "no .shp or .geojson found after unzip";
        console.warn(`  SKIP ${config.id}: ${msg}`);
        return { layerId: config.id, tilesUrl, generatedAt: new Date().toISOString(), skipped: true, skipReason: msg };
      }
    }
    srcFile = foundFile;
    console.log(`  source: ${srcFile}${config.gdbLayer ? ` (layer: ${config.gdbLayer})` : ""}`);
  }

  // 4. ogr2ogr → GeoJSON
  const ogrArgs: string[] = [
    "-f", "GeoJSON",
    geoJsonPath,
    srcFile,
    "-t_srs", "EPSG:4326",
    "-lco", "COORDINATE_PRECISION=6",
    "-nln", config.sourceLayer,
    "-nlt", "PROMOTE_TO_MULTI",
    "-overwrite",
  ];

  // For GDB sources, select the specific layer
  if (config.gdbLayer) {
    ogrArgs.push("-sql", `SELECT * FROM "${config.gdbLayer}"`);
  }

  if (config.spatialFilter) {
    const [minX, minY, maxX, maxY] = config.spatialFilter;
    ogrArgs.push("-spat", String(minX), String(minY), String(maxX), String(maxY));
  }

  try {
    await runCommand("ogr2ogr", ogrArgs);
  } catch (e) {
    const msg = (e as Error).message;
    console.warn(`  SKIP ${config.id}: ogr2ogr failed — ${msg}`);
    return { layerId: config.id, tilesUrl, generatedAt: new Date().toISOString(), skipped: true, skipReason: msg };
  }

  // 5. tippecanoe → PMTiles
  const tipArgs: string[] = [
    "--force",
    "--read-parallel",
    "--minimum-zoom", String(config.minZoom),
    "--maximum-zoom", String(config.maxZoom),
    "--layer", config.sourceLayer,
    "--output", pmtilesPath,
    ...(config.tippecanoeArgs ?? ["--drop-densest-as-needed"]),
    geoJsonPath,
  ];

  try {
    await runCommand("tippecanoe", tipArgs);
  } catch (e) {
    const msg = (e as Error).message;
    console.warn(`  SKIP ${config.id}: tippecanoe failed — ${msg}`);
    return { layerId: config.id, tilesUrl, generatedAt: new Date().toISOString(), skipped: true, skipReason: msg };
  }

  // 6. Copy to tiles/v1/
  const tilesV1Dir = path.join(repoRoot, "tiles", "v1");
  await mkdir(tilesV1Dir, { recursive: true });
  const destPath = path.join(tilesV1Dir, `${config.id}.pmtiles`);
  await copyFile(pmtilesPath, destPath);
  console.log(`  copied → tiles/v1/${config.id}.pmtiles`);

  return {
    layerId: config.id,
    tilesUrl,
    generatedAt: new Date().toISOString(),
  };
}
