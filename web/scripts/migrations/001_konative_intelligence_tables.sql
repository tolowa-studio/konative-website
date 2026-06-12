-- Konative Intelligence Tables Migration
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/tcbworxmlmxoyzcvdjhh/sql
-- Created: 2026-06-12

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. TBCP Awards — Tribal Broadband Connectivity Program (all 275 NTIA awards)
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists tbcp_awards (
  id uuid primary key default gen_random_uuid(),
  ntia_award_id text,
  grantee_name text not null,
  tribe_name text,
  state text,
  award_amount_usd numeric,
  award_date text,
  nofo_round text,                    -- 'Round 1', 'Round 2', 'Round 3', 'NOFO 3'
  project_type text,                  -- 'Infrastructure Deployment', 'Use & Adoption', etc.
  project_description text,
  lat numeric,
  lng numeric,
  households_served integer,
  slug text unique not null,          -- URL-safe identifier, used as page slug
  raw_properties jsonb,               -- full ArcGIS feature properties
  -- Enrichment fields (added by Konative)
  connectivity_gap_assessment text,   -- free text assessment
  edc_present boolean,                -- does this tribe have an EDC?
  casino_present boolean,             -- does this tribe operate a casino/resort?
  datacenter_potential boolean,       -- is datacenter venture possible?
  estimated_mrc_potential text,       -- rough MRC band for connectivity advisory
  outreach_status text default 'not_started',  -- 'not_started' | 'outreach_sent' | 'meeting_booked' | 'client'
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tbcp_awards_state_idx on tbcp_awards(state);
create index if not exists tbcp_awards_slug_idx on tbcp_awards(slug);
create index if not exists tbcp_awards_nofo_round_idx on tbcp_awards(nofo_round);
create index if not exists tbcp_awards_outreach_status_idx on tbcp_awards(outreach_status);

-- Full-text search on grantee + description
create index if not exists tbcp_awards_fts_idx on tbcp_awards
  using gin(to_tsvector('english', coalesce(grantee_name, '') || ' ' || coalesce(tribe_name, '') || ' ' || coalesce(project_description, '')));


-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Connectivity Signals — daily signal machine output
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists connectivity_signals (
  id uuid primary key default gen_random_uuid(),
  signal_id text unique not null,     -- dedup key: source:entity:date hash
  source text not null,               -- 'ferc_elibrary' | 'miso_queue' | 'pjm_queue' | 'caiso_queue' | 'ntia_tbcp' | 'tribal_news' | 'manual'
  lane text not null default 'general',  -- 'tribal' | 'datacenter' | 'general'
  entity_name text not null,
  location_state text,
  location_lat numeric,
  location_lng numeric,
  signal_type text not null,          -- 'large_load_filing' | 'interconnection_queue' | 'tbcp_award' | 'datacenter_announcement' | etc.
  estimated_mrc_band text,            -- '<$1K' | '$1K-$5K' | '$5K-$25K' | '$25K-$100K' | '$100K+'
  capacity_mw numeric,                -- for power/interconnection signals
  description text,
  source_url text,
  raw_data jsonb,
  discovered_at timestamptz not null default now(),
  map_permalink text,                 -- konative.com/map?lat=X&lng=Y&zoom=Z
  -- CRM pipeline fields
  status text not null default 'new',  -- 'new' | 'reviewed' | 'outreach_sent' | 'meeting_booked' | 'deal_created' | 'dead'
  outreach_draft text,                -- AI-generated first touch draft
  twenty_crm_deal_id text,            -- TwentyCRM Deal ID when deal is created
  reviewed_by text,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists conn_signals_lane_idx on connectivity_signals(lane);
create index if not exists conn_signals_status_idx on connectivity_signals(status);
create index if not exists conn_signals_source_idx on connectivity_signals(source);
create index if not exists conn_signals_discovered_idx on connectivity_signals(discovered_at desc);
create index if not exists conn_signals_mrc_band_idx on connectivity_signals(estimated_mrc_band);


-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Weekly Briefs — Connectivity Demand Brief archive
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists connectivity_briefs (
  id uuid primary key default gen_random_uuid(),
  issue_number integer unique not null,
  slug text unique not null,          -- URL slug: 'issue-001-june-2026'
  title text not null,
  published_at timestamptz,
  status text default 'draft',        -- 'draft' | 'published'
  -- Content
  intro_text text,
  signals jsonb,                      -- array of signal IDs included in this brief
  map_spotlight_lat numeric,
  map_spotlight_lng numeric,
  map_spotlight_description text,
  funding_alert text,
  provider_insight text,
  -- Distribution
  resend_broadcast_id text,           -- Resend batch email ID
  linkedin_post_ids text[],           -- array of published LinkedIn post IDs
  -- Metrics
  email_opens integer,
  email_clicks integer,
  linkedin_impressions integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists briefs_published_idx on connectivity_briefs(published_at desc);
create index if not exists briefs_status_idx on connectivity_briefs(status);


-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Commission Statements — monthly Pathfinder commission data
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists commission_statements (
  id uuid primary key default gen_random_uuid(),
  statement_month text not null,      -- 'YYYY-MM' format
  provider text not null,
  customer_name text,
  service_description text,
  net_billed_usd numeric,
  commission_rate numeric,            -- as decimal, e.g. 0.18 for 18%
  commission_amount_usd numeric,
  spiff_amount_usd numeric default 0,
  expected_rate numeric,              -- from provider rate table
  variance_amount_usd numeric,        -- actual - expected
  variance_pct numeric,               -- (actual - expected) / expected * 100
  evergreen_status boolean,
  contract_end_date text,
  alert_flag boolean default false,
  alert_reason text,
  pathfinder_line_id text,            -- Pathfinder statement line identifier
  raw_data jsonb,
  created_at timestamptz default now()
);

create index if not exists comm_statements_month_idx on commission_statements(statement_month desc);
create index if not exists comm_statements_provider_idx on commission_statements(provider);
create index if not exists comm_statements_alert_idx on commission_statements(alert_flag) where alert_flag = true;

-- Unique constraint to prevent duplicate ingestion
create unique index if not exists comm_statements_dedup_idx
  on commission_statements(statement_month, provider, coalesce(customer_name, ''), coalesce(service_description, ''));


-- ─────────────────────────────────────────────────────────────────────────────
-- Row-level security (enable for all tables, Konative is single-tenant for now)
-- ─────────────────────────────────────────────────────────────────────────────

alter table tbcp_awards enable row level security;
alter table connectivity_signals enable row level security;
alter table connectivity_briefs enable row level security;
alter table commission_statements enable row level security;

-- Public read for tbcp_awards and briefs (they're public intelligence)
create policy "Public read tbcp_awards"
  on tbcp_awards for select
  using (true);

create policy "Public read published briefs"
  on connectivity_briefs for select
  using (status = 'published');

-- Signals and commissions: service role only (not public)
create policy "Service role only — signals"
  on connectivity_signals for all
  using (auth.role() = 'service_role');

create policy "Service role only — commissions"
  on commission_statements for all
  using (auth.role() = 'service_role');
