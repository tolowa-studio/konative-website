/**
 * Paginated ArcGIS Feature Service fetcher.
 * Writes a merged GeoJSON FeatureCollection to the output file.
 *
 * Usage:
 *   tsx fetch-arcgis.ts <queryUrl> <outFile> [pageSize]
 */
import { createWriteStream } from "node:fs";
import * as https from "node:https";
import * as http from "node:http";

const [, , queryUrl, outFile, pageSizeStr] = process.argv;
const PAGE_SIZE = parseInt(pageSizeStr ?? "500", 10);
const MAX_RETRIES = 3;

if (!queryUrl || !outFile) {
  console.error("Usage: tsx fetch-arcgis.ts <queryUrl> <outFile> [pageSize]");
  process.exit(1);
}

function fetchRaw(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith("https") ? https : http;
    const req = proto.get(url, { timeout: 60000 }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return resolve(fetchRaw(res.headers.location!));
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url.slice(0, 120)}`));
      }
      const chunks: Buffer[] = [];
      res.on("data", (c: Buffer) => chunks.push(c));
      res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      res.on("error", reject);
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timed out")); });
  });
}

async function fetchPage(offset: number, size: number): Promise<{
  features: unknown[];
  exceeded: boolean;
}> {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    outSR: "4326",
    f: "geojson",
    returnGeometry: "true",
    resultOffset: String(offset),
    resultRecordCount: String(size),
  });
  const url = `${queryUrl}?${params.toString()}`;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const raw = await fetchRaw(url);
      let data: {
        features?: unknown[];
        exceededTransferLimit?: boolean;
        properties?: { exceededTransferLimit?: boolean };
      };
      try {
        data = JSON.parse(raw);
      } catch {
        if (attempt < MAX_RETRIES) {
          process.stderr.write(` [JSON parse error, retry ${attempt}/${MAX_RETRIES}]`);
          continue;
        }
        throw new Error(`JSON parse failed after ${MAX_RETRIES} attempts at offset ${offset}`);
      }
      const features = data.features ?? [];
      const exceeded =
        data.exceededTransferLimit === true ||
        data.properties?.exceededTransferLimit === true;
      return { features, exceeded };
    } catch (e) {
      if (attempt < MAX_RETRIES) {
        process.stderr.write(` [error: ${(e as Error).message.slice(0, 60)}, retry ${attempt}/${MAX_RETRIES}]`);
      } else {
        throw e;
      }
    }
  }
  throw new Error("Unreachable");
}

async function main() {
  process.stderr.write(`Fetching CPCAD from ArcGIS in pages of ${PAGE_SIZE}…\n`);

  const allFeatures: unknown[] = [];
  let offset = 0;
  let page = 0;

  while (true) {
    page += 1;
    process.stderr.write(`  page ${page} (offset ${offset})…`);

    const { features, exceeded } = await fetchPage(offset, PAGE_SIZE);

    allFeatures.push(...features);
    process.stderr.write(` ${features.length} features (total: ${allFeatures.length})\n`);

    if (!exceeded || features.length === 0) break;
    offset += features.length;
  }

  process.stderr.write(`Total features: ${allFeatures.length}\n`);

  // Write merged GeoJSON
  const out = createWriteStream(outFile);
  out.write('{"type":"FeatureCollection","features":[\n');
  for (let i = 0; i < allFeatures.length; i++) {
    if (i > 0) out.write(",\n");
    out.write(JSON.stringify(allFeatures[i]));
  }
  out.write("\n]}\n");

  await new Promise<void>((resolve, reject) => {
    out.end();
    out.on("finish", resolve);
    out.on("error", reject);
  });

  process.stderr.write(`Written → ${outFile}\n`);
}

main().catch((e) => {
  console.error("Fatal:", e.message);
  process.exit(1);
});
