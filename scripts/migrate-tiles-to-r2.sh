#!/usr/bin/env bash
# migrate-tiles-to-r2.sh — One-time migration of all .pmtiles from git to Cloudflare R2
#
# Run this ONCE after you've:
#   1. Created a free Cloudflare account at https://cloudflare.com
#   2. Created an R2 bucket (Dashboard → R2 → Create bucket → name: "konative-tiles")
#   3. Enabled public access on the bucket (Settings → Public Access → Allow Access)
#   4. Created an R2 API token (R2 → Manage R2 API tokens → Create API token)
#   5. Installed wrangler:  npm install -g wrangler
#   6. Set the env vars below (or export them before running)
#
# What this script does:
#   a) Uploads every .pmtiles file from web/public/tiles/v1/ to R2
#   b) Updates all manifest-*.json tilesUrl fields to the R2 public URL
#   c) git rm's the .pmtiles binaries from the repo
#   d) Commits the changes
#   (You then push to main and Vercel auto-deploys the lighter repo)
#
# Usage:
#   export R2_BUCKET_NAME="konative-tiles"
#   export R2_PUBLIC_URL="https://pub-XXXXXXXXXXXX.r2.dev"   # from bucket public URL page
#   export CLOUDFLARE_ACCOUNT_ID="your-account-id"
#   export R2_ACCESS_KEY_ID="your-access-key-id"
#   export R2_SECRET_ACCESS_KEY="your-secret-access-key"
#   bash scripts/migrate-tiles-to-r2.sh

set -euo pipefail

TILES_DIR="web/public/tiles/v1"
TILES_PREFIX="tiles/v1"

# ── Validate required env vars ────────────────────────────────────────────────
for var in R2_BUCKET_NAME R2_PUBLIC_URL CLOUDFLARE_ACCOUNT_ID R2_ACCESS_KEY_ID R2_SECRET_ACCESS_KEY; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: \$$var is not set."
    echo "Set it with: export $var=..."
    exit 1
  fi
done

command -v wrangler >/dev/null 2>&1 || { echo "ERROR: wrangler not found. Run: npm install -g wrangler"; exit 1; }
command -v node    >/dev/null 2>&1 || { echo "ERROR: node not found."; exit 1; }

echo "==> Configuration"
echo "    Bucket:     $R2_BUCKET_NAME"
echo "    Public URL: $R2_PUBLIC_URL"
echo "    Tiles dir:  $TILES_DIR"
echo ""

# ── 1. Upload all .pmtiles to R2 ─────────────────────────────────────────────
shopt -s nullglob
pmtiles_files=("$TILES_DIR"/*.pmtiles)

if [ ${#pmtiles_files[@]} -eq 0 ]; then
  echo "No .pmtiles files found in $TILES_DIR — nothing to migrate."
  exit 0
fi

echo "==> Uploading ${#pmtiles_files[@]} .pmtiles file(s) to R2 ..."
for f in "${pmtiles_files[@]}"; do
  filename=$(basename "$f")
  r2_key="$TILES_PREFIX/$filename"
  echo "    $filename → s3://$R2_BUCKET_NAME/$r2_key"
  CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" \
  AWS_ACCESS_KEY_ID="$R2_ACCESS_KEY_ID" \
  AWS_SECRET_ACCESS_KEY="$R2_SECRET_ACCESS_KEY" \
  wrangler r2 object put \
    "$R2_BUCKET_NAME/$r2_key" \
    --file "$f" \
    --content-type "application/octet-stream"
done
echo ""

# ── 2. Update all manifest-*.json tilesUrl fields ─────────────────────────────
echo "==> Updating manifest tilesUrl fields to R2 URLs ..."
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

for manifest in "$TILES_DIR"/manifest-*.json; do
  mname=$(basename "$manifest")
  node -e "
    const fs = require('fs');
    const m = JSON.parse(fs.readFileSync('$manifest', 'utf8'));
    let changed = 0;
    for (const l of (m.layers || [])) {
      if (l.tilesUrl && l.tilesUrl.startsWith('/tiles/v1/')) {
        const filename = l.tilesUrl.split('/').pop();
        l.tilesUrl = '${R2_PUBLIC_URL}/${TILES_PREFIX}/' + filename;
        changed++;
      }
    }
    if (changed > 0) {
      m.generatedAt = '${NOW}';
      fs.writeFileSync('$manifest', JSON.stringify(m, null, 2) + '\n');
      console.log('  Updated $mname (' + changed + ' layer(s))');
    } else {
      console.log('  Skipped $mname (no /tiles/v1/ URLs found)');
    }
  "
done
echo ""

# ── 3. Remove .pmtiles from git tracking ─────────────────────────────────────
echo "==> Removing .pmtiles from git ..."
git rm --cached "$TILES_DIR"/*.pmtiles
echo "    (files removed from git index; physical files kept locally for now)"
echo ""

# ── 4. Update .gitignore to prevent re-adding .pmtiles ───────────────────────
GITIGNORE_ENTRY="web/public/tiles/v1/*.pmtiles"
if ! grep -qxF "$GITIGNORE_ENTRY" .gitignore 2>/dev/null; then
  echo "$GITIGNORE_ENTRY" >> .gitignore
  git add .gitignore
  echo "==> Added $GITIGNORE_ENTRY to .gitignore"
fi

# ── 5. Commit everything ──────────────────────────────────────────────────────
git add "$TILES_DIR"/manifest-*.json

echo "==> Committing ..."
git commit -m "chore(tiles): migrate PMTiles from git to Cloudflare R2

All .pmtiles binaries (~169 MB) have been uploaded to R2 bucket
'$R2_BUCKET_NAME' and removed from the repo. Manifests updated to
use R2 public URLs. GitHub Actions (.github/workflows/refresh-tiles.yml)
will keep each layer refreshed on its scheduled cadence going forward.

Reduces Vercel build size by ~169 MB."

echo ""
echo "==> Done!"
echo ""
echo "Next steps:"
echo "  1. Push to main:  git push origin main"
echo "  2. Verify the map loads at http://localhost:3005 (npm run dev from web/)"
echo "     → Open DevTools Network tab and confirm tiles are fetched from $R2_PUBLIC_URL"
echo "  3. Add these GitHub Secrets (repo Settings → Secrets → Actions):"
echo "       CLOUDFLARE_ACCOUNT_ID  = $CLOUDFLARE_ACCOUNT_ID"
echo "       R2_ACCESS_KEY_ID       = $R2_ACCESS_KEY_ID"
echo "       R2_SECRET_ACCESS_KEY   = (your secret)"
echo "       R2_BUCKET_NAME         = $R2_BUCKET_NAME"
echo "       R2_PUBLIC_URL          = $R2_PUBLIC_URL"
echo "       GH_PAT                 = (GitHub PAT with repo write scope)"
echo "  4. Trigger a test run: Actions → Refresh static PMTiles → Run workflow → cwfis"
