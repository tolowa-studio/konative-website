export type LayerId =
  | "ca_cirnac_indigenous_lands"
  | "ca_statcan_census_subdivisions";

export type SourceType = "esri-rest" | "zip-shapefile";

export interface LayerConfig {
  id: LayerId;
  title: string;
  category: "land";
  country: "CA";
  sourceLayer: string;
  tilesPath: `tiles/v1/${string}.pmtiles`;
  sourceUrl: string;
  sourceType: SourceType;
  /** ESRI REST query URL — only for sourceType === "esri-rest" */
  esriQueryUrl?: string;
  where?: string;
  outFields?: string[];
  /** Direct zip download URL — only for sourceType === "zip-shapefile" */
  zipUrl?: string;
  /** Shapefile basename inside the zip (no extension) */
  shapefileBase?: string;
  minZoom: number;
  maxZoom: number;
  license: "OGL-Canada-2.0";
  attribution: string;
  defaultVisible?: boolean;
}

export const LAYERS: LayerConfig[] = [
  {
    id: "ca_cirnac_indigenous_lands",
    title: "Indigenous lands — reserves & Crown land (Canada)",
    category: "land",
    country: "CA",
    sourceLayer: "ca_cirnac_indigenous_lands",
    tilesPath: "tiles/v1/ca_cirnac_indigenous_lands.pmtiles",
    sourceUrl:
      "https://open.canada.ca/data/en/dataset/b6567c5c-8339-4055-99fa-63f92114d9e4",
    sourceType: "esri-rest",
    esriQueryUrl:
      process.env.CA_CIRNAC_QUERY_URL ||
      "https://proxyinternet.nrcan-rncan.gc.ca/arcgis/rest/services/CLSS-SATC/CLSS_Administrative_Boundaries/MapServer/0/query",
    where: process.env.CA_CIRNAC_WHERE || "1=1",
    outFields: ["*"],
    minZoom: 5,
    maxZoom: 12,
    license: "OGL-Canada-2.0",
    attribution:
      "Crown-Indigenous Relations and Northern Affairs Canada. Contains information licensed under the Open Government Licence - Canada.",
    defaultVisible: true,
  },
  {
    id: "ca_statcan_census_subdivisions",
    title: "Census subdivisions 2021 (Canada)",
    category: "land",
    country: "CA",
    sourceLayer: "census_subdivisions",
    tilesPath: "tiles/v1/ca_statcan_census_subdivisions.pmtiles",
    sourceUrl:
      "https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/index-eng.cfm",
    sourceType: "zip-shapefile",
    zipUrl:
      process.env.CA_STATCAN_CSD_ZIP_URL ||
      "https://www12.statcan.gc.ca/census-recensement/2021/geo/sip-pis/boundary-limites/files-fichiers/lcsd000b21a_e.zip",
    shapefileBase: "lcsd000b21a_e",
    minZoom: 5,
    maxZoom: 12,
    license: "OGL-Canada-2.0",
    attribution:
      "Statistics Canada, 2021 Census. Adapted from Statistics Canada. This does not constitute an endorsement by Statistics Canada.",
    defaultVisible: false,
  },
];

export function getLayer(layerId: string): LayerConfig {
  const layer = LAYERS.find((entry) => entry.id === layerId);
  if (!layer) {
    throw new Error(
      `Unknown layer "${layerId}". Expected one of: ${LAYERS.map((l) => l.id).join(", ")}`
    );
  }
  return layer;
}
