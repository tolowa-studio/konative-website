# OSM Canada ETL

Builds 4 PMTiles from the OpenStreetMap Canada extract and writes
`tiles/v1/manifest-osm.json`.

## Layers

| ID | Category | Source filter | Zoom |
|---|---|---|---|
| `osm_ca_railways` | rail | `w/railway=rail`, `w/railway=light_rail` | z4–12 |
| `osm_ca_transmission` | power | `w/power=line`, `w/power=minor_line`, `n/power=substation` | z4–14 |
| `osm_ca_pipelines` | gas | `w/man_made=pipeline` | z4–12 |
| `osm_ca_industrial` | land | `a/landuse=industrial` | z6–14 |

## Required tools

```bash
brew install osmium-tool gdal tippecanoe
```

## Run

From `web/`:

```bash
# Full pipeline (downloads ~3 GB Canada PBF)
npx tsx scripts/etl/osm-canada/run.ts

# Skip re-download if PBF already cached
npx tsx scripts/etl/osm-canada/run.ts --skip-download

# Single layer only
npx tsx scripts/etl/osm-canada/run.ts --layer osm_ca_railways --skip-download

# Validate config without running
npx tsx scripts/etl/osm-canada/run.ts --dry-run
```

## Output

- `web/public/tiles/v1/osm_ca_*.pmtiles` — served by Next.js
- `tiles/v1/osm_ca_*.pmtiles` — repo copy
- `tiles/v1/manifest-osm.json` + `web/public/tiles/v1/manifest-osm.json`

## License

Data: ODbL 1.0 — © OpenStreetMap contributors
