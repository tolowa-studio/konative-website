-- Konative intelligence — Cloudflare D1 (SQLite)
-- Replaces Supabase Postgres (no PostGIS; use Haversine for radius queries)
-- Applied via: wrangler d1 execute konative-intel --remote --file=./d1/migrations/0001_konative_intel.sql

PRAGMA foreign_keys = ON;

-- ── TBCP Awards ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tbcp_awards (
  id TEXT PRIMARY KEY,
  ntia_award_id TEXT,
  grantee_name TEXT NOT NULL,
  tribe_name TEXT,
  state TEXT,
  award_amount_usd REAL,
  award_date TEXT,
  nofo_round TEXT,
  project_type TEXT,
  project_description TEXT,
  lat REAL,
  lng REAL,
  households_served INTEGER,
  slug TEXT NOT NULL UNIQUE,
  raw_properties TEXT,
  connectivity_gap_assessment TEXT,
  edc_present INTEGER,
  casino_present INTEGER,
  datacenter_potential INTEGER,
  estimated_mrc_potential TEXT,
  outreach_status TEXT DEFAULT 'not_started',
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS tbcp_awards_state_idx ON tbcp_awards(state);
CREATE INDEX IF NOT EXISTS tbcp_awards_nofo_round_idx ON tbcp_awards(nofo_round);
CREATE INDEX IF NOT EXISTS tbcp_awards_outreach_status_idx ON tbcp_awards(outreach_status);

-- ── Interconnection Queue ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS interconnection_queue (
  id TEXT PRIMARY KEY,
  authority TEXT NOT NULL,
  source_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  capacity_mw REAL NOT NULL DEFAULT 0,
  resource_type TEXT NOT NULL,
  study_phase TEXT NOT NULL,
  queue_date TEXT NOT NULL,
  expected_cod TEXT,
  poi_name TEXT,
  poi_lat REAL,
  poi_lng REAL,
  source_url TEXT NOT NULL,
  last_updated TEXT NOT NULL DEFAULT (datetime('now')),
  metadata TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (authority, source_id)
);

CREATE INDEX IF NOT EXISTS interconnection_queue_authority_idx ON interconnection_queue(authority);
CREATE INDEX IF NOT EXISTS interconnection_queue_phase_idx ON interconnection_queue(study_phase);
CREATE INDEX IF NOT EXISTS interconnection_queue_lat_idx ON interconnection_queue(poi_lat, poi_lng);

-- ── Connectivity Signals ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS connectivity_signals (
  id TEXT PRIMARY KEY,
  signal_id TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL,
  lane TEXT NOT NULL DEFAULT 'general',
  entity_name TEXT NOT NULL,
  location_state TEXT,
  location_lat REAL,
  location_lng REAL,
  signal_type TEXT NOT NULL,
  estimated_mrc_band TEXT,
  capacity_mw REAL,
  description TEXT,
  source_url TEXT,
  raw_data TEXT,
  discovered_at TEXT NOT NULL DEFAULT (datetime('now')),
  map_permalink TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  outreach_draft TEXT,
  twenty_crm_deal_id TEXT,
  reviewed_by TEXT,
  reviewed_at TEXT,
  notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS conn_signals_lane_idx ON connectivity_signals(lane);
CREATE INDEX IF NOT EXISTS conn_signals_status_idx ON connectivity_signals(status);
CREATE INDEX IF NOT EXISTS conn_signals_discovered_idx ON connectivity_signals(discovered_at DESC);

-- ── Sponsorship Placements ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS sponsorship_placements (
  id TEXT PRIMARY KEY,
  sponsor_name TEXT NOT NULL,
  logo_url TEXT,
  tagline TEXT,
  cta_url TEXT,
  cta_text TEXT,
  placement_type TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 1,
  start_date TEXT,
  end_date TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS sponsorship_active_idx ON sponsorship_placements(is_active, placement_type);

-- ── DC Facilities ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dc_facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  operator TEXT,
  city TEXT,
  state TEXT,
  status TEXT,
  capacity_mw REAL,
  facility_type TEXT,
  lat REAL,
  lng REAL,
  raw_data TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dc_availability_scores (
  id TEXT PRIMARY KEY,
  availability_score REAL,
  power_score REAL,
  water_score REAL,
  fiber_score REAL,
  land_score REAL,
  permitting_score REAL,
  momentum_score REAL,
  lat REAL,
  lng REAL,
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ── Network / Generation ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS network_facilities (
  id TEXT PRIMARY KEY,
  pdb_id INTEGER,
  name TEXT,
  org_name TEXT,
  city TEXT,
  state TEXT,
  net_count INTEGER,
  ix_count INTEGER,
  lat REAL,
  lng REAL,
  raw_data TEXT
);

CREATE TABLE IF NOT EXISTS generation_pipeline (
  id TEXT PRIMARY KEY,
  plant_id TEXT,
  plant_name TEXT,
  utility_name TEXT,
  county TEXT,
  state TEXT,
  technology TEXT,
  capacity_mw REAL,
  planned_year INTEGER,
  lat REAL,
  lng REAL,
  raw_data TEXT
);

-- ── Investment Deals ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS investment_deals (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  status TEXT,
  deal_type TEXT,
  amount_usd REAL,
  announced_at TEXT,
  location_state TEXT,
  description TEXT,
  source_url TEXT,
  raw_data TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Briefs + Commissions ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS connectivity_briefs (
  id TEXT PRIMARY KEY,
  issue_number INTEGER NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  published_at TEXT,
  status TEXT DEFAULT 'draft',
  intro_text TEXT,
  signals TEXT,
  map_spotlight_lat REAL,
  map_spotlight_lng REAL,
  map_spotlight_description TEXT,
  funding_alert TEXT,
  provider_insight TEXT,
  resend_broadcast_id TEXT,
  linkedin_post_ids TEXT,
  email_opens INTEGER,
  email_clicks INTEGER,
  linkedin_impressions INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS commission_statements (
  id TEXT PRIMARY KEY,
  statement_month TEXT NOT NULL,
  provider TEXT NOT NULL,
  customer_name TEXT,
  service_description TEXT,
  net_billed_usd REAL,
  commission_rate REAL,
  commission_amount_usd REAL,
  spiff_amount_usd REAL DEFAULT 0,
  expected_rate REAL,
  variance_amount_usd REAL,
  variance_pct REAL,
  evergreen_status INTEGER,
  contract_end_date TEXT,
  alert_flag INTEGER DEFAULT 0,
  alert_reason TEXT,
  pathfinder_line_id TEXT,
  raw_data TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- ── Data source registry ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS data_sources (
  id TEXT PRIMARY KEY,
  source_key TEXT NOT NULL UNIQUE,
  display_name TEXT,
  last_ingested_at TEXT,
  row_count INTEGER,
  status TEXT DEFAULT 'unknown',
  notes TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS feed_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  lane TEXT,
  is_active INTEGER DEFAULT 1,
  last_fetched_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
