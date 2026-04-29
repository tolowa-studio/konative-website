import { copyFile, mkdir } from "node:fs/promises";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import type { OsmLayerConfig } from "./config";
import { buildRoot, repoRoot, runCommand } from "./utils";

export interface OsmLayerRunResult {
  layerId: string;
  tilesPath: string;
  fileSizeBytes: number;
  generatedAt: string;
}

/**
 * Run the full OSM → PMTiles pipeline for one layer:
 *  1. osmium tags-filter (already-filtered .osm.pbf per layer)
 *  2. ogr2ogr → GeoJSON
 *  3. tippecanoe → PMTiles
 *  4. Copy to web/public/tiles/v1/ and tiles/v1/
 */
export async function runOsmLayerPipeline(
  config: OsmLayerConfig,
  rawPbf: string
): Promise<OsmLayerRunResult> {
  const filteredPbf = path.join(buildRoot, "filtered", `${config.id}.osm.pbf`);
  const geoJsonOut = path.join(buildRoot, "geojson", `${config.id}.geojson`);
  const pmtilesOut = path.join(buildRoot, "pmtiles", `${config.id}.pmtiles`);

  console.log(`\n=== ${config.id} ===`);

  // Step 1 — osmium tags-filter
  console.log(`osmium tags-filter → ${filteredPbf}`);
  await runCommand("osmium", [
    "tags-filter",
    "--overwrite",
    "--output",
    filteredPbf,
    rawPbf,
    ...config.osmiumFilters,
  ]);

  // Step 2 — ogr2ogr to GeoJSON
  // For line layers we select the 'lines' OGR layer from the OSM PBF driver.
  // For polygon (industrial) we select 'multipolygons'.
  console.log(`ogr2ogr → ${geoJsonOut}`);
  const ogrArgs: string[] = [
    "-f",
    "GeoJSON",
    geoJsonOut,
    filteredPbf,
    config.ogrLayer,
    "-t_srs",
    "EPSG:4326",
    "-lco",
    "COORDINATE_PRECISION=6",
    "-nln",
    config.sourceLayer,
    "-nlt",
    config.ogrGeometryType,
    "-skipfailures",
  ];
  await runCommand("ogr2ogr", ogrArgs);

  // Step 3 — tippecanoe → PMTiles
  console.log(`tippecanoe → ${pmtilesOut}`);
  await runCommand("tippecanoe", [
    "--force",
    "--read-parallel",
    "--drop-densest-as-needed",
    `-Z${config.minZoom}`,
    `-z${config.maxZoom}`,
    "--layer",
    config.sourceLayer,
    "-o",
    pmtilesOut,
    geoJsonOut,
  ]);

  const fileSizeBytes = statSync(pmtilesOut).size;
  console.log(`  PMTiles size: ${(fileSizeBytes / 1024 / 1024).toFixed(1)} MB`);

  // Step 4 — copy to both public tile directories
  const destPublic = path.join(
    repoRoot,
    "web",
    "public",
    "tiles",
    "v1",
    `${config.id}.pmtiles`
  );
  const destRoot = path.join(repoRoot, "tiles", "v1", `${config.id}.pmtiles`);

  await mkdir(path.dirname(destPublic), { recursive: true });
  await mkdir(path.dirname(destRoot), { recursive: true });

  await copyFile(pmtilesOut, destPublic);
  await copyFile(pmtilesOut, destRoot);
  console.log(`  Copied → web/public/tiles/v1/${config.id}.pmtiles`);
  console.log(`  Copied → tiles/v1/${config.id}.pmtiles`);

  return {
    layerId: config.id,
    tilesPath: config.tilesPath,
    fileSizeBytes,
    generatedAt: new Date().toISOString(),
  };
}
