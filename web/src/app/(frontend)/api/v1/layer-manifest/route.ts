import { NextResponse } from "next/server";
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

const EMPTY: LayerManifest = {
  version: 1,
  generatedAt: new Date(0).toISOString(),
  layers: [],
};

export async function GET() {
  try {
    const raw = await fs.readFile(MANIFEST_PATH, "utf8");
    return NextResponse.json(JSON.parse(raw) as LayerManifest);
  } catch {
    return NextResponse.json(EMPTY);
  }
}
