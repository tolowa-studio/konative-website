import type { LayerCategory } from "@/types/map-layers";

export interface OsmLayerConfig {
  id: string;
  title: string;
  category: LayerCategory;
  /** osmium tags-filter expressions */
  osmiumFilters: string[];
  /** GeoJSON geometry type to extract via ogr2ogr */
  ogrGeometryType: "MULTILINESTRING" | "MULTIPOLYGON";
  /** ogr2ogr -sql layer to select (lines vs multipolygons) */
  ogrLayer: "lines" | "multipolygons";
  /** tippecanoe --layer value; must match sourceLayer in manifest */
  sourceLayer: string;
  tilesPath: `tiles/v1/${string}.pmtiles`;
  minZoom: number;
  maxZoom: number;
  license: "ODbL-1.0";
  attribution: string;
  defaultVisible?: boolean;
}

const OsmAttr = "© OpenStreetMap contributors";

export const OSM_LAYERS: OsmLayerConfig[] = [
  {
    id: "osm_ca_railways",
    title: "Railways (Canada, OSM)",
    category: "rail",
    osmiumFilters: ["w/railway=rail", "w/railway=light_rail"],
    ogrGeometryType: "MULTILINESTRING",
    ogrLayer: "lines",
    sourceLayer: "osm_ca_railways",
    tilesPath: "tiles/v1/osm_ca_railways.pmtiles",
    minZoom: 4,
    maxZoom: 12,
    license: "ODbL-1.0",
    attribution: OsmAttr,
    defaultVisible: false,
  },
  {
    id: "osm_ca_transmission",
    title: "Power transmission lines & substations (Canada, OSM)",
    category: "power",
    osmiumFilters: ["w/power=line", "w/power=minor_line", "n/power=substation"],
    ogrGeometryType: "MULTILINESTRING",
    ogrLayer: "lines",
    sourceLayer: "osm_ca_transmission",
    tilesPath: "tiles/v1/osm_ca_transmission.pmtiles",
    minZoom: 4,
    maxZoom: 14,
    license: "ODbL-1.0",
    attribution: OsmAttr,
    defaultVisible: false,
  },
  {
    id: "osm_ca_pipelines",
    title: "Pipelines (Canada, OSM)",
    category: "gas",
    osmiumFilters: ["w/man_made=pipeline"],
    ogrGeometryType: "MULTILINESTRING",
    ogrLayer: "lines",
    sourceLayer: "osm_ca_pipelines",
    tilesPath: "tiles/v1/osm_ca_pipelines.pmtiles",
    minZoom: 4,
    maxZoom: 12,
    license: "ODbL-1.0",
    attribution: OsmAttr,
    defaultVisible: false,
  },
  {
    id: "osm_ca_industrial",
    title: "Industrial land use (Canada, OSM)",
    category: "land",
    osmiumFilters: ["a/landuse=industrial"],
    ogrGeometryType: "MULTIPOLYGON",
    ogrLayer: "multipolygons",
    sourceLayer: "osm_ca_industrial",
    tilesPath: "tiles/v1/osm_ca_industrial.pmtiles",
    minZoom: 6,
    maxZoom: 14,
    license: "ODbL-1.0",
    attribution: OsmAttr,
    defaultVisible: false,
  },
];

export function getOsmLayer(id: string): OsmLayerConfig {
  const layer = OSM_LAYERS.find((l) => l.id === id);
  if (!layer) {
    throw new Error(
      `Unknown OSM layer "${id}". Expected one of: ${OSM_LAYERS.map((l) => l.id).join(", ")}`
    );
  }
  return layer;
}
