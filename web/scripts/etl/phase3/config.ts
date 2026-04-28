/**
 * Phase 3 — Environmental / Climate layer configurations
 */

export type LayerCategory = "water" | "climate" | "land" | "power" | "gas";
export type LayerCountry = "CA" | "US" | "GLOBAL";
export type LayerLicense = "CC-BY-4.0" | "OGL-Canada-2.0" | "Public Domain";

export interface LayerConfig {
  id: string;
  title: string;
  category: LayerCategory;
  country: LayerCountry;
  sourceLayer: string;
  minZoom: number;
  maxZoom: number;
  license: LayerLicense;
  attribution: string;
  sourceUrl: string;
  downloadUrl: string;
  /** Alternative download URLs to try if primary fails */
  altDownloadUrls?: string[];
  /**
   * When the zip contains a FileGDB (.gdb) instead of a shapefile, specify the
   * GDB layer name to extract (e.g. "baseline_annual"). The pipeline will locate
   * the .gdb directory and pass `-sql "SELECT * FROM <gdbLayer>"` to ogr2ogr.
   */
  gdbLayer?: string;
  /**
   * ArcGIS Feature Service query URL. When present, ogr2ogr fetches directly
   * from the REST endpoint instead of downloading a zip. downloadUrl is unused.
   */
  esriQueryUrl?: string;
  /** WHERE clause for esriQueryUrl (default "1=1") */
  esriWhere?: string;
  /** ogr2ogr spatial filter: [minX, minY, maxX, maxY] */
  spatialFilter?: [number, number, number, number];
  /** tippecanoe extra flags */
  tippecanoeArgs?: string[];
  defaultVisible?: boolean;
}

export const LAYERS: LayerConfig[] = [
  {
    id: "global_wri_aqueduct_water_risk",
    title: "WRI Aqueduct 4.0 — Water Risk (North America)",
    category: "water",
    country: "GLOBAL",
    sourceLayer: "water_risk",
    minZoom: 2,
    maxZoom: 8,
    license: "CC-BY-4.0",
    attribution: "World Resources Institute, Aqueduct 4.0. CC BY 4.0.",
    sourceUrl: "https://www.wri.org/data/aqueduct-global-maps-40-data",
    downloadUrl:
      "https://files.wri.org/aqueduct/aqueduct-4-0-water-risk-data.zip",
    // The zip contains a FileGDB; extract the baseline_annual layer
    gdbLayer: "baseline_annual",
    spatialFilter: [-141, 41, -52, 83],
    tippecanoeArgs: ["--simplification=10", "--drop-densest-as-needed"],
    defaultVisible: true,
  },
  {
    id: "ca_cwfis_fire_zones",
    title: "CWFIS Fire Weather Zones — Wildfire Risk (Canada)",
    category: "climate",
    country: "CA",
    sourceLayer: "fire_zones",
    minZoom: 3,
    maxZoom: 10,
    license: "OGL-Canada-2.0",
    attribution:
      "Canadian Wildland Fire Information System / NRCan. Contains information licensed under the Open Government Licence - Canada.",
    sourceUrl: "https://cwfis.cfs.nrcan.gc.ca",
    // NFDB fire point occurrences (~30 MB) — a manageable substitute for the
    // 780 MB polygon dataset (NFDB_poly.zip). The polygon URL is preserved as
    // a comment for future reference if partial downloads are ever supported:
    //   https://cwfis.cfs.nrcan.gc.ca/downloads/nfdb/fire_poly/current_version/NFDB_poly.zip
    downloadUrl:
      "https://cwfis.cfs.nrcan.gc.ca/downloads/nfdb/fire_pnt/current_version/NFDB_point.zip",
    tippecanoeArgs: [
      "--simplification=10",
      "--drop-smallest-as-needed",
      "--coalesce-densest-as-needed",
    ],
    defaultVisible: false,
  },
  {
    id: "ca_cpcad_protected_areas",
    title: "CPCAD Protected Areas (Canada, December 2023)",
    category: "land",
    country: "CA",
    sourceLayer: "protected_areas",
    minZoom: 3,
    maxZoom: 10,
    license: "OGL-Canada-2.0",
    attribution:
      "Environment and Climate Change Canada, CPCAD December 2023. Contains information licensed under the Open Government Licence - Canada.",
    sourceUrl:
      "https://www.canada.ca/en/environment-climate-change/services/national-wildlife-areas/protected-areas-database.html",
    // Use ArcGIS REST service directly — the zip download portal URLs have changed.
    // All 22,438 features fit within the service's maxRecordCount of 25,000.
    downloadUrl: "", // unused when esriQueryUrl is set
    esriQueryUrl:
      "https://maps-cartes.ec.gc.ca/arcgis/rest/services/CWS_SCF/CPCAD/MapServer/0/query",
    esriWhere: "1=1",
    tippecanoeArgs: [
      "-z10",
      "--drop-smallest-as-needed",
      "--simplification=10",
    ],
    defaultVisible: false,
  },
];
