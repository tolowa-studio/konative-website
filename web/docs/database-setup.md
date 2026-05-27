# Postgres provisioning for Konative

## Priority order
1. Vercel Postgres (preferred for deployment simplicity)
2. Neon
3. Supabase Postgres

## Current status
- A Neon Postgres resource (`konative-db`) may be provisioned and linked to Vercel project `konative-site` (or attach Postgres in the Vercel dashboard for that project).
- Neon populated these environment variables in Vercel for Development/Preview/Production:
  - `DATABASE_URL`
  - `DATABASE_URL_UNPOOLED`
  - `POSTGRES_*` and `PG*` variants
- `DATABASE_URI` still needs to be aligned to `DATABASE_URL` if the application expects `DATABASE_URI` specifically.

## Connection string format (required)
Use this format for all providers:

`postgres://<user>:<password>@<host>:5432/<database>?sslmode=require`

## Option A: Vercel Postgres (recommended)
1. Vercel Dashboard -> `konative-site` -> **Storage** -> **Create Database** -> **Postgres**.
2. Accept default region near deployment region (IAD recommended if app stays in US East).
3. Link database to `konative-site`.
4. Copy generated `POSTGRES_URL` or connection URI.
5. Set `DATABASE_URI` to that value in Vercel env vars (Dev/Preview/Prod) and `.env.local`.

## Option B: Neon
1. (Already completed) Neon integration is installed and connected to the project.
2. Pull vars locally with `vercel env pull .env.development.local`.
3. Map `DATABASE_URI` to `DATABASE_URL` if your runtime expects `DATABASE_URI`.
4. Keep SSL required for all production connections.

## Option C: Supabase Postgres
1. Create Supabase project at [https://supabase.com](https://supabase.com).
2. Open Project Settings -> Database.
3. Copy connection string (session/pooling URI) with SSL enabled.
4. Set `DATABASE_URI` in Vercel + `.env.local`.

For the live **konative-intel** project, review Security Advisor findings and remediation in [supabase-security.md](./supabase-security.md). CI loads the Supabase CLI token from GCP Secret Manager (`spokanewire`); bootstrap with `./scripts/sync-gcp-secrets-to-github.sh` from the repo root.
