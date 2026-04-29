import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { OSM_LAYERS, type OsmLayerConfig } from "./config";
import { repoRoot } from "./utils";

interface LayerRunInfo {
  layerId: string;
  generatedAt: string;
}

export async function writeOsmManifest(
  runInfo: LayerRunInfo[]
): Promise<void> {
  const runInfoMap = new Map(runInfo.map((item) => [item.layerId, item]));
  const generatedAt = new Date().toISOString();

  const layers = OSM_LAYERS.map((layer: OsmLayerConfig) => {
    const info = runInfoMap.get(layer.id);
    return {
      id: layer.id,
      title: layer.title,
      category: layer.category,
      country: "CA",
      tilesUrl: `/${layer.tilesPath}`,
      sourceLayer: layer.sourceLayer,
      minZoom: layer.minZoom,
      maxZoom: layer.maxZoom,
      license: layer.license,
      attribution: layer.attribution,
      sourceUrl: "https://www.openstreetmap.org",
      lastUpdated: info?.generatedAt ?? generatedAt,
      defaultVisible: layer.defaultVisible ?? false,
    };
  });

  const manifest = { version: 1, generatedAt, layers };
  const json = JSON.stringify(manifest, null, 2) + "\n";

  // Write to tiles/v1/ (root) and web/public/tiles/v1/
  const destRoot = path.join(repoRoot, "tiles", "v1");
  const destPublic = path.join(repoRoot, "web", "public", "tiles", "v1");

  for (const dir of [destRoot, destPublic]) {
    // eslint-disable-next-line no-await-in-loop
    await mkdir(dir, { recursive: true });
    const outPath = path.join(dir, "manifest-osm.json");
    // eslint-disable-next-line no-await-in-loop
    await writeFile(outPath, json, "utf8");
    console.log(`  Wrote ${outPath}`);
  }
}
