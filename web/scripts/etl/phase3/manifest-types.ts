import type { LayerCategory, LayerCountry, LayerLicense } from "./config";

export interface LayerManifest {
  version: number;
  generatedAt: string;
  layers: LayerManifestEntry[];
}

export interface LayerManifestEntry {
  id: string;
  title: string;
  category: LayerCategory;
  country: LayerCountry;
  tilesUrl: string;
  sourceLayer: string;
  minZoom: number;
  maxZoom: number;
  license: LayerLicense;
  attribution: string;
  sourceUrl: string;
  lastUpdated: string;
  defaultVisible?: boolean;
}
