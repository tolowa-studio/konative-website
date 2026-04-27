create extension if not exists pgcrypto;
create extension if not exists postgis with schema extensions;

create table if not exists public.interconnection_queue (
  id uuid primary key default gen_random_uuid(),
  authority text not null check (authority in ('IESO', 'AESO', 'HQ', 'BCH', 'PJM', 'MISO', 'ERCOT', 'CAISO', 'ISO-NE', 'NYISO')),
  source_id text not null,
  project_name text not null,
  capacity_mw numeric not null default 0 check (capacity_mw >= 0),
  resource_type text not null check (resource_type in ('load', 'gas', 'wind', 'solar', 'hydro', 'nuclear', 'battery', 'hybrid', 'other')),
  study_phase text not null check (study_phase in ('application', 'feasibility', 'system_impact', 'facilities', 'agreement_signed', 'construction', 'in_service', 'withdrawn')),
  queue_date date not null,
  expected_cod date,
  poi_name text,
  poi_lat double precision check (poi_lat is null or (poi_lat >= -90 and poi_lat <= 90)),
  poi_lng double precision check (poi_lng is null or (poi_lng >= -180 and poi_lng <= 180)),
  source_url text not null,
  last_updated timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  poi_geog geography(point, 4326) generated always as (
    case
      when poi_lat is not null and poi_lng is not null then
        (extensions.st_setsrid(extensions.st_makepoint(poi_lng, poi_lat), 4326))::geography
      else null
    end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (authority, source_id)
);

create index if not exists interconnection_queue_authority_idx on public.interconnection_queue (authority);
create index if not exists interconnection_queue_phase_idx on public.interconnection_queue (study_phase);
create index if not exists interconnection_queue_poi_geog_idx on public.interconnection_queue using gist (poi_geog);

create or replace function public.touch_interconnection_queue_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_touch_interconnection_queue on public.interconnection_queue;
create trigger trg_touch_interconnection_queue
before update on public.interconnection_queue
for each row
execute function public.touch_interconnection_queue_updated_at();

create or replace function public.get_interconnection_queue_radius(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 50
)
returns table (
  id uuid,
  authority text,
  project_name text,
  capacity_mw numeric,
  resource_type text,
  study_phase text,
  queue_date date,
  expected_cod date,
  poi_name text,
  poi_lat double precision,
  poi_lng double precision,
  source_url text,
  last_updated timestamptz,
  distance_km double precision
)
language sql
stable
as $$
  with center as (
    select (extensions.st_setsrid(extensions.st_makepoint(p_lng, p_lat), 4326))::geography as geog
  )
  select
    q.id,
    q.authority,
    q.project_name,
    q.capacity_mw,
    q.resource_type,
    q.study_phase,
    q.queue_date,
    q.expected_cod,
    q.poi_name,
    q.poi_lat,
    q.poi_lng,
    q.source_url,
    q.last_updated,
    extensions.st_distance(q.poi_geog, c.geog) / 1000.0 as distance_km
  from public.interconnection_queue q
  cross join center c
  where q.poi_geog is not null
    and extensions.st_dwithin(q.poi_geog, c.geog, p_radius_km * 1000.0)
  order by distance_km asc, q.capacity_mw desc;
$$;

alter table public.interconnection_queue enable row level security;

drop policy if exists "interconnection_queue_read_all" on public.interconnection_queue;
create policy "interconnection_queue_read_all"
on public.interconnection_queue
for select
to anon, authenticated
using (true);

grant execute on function public.get_interconnection_queue_radius(double precision, double precision, double precision) to anon, authenticated;
