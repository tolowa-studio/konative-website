import { NextResponse } from "next/server";
import type { LayerManifest } from "@/types/map-layers";

// Statically imported rather than read via node:fs at request time — Cloudflare
// Workers has no filesystem, so fs.readdir/fs.readFile silently threw on every
// request in production (caught by the old blanket try/catch, which returned
// an empty manifest) even though these files worked fine in local Next.js dev
// with a real filesystem. Each ETL stream still owns its own manifest-{stream}
// .json file; this just merges them at build time instead of at runtime.
import bcer from "../../../../../../public/tiles/v1/manifest-bcer.json";
import env from "../../../../../../public/tiles/v1/manifest-env.json";
import indigenous from "../../../../../../public/tiles/v1/manifest-indigenous.json";
import osm from "../../../../../../public/tiles/v1/manifest-osm.json";
import p0 from "../../../../../../public/tiles/v1/manifest-p0.json";
import politics from "../../../../../../public/tiles/v1/manifest-politics.json";
import social from "../../../../../../public/tiles/v1/manifest-social.json";
import vi from "../../../../../../public/tiles/v1/manifest-vi.json";

const MANIFESTS = [bcer, env, indigenous, osm, p0, politics, social, vi] as unknown as LayerManifest[];

export async function GET() {
  const seen = new Set<string>();
  const layers: LayerManifest["layers"] = [];
  for (const m of MANIFESTS) {
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
}
