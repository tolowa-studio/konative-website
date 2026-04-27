import type { Metadata } from "next";
import { loadLayerManifest } from "@/lib/loadLayerManifest";
import type { LayerManifestEntry } from "@/types/map-layers";

export const metadata: Metadata = {
  title: "Data Sources & Licenses · Konative",
  description:
    "Every dataset on the Konative map — source, license, and attribution.",
};

const TOOLING = [
  { name: "MapLibre GL JS", license: "BSD 3-Clause", url: "https://maplibre.org/" },
  { name: "PMTiles / go-pmtiles", license: "BSD 3-Clause", url: "https://github.com/protomaps/PMTiles" },
  { name: "tippecanoe", license: "BSD 2-Clause", url: "https://github.com/felt/tippecanoe" },
  { name: "GDAL / ogr2ogr", license: "MIT-style", url: "https://gdal.org/" },
];

function groupByCategory(layers: LayerManifestEntry[]) {
  const groups = new Map<string, LayerManifestEntry[]>();
  for (const layer of layers) {
    const list = groups.get(layer.category) ?? [];
    list.push(layer);
    groups.set(layer.category, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

export default async function LicensesPage() {
  const manifest = await loadLayerManifest();
  const grouped = groupByCategory(manifest.layers);

  return (
    <main style={{ background: "#08142D", color: "#fff", minHeight: "100vh", padding: "96px 0 128px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 48px", fontFamily: "Inter, sans-serif" }}>
        <p style={{
          fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(255,255,255,0.4)", marginBottom: 16,
        }}>
          Transparency
        </p>
        <h1 style={{
          fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
          fontSize: 56, lineHeight: 1.05, marginBottom: 24,
        }}>
          Data sources &amp; licenses
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.7, color: "rgba(255,255,255,0.65)", maxWidth: 720, marginBottom: 48 }}>
          Every layer on the Konative map ships with its source, license, and attribution. We cite Open Government Licence (OGL) data from Canada and provinces, ODbL data from the OpenStreetMap community, and CC-BY data from research institutions. Where a source restricts redistribution, we link out instead.
        </p>

        <section style={{ marginBottom: 64 }}>
          <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 16, letterSpacing: "0.02em" }}>
            Open-source tooling
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {TOOLING.map((t) => (
              <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer"
                 style={{
                   padding: 20, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                   textDecoration: "none", color: "#fff", background: "rgba(255,255,255,0.02)",
                 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{t.license}</div>
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 28, fontWeight: 700, marginBottom: 8, letterSpacing: "0.02em" }}>
            Map data layers
          </h2>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 32 }}>
            Manifest version {manifest.version} · generated {manifest.generatedAt}
          </p>

          {grouped.length === 0 ? (
            <div style={{
              padding: 32, border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 8,
              color: "rgba(255,255,255,0.5)", fontSize: 14,
            }}>
              No published layers yet. Phase 1 ETL pipelines will populate this list.
            </div>
          ) : (
            grouped.map(([category, layers]) => (
              <div key={category} style={{ marginBottom: 40 }}>
                <h3 style={{
                  fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                  color: "#E07B39", marginBottom: 12,
                }}>
                  {category}
                </h3>
                <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, overflow: "hidden" }}>
                  {layers.map((layer, idx) => (
                    <div key={layer.id} style={{
                      padding: 20,
                      borderTop: idx === 0 ? "none" : "1px solid rgba(255,255,255,0.06)",
                      display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 24, alignItems: "start",
                    }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{layer.title}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                          {layer.country} · z{layer.minZoom}–z{layer.maxZoom}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>License</div>
                        <div style={{ fontSize: 13 }}>{layer.license}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>Source</div>
                        <a href={layer.sourceUrl} target="_blank" rel="noopener noreferrer"
                           style={{ fontSize: 13, color: "#F0A050", textDecoration: "none" }}>
                          {layer.attribution}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
