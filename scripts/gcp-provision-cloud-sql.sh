#!/usr/bin/env bash
# Provision minimum Cloud SQL Postgres for Konative Cloud Run staging (TOL-314).
# Run via GitHub Actions (WIF) or locally with gcloud authenticated on tolowa-studio.
#
# Creates (if missing):
#   - Cloud SQL instance konative-intel (Postgres 16, db-f1-micro)
#   - Database konative_intel + user konative_app
#   - Secret konative-DATABASE_URI (Unix socket URI for Cloud Run)
#   - IAM: konative-runtime SA → roles/cloudsql.client
#
# Idempotent: safe to re-run.

set -euo pipefail

GCP_PROJECT="${GCP_PROJECT:-tolowa-studio}"
GCP_REGION="${GCP_REGION:-us-west1}"
INSTANCE_NAME="${INSTANCE_NAME:-konative-intel}"
DB_NAME="${DB_NAME:-konative_intel}"
DB_USER="${DB_USER:-konative_app}"
RUNTIME_SA="konative-runtime@${GCP_PROJECT}.iam.gserviceaccount.com"
SECRET_ID="konative-DATABASE_URI"
MIGRATION_FILE="${MIGRATION_FILE:-web/db/migrations/0001_konative_intel.sql}"
CONNECTION_NAME="${GCP_PROJECT}:${GCP_REGION}:${INSTANCE_NAME}"

echo "== Cloud SQL instance (${INSTANCE_NAME}) =="
gcloud services enable sqladmin.googleapis.com --project="${GCP_PROJECT}" >/dev/null 2>&1 || true

if gcloud sql instances describe "${INSTANCE_NAME}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  echo "  Instance exists"
else
  echo "  Creating instance (db-f1-micro, Postgres 16)..."
  gcloud sql instances create "${INSTANCE_NAME}" \
    --project="${GCP_PROJECT}" \
    --database-version=POSTGRES_16 \
    --tier=db-f1-micro \
    --region="${GCP_REGION}" \
    --storage-type=SSD \
    --storage-size=10GB \
    --storage-auto-increase \
    --backup-start-time=04:00 \
    --availability-type=zonal
  echo "  Instance created"
fi

echo "== Database (${DB_NAME}) =="
gcloud sql databases describe "${DB_NAME}" \
  --instance="${INSTANCE_NAME}" \
  --project="${GCP_PROJECT}" >/dev/null 2>&1 \
  || gcloud sql databases create "${DB_NAME}" \
    --instance="${INSTANCE_NAME}" \
    --project="${GCP_PROJECT}"

echo "== User (${DB_USER}) =="
if ! gcloud sql users list --instance="${INSTANCE_NAME}" --project="${GCP_PROJECT}" \
  --format='value(name)' | grep -qx "${DB_USER}"; then
  DB_PASSWORD="$(openssl rand -base64 24 | tr -d '/+=' | head -c 32)"
  gcloud sql users create "${DB_USER}" \
    --instance="${INSTANCE_NAME}" \
    --project="${GCP_PROJECT}" \
    --password="${DB_PASSWORD}"
  echo "  User created"
else
  echo "  User exists — reusing password from secret if present"
  DB_PASSWORD=""
  if gcloud secrets versions access latest --secret="${SECRET_ID}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
    EXISTING_URI="$(gcloud secrets versions access latest --secret="${SECRET_ID}" --project="${GCP_PROJECT}")"
    # Extract password from postgresql://user:pass@/db?host=...
    DB_PASSWORD="$(printf '%s' "${EXISTING_URI}" | sed -n 's#postgresql://[^:]*:\([^@]*\)@/.*#\1#p')"
  fi
  if [[ -z "${DB_PASSWORD}" ]]; then
    echo "ERROR: User exists but cannot recover password. Reset manually or delete user and re-run." >&2
    exit 1
  fi
fi

echo "== IAM: runtime SA can connect to Cloud SQL =="
gcloud projects add-iam-policy-binding "${GCP_PROJECT}" \
  --member="serviceAccount:${RUNTIME_SA}" \
  --role="roles/cloudsql.client" \
  --condition=None >/dev/null 2>&1 || echo "  (skipped IAM bind — grant roles/cloudsql.client to ${RUNTIME_SA} manually if needed)"

echo "== Apply schema (${MIGRATION_FILE}) =="
if [[ ! -f "${MIGRATION_FILE}" ]]; then
  echo "ERROR: Migration file not found: ${MIGRATION_FILE}" >&2
  exit 1
fi

# Use Cloud SQL Auth Proxy for one-shot migration from CI runner.
PROXY_BIN="$(command -v cloud-sql-proxy || command -v cloud_sql_proxy || true)"
if [[ -z "${PROXY_BIN}" ]]; then
  echo "  Installing cloud-sql-proxy..."
  curl -fsSL -o /tmp/cloud-sql-proxy \
    "https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.14.3/cloud-sql-proxy.linux.amd64"
  chmod +x /tmp/cloud-sql-proxy
  PROXY_BIN=/tmp/cloud-sql-proxy
fi

"${PROXY_BIN}" "${CONNECTION_NAME}" --port 9470 &
PROXY_PID=$!
trap 'kill "${PROXY_PID}" 2>/dev/null || true' EXIT
sleep 3

export PGPASSWORD="${DB_PASSWORD}"
psql "host=127.0.0.1 port=9470 dbname=${DB_NAME} user=${DB_USER} sslmode=disable" \
  -v ON_ERROR_STOP=1 \
  -f "${MIGRATION_FILE}"
unset PGPASSWORD
echo "  Schema applied"

echo "== Secret Manager (${SECRET_ID}) =="
# Cloud Run connects via Unix socket mounted by --add-cloudsql-instances.
DATABASE_URI="postgresql://${DB_USER}:${DB_PASSWORD}@/${DB_NAME}?host=/cloudsql/${CONNECTION_NAME}"

if gcloud secrets describe "${SECRET_ID}" --project="${GCP_PROJECT}" >/dev/null 2>&1; then
  printf '%s' "${DATABASE_URI}" | gcloud secrets versions add "${SECRET_ID}" \
    --project="${GCP_PROJECT}" \
    --data-file=-
else
  gcloud secrets create "${SECRET_ID}" \
    --project="${GCP_PROJECT}" \
    --replication-policy="automatic" \
    --labels="app=konative,env=staging"
  printf '%s' "${DATABASE_URI}" | gcloud secrets versions add "${SECRET_ID}" \
    --project="${GCP_PROJECT}" \
    --data-file=-
fi
echo "  Secret updated (value not printed)"

cat <<EOF

== Cloud SQL provision complete ==

Instance:  ${INSTANCE_NAME}
Database:  ${DB_NAME}
User:      ${DB_USER}
Connection: ${CONNECTION_NAME}

Next: redeploy Cloud Run with:
  --add-cloudsql-instances=${CONNECTION_NAME}
  --set-secrets=DATABASE_URI=${SECRET_ID}:latest

Full row-level D1→Cloud SQL reconciliation (TOL-314 #2-5) remains blocked on live D1 read (TOL-300).
EOF
