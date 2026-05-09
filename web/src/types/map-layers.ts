// Owned by Stream B (map). Read by Stream A (ETL) and Stream D (UI/licenses).
// See MULTIAGENT.md and the Notion plan.

export type LayerCategory =
  | "power"
  | "gas"
  | "fiber"
  | "water"
  | "exclusions"
  | "land-use"
  | "climate"
  | "rail"
  | "indigenous"
  | "politics";

export type LayerCountry = "CA" | "US" | "GLOBAL";

export type LayerLicense =
  | "OGL-Canada-2.0"
  | "OGL-Provincial"
  | "OGL-Municipal"
  | "ODbL-1.0"
  | "CC-BY-4.0"
  | "Public-Domain"
  | "Proprietary-Link-Out";

/** Controls which MapLibre sub-layers are rendered for this source. */
export type GeometryHint = "line" | "point" | "polygon" | "mixed";

export type LayerSourceType = "pmtiles" | "geojson";

export interface LayerManifestEntry {
  id: string;
  title: string;
  category: LayerCategory;
  country: LayerCountry;
  /** PMTiles URL or path under tiles/v{N}/. Used when sourceType is "pmtiles" (default). */
  tilesUrl: string;
  /** MapLibre source-layer name within the PMTiles archive. Ignored for geojson sources. */
  sourceLayer: string;
  minZoom: number;
  maxZoom: number;
  license: LayerLicense;
  attribution: string;
  /** Source page or dataset URL for the credits popover and /licenses page. */
  sourceUrl: string;
  /** ISO-8601 date the source data was last refreshed by ETL. */
  lastUpdated: string;
  /** Default visibility on first paint. */
  defaultVisible?: boolean;
  /**
   * Dominant geometry type in the source.
   * Controls which MapLibre sub-layers are rendered:
   *   "line"    → cased line only (no circles)
   *   "point"   → circles only (no lines or fill)
   *   "polygon" → fill + outline line only (no circles)
   *   "mixed"   → all three (legacy default)
   */
  geometryHint?: GeometryHint;
  /**
   * "pmtiles" (default) — vector tile source served as PMTiles.
   * "geojson" — live GeoJSON fetched from geojsonUrl at runtime.
   */
  sourceType?: LayerSourceType;
  /** API URL returning a GeoJSON FeatureCollection. Required when sourceType is "geojson". */
  geojsonUrl?: string;
  /**
   * Shown in the Layer Control Panel when this category is enabled but returns
   * fewer than 50 features — i.e. data exists but is too sparse to be useful.
   * Write as a single actionable sentence visible to end users.
   */
  emptyStateInsight?: string;
}

export interface LayerManifest {
  version: number;
  generatedAt: string;
  layers: LayerManifestEntry[];
}
