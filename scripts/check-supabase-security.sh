#!/usr/bin/env bash
# Run Supabase Database Linter against konative-intel. Fails on ERROR-level findings.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB="$ROOT/web"
GCP_PROJECT="${GCP_PROJECT:-spokanewire}"
GCP_SECRET="${GCP_SUPABASE_TOKEN_SECRET:-konative-supabase-access-token}"

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]] && command -v gcloud >/dev/null 2>&1; then
  if SUPABASE_ACCESS_TOKEN="$(gcloud secrets versions access latest \
    --project="$GCP_PROJECT" \
    --secret="$GCP_SECRET" 2>/dev/null)"; then
    export SUPABASE_ACCESS_TOKEN
    echo "Loaded SUPABASE_ACCESS_TOKEN from GCP Secret Manager ($GCP_PROJECT/$GCP_SECRET)."
  fi
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN is required." >&2
  echo "  - GCP: gcloud secrets versions access latest --project=$GCP_PROJECT --secret=$GCP_SECRET" >&2
  echo "  - Or: export SUPABASE_ACCESS_TOKEN=... (Supabase Dashboard → Account → Access Tokens)" >&2
  echo "  - Or: ./scripts/sync-gcp-secrets-to-github.sh (for CI)" >&2
  exit 1
fi

cd "$WEB"
npx --yes supabase@latest db lint --linked --fail-on error

echo "Supabase security lint: no ERROR-level findings."
