import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import type { LayerManifest, LayerManifestEntry } from "@/types/map-layers";

const TILES_V1 = path.join(process.cwd(), "public", "tiles", "v1");

const EMPTY: LayerManifest = {
  version: 1,
  generatedAt: new Date(0).toISOString(),
  layers: [],
};

// Reads all manifest*.json files in tiles/v1/ and merges their layers.
// This lets each ETL stream write its own manifest-{stream}.json without conflicts.
export async function GET() {
  try {
    const files = await fs.readdir(TILES_V1);
    const manifestFiles = files.filter(
      (f) => f.startsWith("manifest") && f.endsWith(".json")
    );

    if (manifestFiles.length === 0) return NextResponse.json(EMPTY);

    const manifests = await Promise.all(
      manifestFiles.map(async (f) => {
        const raw = await fs.readFile(path.join(TILES_V1, f), "utf8");
        return JSON.parse(raw) as LayerManifest;
      })
    );

    const seen = new Set<string>();
    const layers: LayerManifestEntry[] = [];
    for (const m of manifests) {
      for (const layer of m.layers ?? []) {
        if (!seen.has(layer.id)) {
          seen.add(layer.id);
          layers.push(layer);
        }
      }
    }

    const merged: LayerManifest = {
      version: 1,
      generatedAt: new Date().toISOString(),
      layers,
    };
    return NextResponse.json(merged);
  } catch {
    return NextResponse.json(EMPTY);
  }
}
