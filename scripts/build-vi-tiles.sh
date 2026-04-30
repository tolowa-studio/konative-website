#!/usr/bin/env bash
# build-vi-tiles.sh — Build permanent PMTiles for Vancouver Island water/power/fiber
#
# Requirements (install once):
#   brew install tippecanoe gdal
#
# Usage:
#   bash scripts/build-vi-tiles.sh
#
# Output: web/public/tiles/v1/{vi-water,vi-power,vi-fiber}.pmtiles
#         web/public/tiles/v1/manifest-vi.json (updated with pmtiles sourceType)

set -euo pipefail

TILES_DIR="web/public/tiles/v1"
RAW_DIR=".tiles-raw"
OVERPASS="https://overpass-api.de/api/interpreter"
VI_BBOX="48.3,-128.8,51.0,-122.8"

mkdir -p "$TILES_DIR" "$RAW_DIR"

echo "==> Fetching Vancouver Island water (Overpass) ..."
curl -s -X POST "$OVERPASS" \
  -H "User-Agent: konative-site/1.0 (deals@konative.com)" \
  --data-urlencode "data=[out:json][timeout:120];
(
  way[\"waterway\"~\"^(river|canal)$\"](${VI_BBOX});
  way[\"natural\"=\"water\"][\"water\"!~\"^(fountain|pond)$\"](${VI_BBOX});
  relation[\"natural\"=\"water\"][\"water\"!~\"^(fountain|pond)$\"](${VI_BBOX});
);
out geom qt;" \
  > "$RAW_DIR/vi-water-osm.json"

echo "==> Fetching Vancouver Island power (Overpass) ..."
curl -s -X POST "$OVERPASS" \
  -H "User-Agent: konative-site/1.0 (deals@konative.com)" \
  --data-urlencode "data=[out:json][timeout:120];
(
  way[\"power\"=\"line\"](${VI_BBOX});
  node[\"power\"=\"substation\"](${VI_BBOX});
  way[\"power\"=\"substation\"](${VI_BBOX});
  node[\"power\"~\"^(plant|generator)$\"](${VI_BBOX});
  way[\"power\"~\"^(plant|generator)$\"](${VI_BBOX});
);
out geom qt;" \
  > "$RAW_DIR/vi-power-osm.json"

echo "==> Fetching Vancouver Island fiber/telecom (Overpass) ..."
curl -s -X POST "$OVERPASS" \
  -H "User-Agent: konative-site/1.0 (deals@konative.com)" \
  --data-urlencode "data=[out:json][timeout:90];
(
  way[\"telecom\"=\"line\"](${VI_BBOX});
  way[\"communication\"=\"line\"](${VI_BBOX});
  node[\"telecom\"~\"^(exchange|central_office)$\"](${VI_BBOX});
  node[\"man_made\"=\"communications_tower\"](${VI_BBOX});
  way[\"man_made\"=\"communications_tower\"](${VI_BBOX});
);
out geom qt;" \
  > "$RAW_DIR/vi-fiber-osm.json"

echo "==> Converting Overpass JSON → GeoJSON ..."
node - <<'JSEOF'
const fs = require('fs')

function overpassToGeoJSON(file) {
  const { elements } = JSON.parse(fs.readFileSync(file, 'utf8'))
  const features = []
  for (const el of elements) {
    const props = el.tags ?? {}
    if (el.type === 'node') {
      features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [el.lon, el.lat] }, properties: props })
    } else if (el.type === 'way' && el.geometry?.length) {
      const coords = el.geometry.map(p => [p.lon, p.lat])
      const closed = coords.length >= 4 &&
        coords[0][0] === coords[coords.length-1][0] &&
        coords[0][1] === coords[coords.length-1][1]
      features.push({
        type: 'Feature',
        geometry: closed
          ? { type: 'Polygon', coordinates: [coords] }
          : { type: 'LineString', coordinates: coords },
        properties: props
      })
    }
  }
  return JSON.stringify({ type: 'FeatureCollection', features })
}

const raw = '.tiles-raw'
fs.writeFileSync(`${raw}/vi-water.geojson`, overpassToGeoJSON(`${raw}/vi-water-osm.json`))
fs.writeFileSync(`${raw}/vi-power.geojson`, overpassToGeoJSON(`${raw}/vi-power-osm.json`))
fs.writeFileSync(`${raw}/vi-fiber.geojson`, overpassToGeoJSON(`${raw}/vi-fiber-osm.json`))
console.log('GeoJSON written.')
JSEOF

echo "==> Optionally fetching BC FWA rivers via WFS ..."
BC_WFS="https://openmaps.gov.bc.ca/geo/pub/WHSE_BASEMAPPING.FWA_RIVERS_POLY/ows"
curl -sf "${BC_WFS}?service=WFS&version=2.0.0&request=GetFeature\
&typeName=pub:WHSE_BASEMAPPING.FWA_RIVERS_POLY\
&outputFormat=application/json\
&bbox=${VI_BBOX},EPSG:4326&SRSNAME=EPSG:4326&count=2000" \
  > "$RAW_DIR/vi-water-fwa.geojson" 2>/dev/null || echo "  (WFS fetch skipped — BC Catalogue may be unavailable)"

# Merge FWA into OSM water GeoJSON if it came back
if [ -s "$RAW_DIR/vi-water-fwa.geojson" ] && command -v ogr2ogr &>/dev/null; then
  echo "  Merging FWA river polygons ..."
  ogr2ogr -f GeoJSON -append "$RAW_DIR/vi-water.geojson" "$RAW_DIR/vi-water-fwa.geojson" 2>/dev/null || true
fi

echo "==> Building PMTiles with tippecanoe ..."
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

tippecanoe \
  -o "$TILES_DIR/vi-water.pmtiles" \
  --force \
  -Z5 -z14 \
  --drop-densest-as-needed \
  --layer=vi_water \
  "$RAW_DIR/vi-water.geojson"

tippecanoe \
  -o "$TILES_DIR/vi-power.pmtiles" \
  --force \
  -Z5 -z14 \
  --drop-densest-as-needed \
  --layer=vi_power \
  "$RAW_DIR/vi-power.geojson"

tippecanoe \
  -o "$TILES_DIR/vi-fiber.pmtiles" \
  --force \
  -Z5 -z14 \
  --drop-densest-as-needed \
  --layer=vi_fiber \
  "$RAW_DIR/vi-fiber.geojson"

echo "==> Writing manifest-vi.json (PMTiles mode) ..."
cat > "$TILES_DIR/manifest-vi.json" <<MANIFEST
{
  "version": 1,
  "generatedAt": "${NOW}",
  "layers": [
    {
      "id": "vi-water",
      "title": "VI — Rivers & Water Bodies",
      "category": "water",
      "country": "CA",
      "sourceType": "pmtiles",
      "tilesUrl": "/tiles/v1/vi-water.pmtiles",
      "sourceLayer": "vi_water",
      "minZoom": 5,
      "maxZoom": 14,
      "license": "ODbL-1.0",
      "attribution": "© OpenStreetMap contributors",
      "sourceUrl": "https://www.openstreetmap.org",
      "lastUpdated": "${NOW}",
      "geometryHint": "mixed"
    },
    {
      "id": "vi-power",
      "title": "VI — Transmission Lines & Substations",
      "category": "power",
      "country": "CA",
      "sourceType": "pmtiles",
      "tilesUrl": "/tiles/v1/vi-power.pmtiles",
      "sourceLayer": "vi_power",
      "minZoom": 5,
      "maxZoom": 14,
      "license": "ODbL-1.0",
      "attribution": "© OpenStreetMap contributors",
      "sourceUrl": "https://www.openstreetmap.org",
      "lastUpdated": "${NOW}",
      "geometryHint": "mixed"
    },
    {
      "id": "vi-fiber",
      "title": "VI — Fiber & Telecom Routes",
      "category": "fiber",
      "country": "CA",
      "sourceType": "pmtiles",
      "tilesUrl": "/tiles/v1/vi-fiber.pmtiles",
      "sourceLayer": "vi_fiber",
      "minZoom": 5,
      "maxZoom": 14,
      "license": "ODbL-1.0",
      "attribution": "© OpenStreetMap contributors",
      "sourceUrl": "https://www.openstreetmap.org",
      "lastUpdated": "${NOW}",
      "geometryHint": "mixed"
    }
  ]
}
MANIFEST

echo ""
echo "Done! Tile sizes:"
ls -lh "$TILES_DIR"/vi-*.pmtiles
echo ""
echo "Next steps:"
echo "  git add $TILES_DIR && git commit -m 'feat(tiles): Vancouver Island water/power/fiber PMTiles'"
echo "  git push origin main   # Vercel auto-deploys"
