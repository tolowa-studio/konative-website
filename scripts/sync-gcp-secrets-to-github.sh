#!/usr/bin/env bash
# Pull secrets from GCP Secret Manager (spokanewire) into GitHub Actions secrets/variables.
#
# Prerequisites:
#   gcloud auth login   (or GOOGLE_APPLICATION_CREDENTIALS set)
#   gh auth login
#
# Usage:
#   cp scripts/gcp-github-secrets.map.example scripts/gcp-github-secrets.map
#   ./scripts/sync-gcp-secrets-to-github.sh
#   ./scripts/sync-gcp-secrets-to-github.sh --repo jerameyjames/konative-website --dry-run

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MAP_FILE="${MAP_FILE:-$ROOT/scripts/gcp-github-secrets.map}"
GCP_PROJECT="${GCP_PROJECT:-spokanewire}"
GITHUB_REPO="${GITHUB_REPO:-jerameyjames/konative-website}"
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo) GITHUB_REPO="$2"; shift 2 ;;
    --project) GCP_PROJECT="$2"; shift 2 ;;
    --map) MAP_FILE="$2"; shift 2 ;;
    --dry-run) DRY_RUN=1; shift ;;
    -h|--help)
      sed -n '1,20p' "$0"
      exit 0
      ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

if ! command -v gcloud >/dev/null 2>&1; then
  echo "gcloud CLI is required." >&2
  exit 1
fi
if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi
if [[ ! -f "$MAP_FILE" ]]; then
  echo "Missing map file: $MAP_FILE" >&2
  echo "Copy scripts/gcp-github-secrets.map.example to scripts/gcp-github-secrets.map" >&2
  exit 1
fi

gcloud config set project "$GCP_PROJECT" >/dev/null

access_gcp_secret() {
  local candidates="$1"
  local name value
  IFS=',' read -ra NAMES <<< "$candidates"
  for name in "${NAMES[@]}"; do
    name="${name// /}"
    if value="$(gcloud secrets versions access latest --secret="$name" 2>/dev/null)"; then
      printf '%s' "$value"
      return 0
    fi
  done
  return 1
}

set_github_secret() {
  local name="$1" value="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] gh secret set $name --repo $GITHUB_REPO"
    return 0
  fi
  printf '%s' "$value" | gh secret set "$name" --repo "$GITHUB_REPO"
  echo "Set GitHub secret: $name"
}

set_github_variable() {
  local name="$1" value="$2"
  if [[ "$DRY_RUN" -eq 1 ]]; then
    echo "[dry-run] gh variable set $name --repo $GITHUB_REPO"
    return 0
  fi
  gh variable set "$name" --repo "$GITHUB_REPO" --body "$value"
  echo "Set GitHub variable: $name"
}

echo "Syncing GCP project $GCP_PROJECT → GitHub repo $GITHUB_REPO"
echo "Map: $MAP_FILE"
echo

while IFS= read -r line || [[ -n "$line" ]]; do
  line="${line%%#*}"
  line="${line//[[:space:]]/}"
  [[ -z "$line" ]] && continue

  kind="${line%%:*}"
  rest="${line#*:}"
  github_name="${rest%%=*}"
  gcp_names="${rest#*=}"

  if [[ -z "$github_name" || -z "$gcp_names" ]]; then
    echo "Skipping malformed line: $line" >&2
    continue
  fi

  if ! value="$(access_gcp_secret "$gcp_names")"; then
    echo "WARN: GCP secret not found for $github_name (tried: $gcp_names)" >&2
    continue
  fi

  case "$kind" in
    secret) set_github_secret "$github_name" "$value" ;;
    variable) set_github_variable "$github_name" "$value" ;;
    *)
      echo "WARN: unknown kind '$kind' for $github_name" >&2
      ;;
  esac
done < "$MAP_FILE"

echo
echo "Done. Verify: gh secret list --repo $GITHUB_REPO && gh variable list --repo $GITHUB_REPO"
