import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'
import { createClient as createSanity } from '@sanity/client'

// ── Market definitions ────────────────────────────────────────────────────────

export const MARKETS: Record<string, {
  name: string; abbr: string; country: string
  iso: string; isoFull: string
  headline: string; subheadline: string
  tier: 'primary' | 'emerging' | 'developing'
}> = {
  virginia: {
    name: 'Virginia', abbr: 'VA', country: 'US',
    iso: 'PJM', isoFull: 'PJM Interconnection',
    headline: 'THE DATA CENTER CAPITAL OF THE WORLD',
    subheadline: 'Northern Virginia hosts more data center capacity than any other market on Earth. Power is the constraint.',
    tier: 'primary',
  },
  texas: {
    name: 'Texas', abbr: 'TX', country: 'US',
    iso: 'ERCOT', isoFull: 'Electric Reliability Council of Texas',
    headline: 'THE LONE STAR GRID',
    subheadline: 'ERCOT\'s deregulated market and abundant renewables make Texas a top-tier expansion target for hyperscalers.',
    tier: 'primary',
  },
  georgia: {
    name: 'Georgia', abbr: 'GA', country: 'US',
    iso: 'SERC', isoFull: 'SERC Reliability Corporation',
    headline: 'THE SOUTHEAST CORRIDOR',
    subheadline: 'Atlanta is the connectivity hub of the Southeast. Georgia Power and TVA territory with strong incentive programs.',
    tier: 'primary',
  },
  michigan: {
    name: 'Michigan', abbr: 'MI', country: 'US',
    iso: 'MISO', isoFull: 'Midcontinent ISO',
    headline: 'THE GREAT LAKES ADVANTAGE',
    subheadline: 'Abundant freshwater cooling, competitive power rates, and a growing hyperscaler footprint in West Michigan.',
    tier: 'emerging',
  },
  arizona: {
    name: 'Arizona', abbr: 'AZ', country: 'US',
    iso: 'WECC', isoFull: 'Western Electricity Coordinating Council',
    headline: 'PHOENIX: THE WESTERN EXPANSION HUB',
    subheadline: 'Low land costs, tax incentives, and APS/SRP utility infrastructure driving rapid Western US expansion.',
    tier: 'emerging',
  },
  ohio: {
    name: 'Ohio', abbr: 'OH', country: 'US',
    iso: 'PJM', isoFull: 'PJM Interconnection',
    headline: 'THE MIDWEST INFRASTRUCTURE CORRIDOR',
    subheadline: 'Columbus and central Ohio emerging as the next major data center cluster. Strong PJM grid access.',
    tier: 'emerging',
  },
  illinois: {
    name: 'Illinois', abbr: 'IL', country: 'US',
    iso: 'PJM', isoFull: 'PJM Interconnection',
    headline: 'CHICAGO: THE NETWORK CROSSROADS',
    subheadline: 'Chicago is one of the densest network peering hubs in North America. Critical for latency-sensitive deployments.',
    tier: 'primary',
  },
  oregon: {
    name: 'Oregon', abbr: 'OR', country: 'US',
    iso: 'WECC', isoFull: 'Western Electricity Coordinating Council',
    headline: 'COLUMBIA RIVER HYDRO POWER',
    subheadline: 'Affordable hydro power and a long history of hyperscaler investment along the Columbia River corridor.',
    tier: 'primary',
  },
  washington: {
    name: 'Washington', abbr: 'WA', country: 'US',
    iso: 'WECC', isoFull: 'Western Electricity Coordinating Council',
    headline: 'THE PACIFIC NORTHWEST POWER CORRIDOR',
    subheadline: 'BPA hydro power, Microsoft\'s home market, and a dense fiber spine along I-90 and I-5.',
    tier: 'primary',
  },
  ontario: {
    name: 'Ontario', abbr: 'ON', country: 'CA',
    iso: 'IESO', isoFull: 'Independent Electricity System Operator',
    headline: 'CANADA\'S DATA CENTER GATEWAY',
    subheadline: 'Toronto and the Golden Horseshoe are Canada\'s leading digital infrastructure markets with strong grid access.',
    tier: 'primary',
  },
  quebec: {
    name: 'Quebec', abbr: 'QC', country: 'CA',
    iso: 'HQ', isoFull: 'Hydro-Québec',
    headline: 'LOW-CARBON HYDRO POWER AT SCALE',
    subheadline: 'Hydro-Québec offers some of the cheapest and cleanest power in North America. New large-DC rate (~13¢/kWh) launches H2 2026 — re-opening the door for AI infrastructure.',
    tier: 'emerging',
  },
  alberta: {
    name: 'Alberta', abbr: 'AB', country: 'CA',
    iso: 'AESO', isoFull: 'Alberta Electric System Operator',
    headline: 'BEHIND-THE-METER GAS + DEREGULATED MARKET',
    subheadline: 'The only Canadian market where you can credibly co-locate generation with load. 30+ AI DC projects in the AESO queue. Calgary metro is the gravity center.',
    tier: 'emerging',
  },
  'british-columbia': {
    name: 'British Columbia', abbr: 'BC', country: 'CA',
    iso: 'BCH', isoFull: 'BC Hydro',
    headline: 'CONSTRAINED, BUT SITE C IS FRESH MW',
    subheadline: 'BC limits new DC interconnections in 2026 to 300 MW for AI and 100 MW general — but Site C just came online and First Nations partnerships are unlocking the bulk of viable opportunities.',
    tier: 'developing',
  },
  saskatchewan: {
    name: 'Saskatchewan', abbr: 'SK', country: 'CA',
    iso: 'SaskPower', isoFull: 'SaskPower',
    headline: 'TELECOM HUB + EMERGING AI CAMPUSES',
    subheadline: 'Regina and Saskatoon host provincial telecom DCs; Bell\'s 300 MW Saskatchewan AI campus and George Gordon FN partnership signal the next wave.',
    tier: 'developing',
  },
  manitoba: {
    name: 'Manitoba', abbr: 'MB', country: 'CA',
    iso: 'Manitoba Hydro', isoFull: 'Manitoba Hydro',
    headline: 'WINNIPEG CONVERSION PLAY',
    subheadline: 'Bell\'s Winnipeg food-plant-to-AI conversion and Cerebras\' announced Manitoba campus put Winnipeg on the sovereign compute map.',
    tier: 'developing',
  },
  'nova-scotia': {
    name: 'Nova Scotia', abbr: 'NS', country: 'CA',
    iso: 'NS Power', isoFull: 'Nova Scotia Power',
    headline: 'ATLANTIC CONNECTIVITY',
    subheadline: 'Halifax anchors Atlantic telecom and colocation — smaller scale but strategic for east-coast latency.',
    tier: 'developing',
  },
  'new-brunswick': {
    name: 'New Brunswick', abbr: 'NB', country: 'CA',
    iso: 'NB Power', isoFull: 'NB Power',
    headline: 'MONCTON / SAINT JOHN CORRIDOR',
    subheadline: 'Equinix SJ1 and Bell Moncton provide regional peering and enterprise colocation.',
    tier: 'developing',
  },
  newfoundland: {
    name: 'Newfoundland and Labrador', abbr: 'NL', country: 'CA',
    iso: 'NL Hydro', isoFull: 'Newfoundland and Labrador Hydro',
    headline: 'ST. JOHN\'S TELECOM NODE',
    subheadline: 'Limited colo footprint; primarily telecom and enterprise DC capacity.',
    tier: 'developing',
  },
  'prince-edward-island': {
    name: 'Prince Edward Island', abbr: 'PE', country: 'CA',
    iso: 'Maritime Electric', isoFull: 'Maritime Electric',
    headline: 'ISLAND TELECOM DC',
    subheadline: 'Single provincial telecom hub — niche edge use cases only.',
    tier: 'developing',
  },
  'northwest-territories': {
    name: 'Northwest Territories', abbr: 'NT', country: 'CA',
    iso: 'NTPC', isoFull: 'Northwest Territories Power Corporation',
    headline: 'ARCTIC EDGE TELECOM',
    subheadline: 'Yellowknife Northwestel hub — cooling advantage, limited MW.',
    tier: 'developing',
  },
  yukon: {
    name: 'Yukon', abbr: 'YT', country: 'CA',
    iso: 'Yukon Energy', isoFull: 'Yukon Energy',
    headline: 'NORTHERN TELECOM',
    subheadline: 'No major colo/hyperscale footprint tracked yet.',
    tier: 'developing',
  },
  nunavut: {
    name: 'Nunavut', abbr: 'NU', country: 'CA',
    iso: 'Qulliq Energy', isoFull: 'Qulliq Energy Corporation',
    headline: 'NO MAJOR DC INVENTORY',
    subheadline: 'Honest zero — monitor for Arctic edge / sovereign compute pilots.',
    tier: 'developing',
  },
  queretaro: {
    name: 'Querétaro', abbr: 'QRO', country: 'MX',
    iso: 'CENACE', isoFull: 'Centro Nacional de Control de Energía',
    headline: 'MEXICO\'S SILICON VALLEY',
    subheadline: 'Nearshore manufacturing, strong fiber spine, and a growing hyperscaler presence driven by nearshoring demand.',
    tier: 'emerging',
  },
}

// ── Static params ─────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  return Object.keys(MARKETS).map((state) => ({ state }))
}

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params
  const market = MARKETS[state]
  if (!market) return {}
  return {
    title: `${market.name} Data Center Market | Konative`,
    description: `Data center availability intelligence for ${market.name}. Projects, power pipeline, network infrastructure, and market activity — updated automatically.`,
    openGraph: {
      title: `${market.name} Data Center Market Intelligence`,
      description: market.subheadline,
    },
  }
}

// ── Data fetchers ─────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const sanity = createSanity({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

async function getMarketData(abbr: string, name: string) {
  const [projects, facilities, network, power, news] = await Promise.allSettled([
    // DC projects from Sanity
    sanity.fetch(`*[_type == "dataCenterProject" && country == "CA" && (provinceCode == $abbr || state == $name || state == $abbr)] | order(capacityMw desc) {
      _id, name, operator, city, state, provinceCode, status, capacityMw, source, blockReason
    }[0...50]`, { abbr, name }),

    // IM3 facilities
    supabase.from('dc_facilities').select('id,name,operator,city,state,status,capacity_mw,facility_type')
      .ilike('state', `%${abbr}%`).limit(50),

    // PeeringDB network nodes
    supabase.from('network_facilities').select('pdb_id,name,org_name,city,state,net_count,ix_count')
      .ilike('state', `%${abbr}%`).limit(30),

    // EIA planned generation
    supabase.from('generation_pipeline').select('plant_id,plant_name,utility_name,county,technology,capacity_mw,planned_year')
      .eq('state', abbr).gte('planned_year', new Date().getFullYear())
      .order('capacity_mw', { ascending: false }).limit(20),

    // Recent news from Sanity
    sanity.fetch(`*[_type == "article" && ($abbr in states || $name in states || $abbr in body[].children[].text || $name in body[].children[].text)] | order(publishedAt desc) {
      _id, title, publishedAt, sourceUrl, source
    }[0...5]`, { abbr, name }).catch(() => []),
  ])

  return {
    projects: projects.status === 'fulfilled' ? (projects.value as unknown[]) ?? [] : [],
    facilities: facilities.status === 'fulfilled' ? (facilities.value.data ?? []) : [],
    network: network.status === 'fulfilled' ? (network.value.data ?? []) : [],
    power: power.status === 'fulfilled' ? (power.value.data ?? []) : [],
    news: news.status === 'fulfilled' ? (news.value as unknown[]) ?? [] : [],
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Project = { _id: string; name: string; operator?: string; city?: string; state?: string; status: string; capacityMw?: number; source: string }
type Facility = { id: number; name: string; operator?: string; city?: string; state?: string; status?: string; capacity_mw?: number; facility_type?: string }
type NetworkNode = { pdb_id: number; name: string; org_name?: string; city?: string; state?: string; net_count: number; ix_count: number }
type PowerPlant = { plant_id: string; plant_name: string; utility_name?: string; county?: string; technology?: string; capacity_mw?: number; planned_year?: number }
type NewsItem = { _id: string; title: string; publishedAt?: string; sourceUrl?: string; source?: string }

// ── Status helpers ────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  operational: '#22d3ee', construction: '#E07B39', announced: '#a78bfa',
  stalled: '#f59e0b', blocked: '#ef4444', paused: '#fb923c', canceled: '#64748b',
}
const TIER_LABELS = { primary: 'PRIMARY MARKET', emerging: 'EMERGING MARKET', developing: 'DEVELOPING MARKET' }
const TIER_COLORS = { primary: '#E07B39', emerging: '#a78bfa', developing: '#4ade80' }

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function MarketPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params
  const market = MARKETS[state]
  if (!market) notFound()

  const data = await getMarketData(market.abbr, market.name)

  const totalMw = (data.projects as Project[]).reduce((s, p) => s + (p.capacityMw ?? 0), 0)
    + (data.power as PowerPlant[]).reduce((s, p) => s + (p.capacity_mw ?? 0), 0)
  const operationalCount = (data.projects as Project[]).filter(p => p.status === 'operational').length
  const constructionCount = (data.projects as Project[]).filter(p => p.status === 'construction').length
  const announcedCount = (data.projects as Project[]).filter(p => p.status === 'announced').length

  return (
    <div style={{ background: '#08142D', minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>

      {/* Hero */}
      <div style={{ paddingTop: 96, paddingBottom: 48, paddingLeft: 48, paddingRight: 48, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <Link href="/map" style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              ← Map
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
            <Link href="/markets" style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Markets
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>/</span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#E07B39', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {market.name}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              color: TIER_COLORS[market.tier],
              border: `1px solid ${TIER_COLORS[market.tier]}`,
              padding: '3px 8px',
            }}>
              {TIER_LABELS[market.tier]}
            </span>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              {market.iso} · {market.country === 'US' ? 'United States' : market.country === 'CA' ? 'Canada' : 'Mexico'}
            </span>
          </div>

          <h1 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 0.93,
            textTransform: 'uppercase', color: '#fff', margin: '0 0 16px',
          }}>
            {market.name}<br />
            <span style={{ color: '#E07B39' }}>{market.headline}</span>
          </h1>
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, lineHeight: 1.6, color: 'rgba(255,255,255,0.45)', maxWidth: 580, margin: 0 }}>
            {market.subheadline}
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 48px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', flexWrap: 'wrap' }}>
          {[
            { label: 'DC Projects', value: data.projects.length },
            { label: 'Operational', value: operationalCount, color: STATUS_COLORS.operational },
            { label: 'Under Construction', value: constructionCount, color: STATUS_COLORS.construction },
            { label: 'Announced', value: announcedCount, color: STATUS_COLORS.announced },
            { label: 'IM3 Facilities', value: data.facilities.length },
            { label: 'Network Nodes', value: data.network.length },
            { label: 'Planned Gen (MW)', value: totalMw > 0 ? `${(totalMw / 1000).toFixed(1)}+ GW` : '—' },
          ].map(stat => (
            <div key={stat.label} style={{
              padding: '20px 24px', borderRight: '1px solid rgba(255,255,255,0.07)',
              minWidth: 120,
            }}>
              <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 28, color: stat.color ?? '#fff', lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '48px 48px 80px', display: 'grid', gridTemplateColumns: '1fr 360px', gap: 48, alignItems: 'start' }}>

        {/* Left col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>

          {/* DC Projects */}
          <Section title="DC Projects" count={data.projects.length} source="OSM · Wikidata · News">
            {data.projects.length === 0 ? (
              <EmptyState msg="No projects indexed for this market yet." />
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Name', 'Operator', 'City', 'Status', 'MW'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.projects as Project[]).slice(0, 15).map(p => (
                    <tr key={p._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={tdStyle}><span style={{ color: '#fff', fontWeight: 500 }}>{p.name}</span></td>
                      <td style={tdStyle}>{p.operator ?? '—'}</td>
                      <td style={tdStyle}>{p.city ?? '—'}</td>
                      <td style={tdStyle}>
                        <span style={{ color: STATUS_COLORS[p.status] ?? '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.status}</span>
                      </td>
                      <td style={tdStyle}>{p.capacityMw ? `${p.capacityMw} MW` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Section>

          {/* Planned Power */}
          {data.power.length > 0 && (
            <Section title="Planned Generation Pipeline" count={data.power.length} source="EIA-860M">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                    {['Plant', 'Technology', 'County', 'MW', 'Est. Year'].map(h => (
                      <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(data.power as PowerPlant[]).map(p => (
                    <tr key={p.plant_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={tdStyle}><span style={{ color: '#fff', fontWeight: 500 }}>{p.plant_name}</span></td>
                      <td style={tdStyle}>{p.technology ?? '—'}</td>
                      <td style={tdStyle}>{p.county ?? '—'}</td>
                      <td style={tdStyle}><span style={{ color: '#eab308', fontWeight: 600 }}>{p.capacity_mw ? `${p.capacity_mw} MW` : '—'}</span></td>
                      <td style={tdStyle}>{p.planned_year ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Network */}
          {data.network.length > 0 && (
            <Section title="Network & Colocation" count={data.network.length} source="PeeringDB">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                {(data.network as NetworkNode[]).map(n => (
                  <div key={n.pdb_id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '12px 14px' }}>
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{n.name}</div>
                    {n.org_name && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>{n.org_name}</div>}
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#a855f7' }}>{n.net_count} networks</span>
                      {n.ix_count > 0 && <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{n.ix_count} IXPs</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Grid info */}
          <SideCard title="Grid & Power">
            <Row label="ISO / RTO" value={market.iso} />
            <Row label="Full Name" value={market.isoFull} />
            <Row label="Power Layer" value={data.power.length > 0 ? `${data.power.length} planned plants` : 'EIA data pending'} />
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <Link href="/map" style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: '#E07B39', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                View on Map →
              </Link>
            </div>
          </SideCard>

          {/* IM3 facilities */}
          {data.facilities.length > 0 && (
            <SideCard title={`IM3 Verified Facilities (${data.facilities.length})`}>
              {(data.facilities as Facility[]).slice(0, 8).map(f => (
                <div key={f.id} style={{ paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#fff', fontWeight: 500 }}>{f.name}</div>
                  {f.operator && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{f.operator}</div>}
                  {f.city && <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>{f.city}</div>}
                </div>
              ))}
            </SideCard>
          )}

          {/* Recent news */}
          {data.news.length > 0 && (
            <SideCard title="Recent News">
              {(data.news as NewsItem[]).map(n => (
                <div key={n._id} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <a href={n.sourceUrl ?? '#'} target="_blank" rel="noopener noreferrer"
                    style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.75)', textDecoration: 'none', lineHeight: 1.4, display: 'block' }}>
                    {n.title}
                  </a>
                  {n.publishedAt && (
                    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 3 }}>
                      {new Date(n.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  )}
                </div>
              ))}
            </SideCard>
          )}

          {/* CTA */}
          <div style={{ background: 'rgba(224,123,57,0.1)', border: '1px solid rgba(224,123,57,0.3)', padding: '20px 20px' }}>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 18, textTransform: 'uppercase', color: '#fff', marginBottom: 8 }}>
              Have Land in {market.name}?
            </div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: '0 0 14px' }}>
              We connect landowners and developers with data center operators actively seeking sites in this market.
            </p>
            <Link href="/land/submit" style={{
              display: 'inline-block', padding: '8px 16px',
              background: '#E07B39', color: '#fff',
              fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 10,
              textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none',
            }}>
              Submit Your Land →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  fontFamily: 'Inter, sans-serif',
  fontSize: 12,
  color: 'rgba(255,255,255,0.55)',
  verticalAlign: 'top',
}

function Section({ title, count, source, children }: { title: string; count: number; source: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 12 }}>
        <h2 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 20, textTransform: 'uppercase', color: '#fff', margin: 0 }}>{title}</h2>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>({count})</span>
        <span style={{ marginLeft: 'auto', fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{source}</span>
      </div>
      {children}
    </div>
  )
}

function SideCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '16px 18px' }}>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 12 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#fff', fontWeight: 500, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div style={{ padding: '24px 0', fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>{msg}</div>
  )
}
