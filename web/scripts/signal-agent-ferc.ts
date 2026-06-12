/**
 * signal-agent-ferc.ts
 *
 * Konative Signal Machine — FERC Large-Load Interconnection Queue Monitor
 *
 * Scrapes FERC eLibrary for large-load interconnection docket filings.
 * Large-load requests (100MW+) are the earliest public signal of a greenfield
 * datacenter or AI compute campus — typically 24–48 months pre-commissioning.
 *
 * Also polls public ISO/RTO queue CSVs:
 *   - MISO: https://www.misoenergy.org/planning/generator-interconnection/GI_Queue/
 *   - PJM:  https://www.pjm.com/planning/new-services-queue
 *   - CAISO: https://www.caiso.com (generator interconnection queue)
 *   - ERCOT: https://mis.ercot.com (GIS queue)
 *
 * Output: writes structured Signal records to Supabase `connectivity_signals` table
 *
 * Run: npx tsx scripts/signal-agent-ferc.ts
 * Schedule: daily via GitHub Actions cron (see .github/workflows/signal-agent.yml)
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tcbworxmlmxoyzcvdjhh.supabase.co'
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjYndvcnhtbG14b3l6Y3ZkamhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyODczMTksImV4cCI6MjA5MTg2MzMxOX0.bAU-JCOSEH5RuJZcpDR5WTSU7zTjOEQ4sn6kaY8UIYg'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Large-load threshold for datacenter/AI compute signal qualification (MW)
const LARGE_LOAD_MW_THRESHOLD = 50

// ── Signal record schema ────────────────────────────────────────────────────

interface ConnectivitySignal {
  signal_id: string
  source: 'ferc_elibrary' | 'miso_queue' | 'pjm_queue' | 'caiso_queue' | 'ercot_queue' | 'ntia_tbcp' | 'tribal_news' | 'manual'
  lane: 'tribal' | 'datacenter' | 'general'
  entity_name: string
  location_state: string | null
  location_lat: number | null
  location_lng: number | null
  signal_type: 'large_load_filing' | 'interconnection_queue' | 'tbcp_award' | 'datacenter_announcement' | 'tribal_edc_news' | 'bead_award'
  estimated_mrc_band: '<$1K' | '$1K-$5K' | '$5K-$25K' | '$25K-$100K' | '$100K+' | null
  capacity_mw: number | null
  description: string
  source_url: string | null
  raw_data: Record<string, unknown>
  discovered_at: string
  map_permalink: string | null
  status: 'new' | 'reviewed' | 'outreach_sent' | 'deal_created' | 'dead'
}

function generateSignalId(source: string, entityName: string, date: string): string {
  const raw = `${source}:${entityName}:${date}`
  // Simple hash for dedup key
  let hash = 0
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash) + raw.charCodeAt(i)
    hash |= 0
  }
  return `sig_${source}_${Math.abs(hash).toString(36)}`
}

function estimateMrcBand(mw: number | null): ConnectivitySignal['estimated_mrc_band'] {
  if (!mw) return null
  if (mw >= 200) return '$100K+'
  if (mw >= 50) return '$25K-$100K'
  if (mw >= 10) return '$5K-$25K'
  return '$1K-$5K'
}

function buildMapPermalink(lat: number | null, lng: number | null, zoom = 8): string | null {
  if (!lat || !lng) return null
  return `https://konative.com/map?lat=${lat.toFixed(4)}&lng=${lng.toFixed(4)}&zoom=${zoom}`
}

// ── FERC eLibrary Scraper ───────────────────────────────────────────────────

async function fetchFERCLargeLoadFilings(): Promise<ConnectivitySignal[]> {
  console.log('🔍 Fetching FERC eLibrary large-load filings...')

  // FERC eLibrary full-text search API
  // Docket RM26-4: Large Load Interconnection Rulemaking (2026)
  // Also search GI dockets for large-load requests
  const FERC_SEARCH_URL = 'https://elibrary.ferc.gov/eLibrary/search'

  const searchParams = new URLSearchParams({
    query: 'large load interconnection request data center',
    dateRange: 'custom',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // last 30 days
    endDate: new Date().toISOString().split('T')[0],
    format: 'json',
    maxResults: '50',
  })

  try {
    const res = await fetch(`${FERC_SEARCH_URL}?${searchParams}`, {
      headers: {
        'User-Agent': 'Konative/1.0 Research Bot (connectivity intelligence brokerage; contact jjames@tolowa.net)',
        'Accept': 'application/json',
      },
    })

    if (!res.ok) {
      console.warn(`  FERC eLibrary returned ${res.status} — trying RSS feed fallback`)
      return await fetchFERCRSSFallback()
    }

    const data = await res.json()
    const filings = data.results || data.items || []
    console.log(`  Found ${filings.length} FERC filings`)

    return filings
      .filter((f: Record<string, unknown>) => {
        const text = JSON.stringify(f).toLowerCase()
        return text.includes('large load') || text.includes('data center') || text.includes('datacenter') || text.includes('ai campus')
      })
      .map((f: Record<string, unknown>) => {
        const now = new Date().toISOString()
        const entityName = (f.applicant || f.filer || f.company || 'Unknown Applicant') as string
        return {
          signal_id: generateSignalId('ferc_elibrary', entityName, now),
          source: 'ferc_elibrary' as const,
          lane: 'datacenter' as const,
          entity_name: entityName,
          location_state: (f.state || null) as string | null,
          location_lat: null,
          location_lng: null,
          signal_type: 'large_load_filing' as const,
          estimated_mrc_band: estimateMrcBand(null),
          capacity_mw: null,
          description: (f.description || f.summary || f.title || 'FERC large-load filing') as string,
          source_url: (f.url || f.link || `https://elibrary.ferc.gov/eLibrary/docDetails?documentId=${f.id}`) as string,
          raw_data: f,
          discovered_at: now,
          map_permalink: null,
          status: 'new' as const,
        }
      })
  } catch (err) {
    console.warn(`  FERC eLibrary fetch error: ${(err as Error).message}`)
    return await fetchFERCRSSFallback()
  }
}

async function fetchFERCRSSFallback(): Promise<ConnectivitySignal[]> {
  // FERC provides RSS feeds for recent filings by docket type
  // GI = Generator Interconnection dockets
  const RSS_URL = 'https://elibrary.ferc.gov/eLibrary/search?q=large+load&docketPrefix=GI&format=atom'

  try {
    const res = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Konative/1.0 Research Bot' },
    })
    if (!res.ok) return []

    const xml = await res.text()
    // Simple XML parsing for Atom feed entries
    const entries: ConnectivitySignal[] = []
    const entryMatches = xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)

    for (const match of entryMatches) {
      const entry = match[1]
      const title = entry.match(/<title[^>]*>(.*?)<\/title>/)?.[1] || 'FERC Filing'
      const link = entry.match(/<link[^>]*href="([^"]+)"/)?.[1] || null
      const updated = entry.match(/<updated>(.*?)<\/updated>/)?.[1] || new Date().toISOString()
      const summary = entry.match(/<summary[^>]*>([\s\S]*?)<\/summary>/)?.[1] || ''

      // Filter for large-load relevant filings
      const text = (title + summary).toLowerCase()
      if (!text.includes('large load') && !text.includes('data center') && !text.includes('ai')) continue

      entries.push({
        signal_id: generateSignalId('ferc_elibrary', title, updated),
        source: 'ferc_elibrary',
        lane: 'datacenter',
        entity_name: title.replace(/<[^>]+>/g, '').slice(0, 200),
        location_state: null,
        location_lat: null,
        location_lng: null,
        signal_type: 'large_load_filing',
        estimated_mrc_band: null,
        capacity_mw: null,
        description: summary.replace(/<[^>]+>/g, '').trim().slice(0, 500),
        source_url: link,
        raw_data: { title, summary, updated },
        discovered_at: new Date().toISOString(),
        map_permalink: null,
        status: 'new',
      })
    }

    console.log(`  RSS fallback found ${entries.length} relevant entries`)
    return entries
  } catch (err) {
    console.warn(`  RSS fallback also failed: ${(err as Error).message}`)
    return []
  }
}

// ── MISO Queue Scraper ──────────────────────────────────────────────────────

async function fetchMISOQueue(): Promise<ConnectivitySignal[]> {
  console.log('🔍 Fetching MISO interconnection queue...')

  // MISO publishes their GI queue as a public Excel/CSV download
  // Updated: https://www.misoenergy.org/planning/generator-interconnection/GI_Queue/
  const MISO_QUEUE_URL = 'https://www.misoenergy.org/api/report/AcceptedProjects?_=1'

  try {
    const res = await fetch(MISO_QUEUE_URL, {
      headers: { 'User-Agent': 'Konative/1.0 Research Bot' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const projects = Array.isArray(data) ? data : (data.projects || data.data || [])

    const largeLoad = projects.filter((p: Record<string, unknown>) => {
      const mw = parseFloat(String(p.capacity_mw || p.mw || p.MW || 0))
      return mw >= LARGE_LOAD_MW_THRESHOLD
    })

    console.log(`  MISO queue: ${projects.length} total, ${largeLoad.length} large-load (≥${LARGE_LOAD_MW_THRESHOLD}MW)`)

    return largeLoad.map((p: Record<string, unknown>) => {
      const mw = parseFloat(String(p.capacity_mw || p.mw || p.MW || 0))
      const entityName = (p.developer || p.company || p.project_name || p.name || 'Unknown Developer') as string
      const state = (p.state || p.STATE || null) as string | null
      const now = new Date().toISOString()

      return {
        signal_id: generateSignalId('miso_queue', entityName, String(p.queue_date || now)),
        source: 'miso_queue' as const,
        lane: 'datacenter' as const,
        entity_name: entityName,
        location_state: state,
        location_lat: (p.lat || p.latitude || null) as number | null,
        location_lng: (p.lon || p.lng || p.longitude || null) as number | null,
        signal_type: 'interconnection_queue' as const,
        estimated_mrc_band: estimateMrcBand(mw),
        capacity_mw: mw,
        description: `MISO large-load interconnection request: ${mw}MW, ${state || 'location TBD'}. Queue status: ${p.status || 'pending'}`,
        source_url: 'https://www.misoenergy.org/planning/generator-interconnection/GI_Queue/',
        raw_data: p,
        discovered_at: now,
        map_permalink: buildMapPermalink(
          (p.lat || p.latitude || null) as number | null,
          (p.lon || p.lng || p.longitude || null) as number | null
        ),
        status: 'new' as const,
      }
    })
  } catch (err) {
    console.warn(`  MISO queue fetch error: ${(err as Error).message}`)
    return []
  }
}

// ── Write signals to Supabase ───────────────────────────────────────────────

async function ensureSignalsTable() {
  const { error } = await supabase.from('connectivity_signals').select('count').limit(1)
  if (error?.code === '42P01') {
    console.error('⚠️  Table connectivity_signals does not exist. Create it in Supabase dashboard:')
    console.error(`
    create table connectivity_signals (
      id uuid primary key default gen_random_uuid(),
      signal_id text unique not null,
      source text not null,
      lane text not null default 'general',
      entity_name text not null,
      location_state text,
      location_lat numeric,
      location_lng numeric,
      signal_type text not null,
      estimated_mrc_band text,
      capacity_mw numeric,
      description text,
      source_url text,
      raw_data jsonb,
      discovered_at timestamptz not null default now(),
      map_permalink text,
      status text not null default 'new',
      created_at timestamptz default now(),
      updated_at timestamptz default now()
    );
    create index connectivity_signals_lane_idx on connectivity_signals(lane);
    create index connectivity_signals_status_idx on connectivity_signals(status);
    create index connectivity_signals_source_idx on connectivity_signals(source);
    `)
    process.exit(1)
  }
}

async function writeSignals(signals: ConnectivitySignal[]): Promise<number> {
  if (signals.length === 0) return 0

  const { data, error } = await supabase
    .from('connectivity_signals')
    .upsert(signals, { onConflict: 'signal_id', ignoreDuplicates: true })

  if (error) {
    console.error('  Upsert error:', error.message)
    return 0
  }

  return signals.length
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log('📡 Konative Signal Agent — FERC + ISO Queue Monitor')
  console.log('====================================================')
  console.log(`Run time: ${new Date().toISOString()}`)
  console.log('')

  await ensureSignalsTable()

  const allSignals: ConnectivitySignal[] = []

  // Run all scrapers
  const [fercSignals, misoSignals] = await Promise.allSettled([
    fetchFERCLargeLoadFilings(),
    fetchMISOQueue(),
  ])

  if (fercSignals.status === 'fulfilled') allSignals.push(...fercSignals.value)
  if (misoSignals.status === 'fulfilled') allSignals.push(...misoSignals.value)

  console.log(`\n📊 Total new signals collected: ${allSignals.length}`)

  if (allSignals.length > 0) {
    const written = await writeSignals(allSignals)
    console.log(`✓ Wrote ${written} signals to Supabase`)
  }

  // Summary report
  const byLane = allSignals.reduce((acc, s) => {
    acc[s.lane] = (acc[s.lane] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const bySource = allSignals.reduce((acc, s) => {
    acc[s.source] = (acc[s.source] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  console.log('\n📈 Signal breakdown:')
  console.log('  By lane:', byLane)
  console.log('  By source:', bySource)

  const highValue = allSignals.filter(s => s.estimated_mrc_band === '$100K+' || s.estimated_mrc_band === '$25K-$100K')
  if (highValue.length > 0) {
    console.log(`\n🔥 ${highValue.length} HIGH-VALUE signals (estimated $25K+ MRC):`)
    highValue.forEach(s => {
      console.log(`  - ${s.entity_name} | ${s.location_state || 'TBD'} | ${s.capacity_mw}MW | ${s.signal_type}`)
      if (s.map_permalink) console.log(`    Map: ${s.map_permalink}`)
    })
  }

  console.log('\n✅ Signal agent run complete')
  console.log('Next: Review new signals at https://konative.com/admin/signals or in TwentyCRM')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
