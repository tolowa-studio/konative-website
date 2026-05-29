import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import https from "node:https";
import http from "node:http";
import path from "node:path";
import { createWriteStream } from "node:fs";
import type { LayerConfig } from "./config";
import { buildRoot, repoRoot, runCommand } from "./utils";

export interface LayerRunResult {
  layerId: string;
  tilesPath: string;
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const file = createWriteStream(dest);
    const request = proto.get(url, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        // Follow redirect
        downloadFile(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        return;
      }
      res.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
    });
    request.on("error", (err) => {
      file.close();
      reject(err);
    });
  });
}

/**
 * Fetch all features from an ESRI REST /query endpoint using
 * resultOffset pagination (max 2 000 records per page).
 */
async function fetchEsriAllFeatures(
  esriQueryUrl: string,
  where: string,
  outFields: string[]
): Promise<GeoJSON.FeatureCollection> {
  // Use a small page size with geometryPrecision to avoid truncated responses
  // from dense-polygon services (e.g. CLSS Administrative Boundaries).
  const PAGE_SIZE = 50;
  const allFeatures: GeoJSON.Feature[] = [];
  let offset = 0;
  let exceededLimit = true;

  while (exceededLimit) {
    const params = new URLSearchParams({
      where,
      outFields: outFields.join(","),
      outSR: "4326",
      f: "json",
      returnGeometry: "true",
      resultOffset: String(offset),
      resultRecordCount: String(PAGE_SIZE),
      geometryPrecision: "5",
    });
    const pageUrl = `${esriQueryUrl}?${params.toString()}`;
    console.log(`  fetching offset=${offset} …`);

    const text = await new Promise<string>((resolve, reject) => {
      const proto = pageUrl.startsWith("https") ? https : http;
      const req = proto.get(pageUrl, (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        res.on("error", reject);
      });
      req.on("error", reject);
    });

    interface EsriRing { rings?: number[][][]; paths?: number[][][]; x?: number; y?: number }
    interface EsriFeature { attributes: Record<string, unknown>; geometry?: EsriRing }
    interface EsriResponse { features?: EsriFeature[]; exceededTransferLimit?: boolean }
    let page: EsriResponse;
    try {
      page = JSON.parse(text);
    } catch (e) {
      throw new Error(`Failed to parse ESRI response at offset ${offset}: ${text.slice(0, 300)}`);
    }

    if (!page.features || page.features.length === 0) {
      exceededLimit = false;
      break;
    }

    // Convert ESRI JSON features to GeoJSON features
    for (const ef of page.features) {
      let geometry: GeoJSON.Geometry | null = null;
      if (ef.geometry) {
        if (ef.geometry.rings) {
          // ESRI rings: [exterior, hole1, hole2, …] → one GeoJSON Polygon (not one polygon per ring).
          geometry = { type: "Polygon", coordinates: ef.geometry.rings } as GeoJSON.Polygon;
        } else if (ef.geometry.paths) {
          geometry = { type: "MultiLineString", coordinates: ef.geometry.paths } as GeoJSON.MultiLineString;
        } else if (ef.geometry.x !== undefined && ef.geometry.y !== undefined) {
          geometry = { type: "Point", coordinates: [ef.geometry.x, ef.geometry.y] } as GeoJSON.Point;
        }
      }
      if (geometry) {
        allFeatures.push({ type: "Feature", geometry, properties: ef.attributes });
      }
    }

    exceededLimit = page.exceededTransferLimit === true;
    offset += PAGE_SIZE;
    console.log(`  collected ${allFeatures.length} features so far`);
  }

  console.log(`  total features fetched: ${allFeatures.length}`);

  return {
    type: "FeatureCollection",
    features: allFeatures,
  };
}

// ---------------------------------------------------------------------------
// ESRI REST pipeline
// ---------------------------------------------------------------------------

async function runEsriPipeline(config: LayerConfig): Promise<void> {
  const rawGeoJson = path.join(buildRoot, "raw", `${config.id}.geojson`);
  const normalizedGeoJson = path.join(buildRoot, "geojson", `${config.id}.geojson`);

  if (!config.esriQueryUrl) throw new Error(`esriQueryUrl is required for ${config.id}`);

  console.log(`  source: ${config.esriQueryUrl}`);

  // First try with ogr2ogr directly via the ESRI JSON driver.
  // Use geometryPrecision=5 and a small page to avoid oversized responses.
  let ogrSuccess = false;
  try {
    const directUrl = `${config.esriQueryUrl}?where=${encodeURIComponent(config.where || "1=1")}&outFields=*&outSR=4326&f=json&geometryPrecision=5&resultRecordCount=50`;
    await runCommand("ogr2ogr", [
      "-f", "GeoJSON",
      rawGeoJson,
      directUrl,
      "-nlt", "PROMOTE_TO_MULTI",
    ]);
    // Check if ogr2ogr only got a single page (exceededTransferLimit)
    // by reading feature count — if it matches page size exactly, fall back to paginated.
    const raw = await readFile(rawGeoJson, "utf8");
    const parsed = JSON.parse(raw) as { features?: unknown[] };
    const count = parsed.features?.length ?? 0;
    if (count === 50) {
      console.warn(`  ogr2ogr got exactly 50 features — likely hit transfer limit; switching to paginated fetch`);
      ogrSuccess = false;
    } else {
      ogrSuccess = true;
      console.log(`  ogr2ogr fetched ${count} features`);
    }
  } catch (err) {
    console.warn(`  ogr2ogr direct fetch failed (${(err as Error).message}); falling back to HTTP pagination`);
  }

  if (!ogrSuccess) {
    // Manual pagination using Node fetch
    const fc = await fetchEsriAllFeatures(
      config.esriQueryUrl,
      config.where || "1=1",
      config.outFields || ["*"]
    );
    await writeFile(rawGeoJson, JSON.stringify(fc), "utf8");
  }

  // Normalize CRS, repair invalid polygons, and promote geometry types
  await runCommand("ogr2ogr", [
    "-f", "GeoJSON",
    normalizedGeoJson,
    rawGeoJson,
    "-t_srs", "EPSG:4326",
    "-nlt", "PROMOTE_TO_MULTI",
    "-makevalid",
    "-lco", "COORDINATE_PRECISION=6",
    "-nln", config.sourceLayer,
  ]);
}

// ---------------------------------------------------------------------------
// Zip-shapefile pipeline
// ---------------------------------------------------------------------------

async function runZipShapefilePipeline(config: LayerConfig): Promise<void> {
  const rawDir = path.join(buildRoot, "raw", config.id);
  const zipPath = path.join(buildRoot, "raw", `${config.id}.zip`);
  const normalizedGeoJson = path.join(buildRoot, "geojson", `${config.id}.geojson`);

  if (!config.zipUrl) throw new Error(`zipUrl is required for ${config.id}`);

  console.log(`  downloading zip: ${config.zipUrl}`);
  await mkdir(rawDir, { recursive: true });
  await downloadFile(config.zipUrl, zipPath);
  console.log(`  extracting…`);
  await runCommand("unzip", ["-o", zipPath, "-d", rawDir]);

  // Find the .shp file
  const shpBase = config.shapefileBase || config.id;
  const shpPath = path.join(rawDir, `${shpBase}.shp`);

  console.log(`  converting shapefile → GeoJSON`);
  await runCommand("ogr2ogr", [
    "-f", "GeoJSON",
    normalizedGeoJson,
    shpPath,
    "-t_srs", "EPSG:4326",
    "-nlt", "PROMOTE_TO_MULTI",
    "-lco", "COORDINATE_PRECISION=6",
    "-nln", config.sourceLayer,
  ]);
}

// ---------------------------------------------------------------------------
// Tippecanoe → PMTiles
// ---------------------------------------------------------------------------

async function runTippecanoe(config: LayerConfig): Promise<void> {
  const normalizedGeoJson = path.join(buildRoot, "geojson", `${config.id}.geojson`);
  const outputPmtiles = path.join(buildRoot, "pmtiles", `${config.id}.pmtiles`);

  await runCommand("tippecanoe", [
    "--force",
    "--read-parallel",
    "-z", String(config.maxZoom),
    "-Z", String(config.minZoom),
    "--drop-densest-as-needed",
    "--drop-smallest-as-needed",
    "--simplification=12",
    "--coalesce-smallest-as-needed",
    "--layer", config.sourceLayer,
    "--output", outputPmtiles,
    normalizedGeoJson,
  ]);
}

// ---------------------------------------------------------------------------
// Main entry
// ---------------------------------------------------------------------------

export async function runLayerPipeline(
  config: LayerConfig,
  _opts: { skipUpload: boolean }
): Promise<LayerRunResult> {
  const outputPmtiles = path.join(buildRoot, "pmtiles", `${config.id}.pmtiles`);

  console.log(`\n=== ${config.id} (${config.sourceType}) ===`);

  if (config.sourceType === "esri-rest") {
    await runEsriPipeline(config);
  } else if (config.sourceType === "zip-shapefile") {
    await runZipShapefilePipeline(config);
  } else {
    throw new Error(`Unknown sourceType for ${config.id}`);
  }

  await runTippecanoe(config);

  // Copy PMTiles to committed tiles/v1/ directory
  const tilesV1Dir = path.join(repoRoot, "tiles", "v1");
  await mkdir(tilesV1Dir, { recursive: true });
  const destPath = path.join(tilesV1Dir, `${config.id}.pmtiles`);
  await copyFile(outputPmtiles, destPath);
  console.log(`  Copied ${config.id}.pmtiles → tiles/v1/`);

  return {
    layerId: config.id,
    tilesPath: config.tilesPath,
    generatedAt: new Date().toISOString(),
  };
}
