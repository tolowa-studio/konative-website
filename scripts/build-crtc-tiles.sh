#!/usr/bin/env bash
# build-crtc-tiles.sh — Build PMTiles from CRTC National Broadband Data for Vancouver Island
#
# Requirements (install once):
#   brew install tippecanoe gdal
#
# Runtime: ~5 minutes (download ~300MB national dataset, clip, build tiles)
#
# Usage:
#   bash scripts/build-crtc-tiles.sh
#
# Output:
#   web/public/tiles/v1/vi-broadband.pmtiles
#   web/public/tiles/v1/manifest-vi.json  (updated to pmtiles sourceType)

set -euo pipefail

TILES_DIR="web/public/tiles/v1"
RAW_DIR=".tiles-raw"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p "$TILES_DIR" "$RAW_DIR"

# ── 1. Download CRTC broadband dataset ────────────────────────────────────────
# The CRTC NBD is published annually on open.canada.ca as a national GeoPackage.
# Resource ID may change each year — check:
# https://open.canada.ca/data/en/dataset/00a331db-121b-445d-b119-35dbbe3eedd9
CRTC_URL="https://open.canada.ca/data/en/dataset/00a331db-121b-445d-b119-35dbbe3eedd9/resource/dfd4fcff-5e3d-4aca-9200-ef1e3aaabb57/download/nbd_hex_2023.zip"

echo "==> Downloading CRTC NBD (hex grid, ~300MB) ..."
if [ ! -f "$RAW_DIR/nbd_hex.zip" ]; then
  curl -L -o "$RAW_DIR/nbd_hex.zip" "$CRTC_URL" \
    --retry 3 --retry-delay 5 \
    -H "User-Agent: konative-site/1.0 (deals@konative.com)"
else
  echo "  (cached — delete $RAW_DIR/nbd_hex.zip to re-download)"
fi

echo "==> Unzipping ..."
unzip -o "$RAW_DIR/nbd_hex.zip" -d "$RAW_DIR/nbd_hex/" 2>/dev/null || true

# Find the GeoPackage (filename may vary by year)
GPKG=$(find "$RAW_DIR/nbd_hex" -name "*.gpkg" | head -1)
if [ -z "$GPKG" ]; then
  # Try GeoJSON fallback
  GPKG=$(find "$RAW_DIR/nbd_hex" -name "*.geojson" | head -1)
fi
if [ -z "$GPKG" ]; then
  echo "ERROR: Could not find GeoPackage or GeoJSON in the download."
  echo "  Download the file manually from:"
  echo "  https://open.canada.ca/data/en/dataset/00a331db-121b-445d-b119-35dbbe3eedd9"
  echo "  Place the .gpkg or .geojson in $RAW_DIR/nbd_hex/ and re-run."
  exit 1
fi
echo "  Found: $GPKG"

# ── 2. Clip to Vancouver Island bbox + reproject to WGS84 ─────────────────────
# VI bbox: xmin=-128.8 ymin=48.3 xmax=-122.8 ymax=51.0
echo "==> Clipping to Vancouver Island and reprojecting ..."
ogr2ogr \
  -f GeoJSON \
  -t_srs EPSG:4326 \
  -spat -128.8 48.3 -122.8 51.0 \
  -spat_srs EPSG:4326 \
  -nlt PROMOTE_TO_MULTI \
  "$RAW_DIR/vi-broadband.geojson" \
  "$GPKG"

FEATURE_COUNT=$(node -e "
const d=require('fs').readFileSync('$RAW_DIR/vi-broadband.geojson','utf8');
const fc=JSON.parse(d); console.log(fc.features.length);
" 2>/dev/null || echo "unknown")
echo "  Features clipped: $FEATURE_COUNT"

# ── 3. Build PMTiles with tippecanoe ─────────────────────────────────────────
echo "==> Building PMTiles ..."
tippecanoe \
  -o "$TILES_DIR/vi-broadband.pmtiles" \
  --force \
  -Z5 -z14 \
  --drop-densest-as-needed \
  --layer=vi_broadband \
  "$RAW_DIR/vi-broadband.geojson"

echo "  Tile size: $(du -sh "$TILES_DIR/vi-broadband.pmtiles" | cut -f1)"

# ── 4. Update manifest-vi.json to use pmtiles for broadband ──────────────────
echo "==> Updating manifest-vi.json ..."
node - <<JSEOF
const fs = require('fs')
const path = 'web/public/tiles/v1/manifest-vi.json'
const manifest = JSON.parse(fs.readFileSync(path, 'utf8'))

for (const layer of manifest.layers) {
  if (layer.id === 'vi-broadband') {
    layer.sourceType = 'pmtiles'
    layer.tilesUrl = '/tiles/v1/vi-broadband.pmtiles'
    layer.sourceLayer = 'vi_broadband'
    layer.lastUpdated = '${NOW}'
    delete layer.geojsonUrl
    delete layer.emptyStateInsight
    console.log('Updated vi-broadband to pmtiles sourceType')
  }
}
manifest.generatedAt = '${NOW}'
fs.writeFileSync(path, JSON.stringify(manifest, null, 2))
JSEOF

echo ""
echo "==> Done!"
echo ""
echo "Next steps:"
echo "  git add $TILES_DIR && git commit -m 'feat(tiles): CRTC broadband coverage for Vancouver Island'"
echo "  git push origin main   # Vercel auto-deploys"
echo ""
echo "The Broadband Coverage layer will now show on the map as a choropleth."
echo "Color key (by max download speed in each 250m hex):"
echo "  Dark grey  = < 25 Mbps   (underserved)"
echo "  Steel blue = 25–100 Mbps"
echo "  Teal       = 100–500 Mbps"
echo "  Orange     = 500 Mbps–1 Gbps"
echo "  Bright cyan= ≥ 1 Gbps    (data center viable)"
