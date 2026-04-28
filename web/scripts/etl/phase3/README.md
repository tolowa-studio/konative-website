# Phase 3 ETL — Environmental / Climate Layers

Builds PMTiles for three open environmental / climate GIS datasets.

## Layers

| Layer ID | Title | Category | License |
|---|---|---|---|
| `global_wri_aqueduct_water_risk` | WRI Aqueduct 4.0 Water Risk (North America) | water | CC-BY-4.0 |
| `ca_cwfis_fire_zones` | CWFIS Wildfire / NFDB Fire Polygons (Canada) | climate | OGL-Canada-2.0 |
| `ca_cpcad_protected_areas` | CPCAD Protected Areas Dec 2023 (Canada) | land | OGL-Canada-2.0 |

## Prerequisites

- `ogr2ogr` (via GDAL) on `$PATH`
- `tippecanoe` on `$PATH`
- `unzip` on `$PATH`
- Node 22, `tsx` available (already in `devDependencies`)

## Usage

```bash
# From web/
npm run etl:phase3                          # build all three layers
npm run etl:phase3 -- --layer ca_cpcad_protected_areas   # single layer
```

Outputs:
- `tiles/v1/<id>.pmtiles` — committed PMTiles files
- `tiles/v1/manifest-env.json` — manifest shard for the env stream

Scratch files are written to `<repo-root>/.tmp/etl-phase3/` which is gitignored.

## Notes

- WRI Aqueduct is clipped to `(-141, 41, -52, 83)` (Canada + contiguous US) via `ogr2ogr -spat` to keep tile size manageable.
- CPCAD is large (~200 MB zip). tippecanoe is configured with `--drop-smallest-as-needed --simplification=10`.
- If any download fails the layer is skipped with a warning; the remaining layers still build.
