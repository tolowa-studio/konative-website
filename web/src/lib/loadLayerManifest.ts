import fs from "node:fs/promises";
import path from "node:path";
import type { LayerManifest } from "@/types/map-layers";

const MANIFEST_PATH = path.join(
  process.cwd(),
  "..",
  "tiles",
  "v1",
  "manifest.json"
);

const EMPTY_MANIFEST: LayerManifest = {
  version: 1,
  generatedAt: new Date(0).toISOString(),
  layers: [],
};

export async function loadLayerManifest(): Promise<LayerManifest> {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    return JSON.parse(raw) as LayerManifest;
  } catch {
    return EMPTY_MANIFEST;
  }
}
