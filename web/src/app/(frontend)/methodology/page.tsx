import type { Metadata } from 'next'
import Link from 'next/link'

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Methodology — How We Score Sites | Konative',
  description: 'Konative\'s Availability Score evaluates data center sites across six infrastructure dimensions: power, water, fiber, land, permitting, and momentum. Our scoring rubric is public.',
}

const DIMENSIONS = [
  {
    label: 'Power',
    weight: 35,
    color: '#f59e0b',
    icon: '⚡',
    summary: 'Distance to the nearest high-voltage transmission line and proximity to active interconnect queues.',
    bands: [
      { range: '< 10 km from transmission', score: 35 },
      { range: '10–25 km from transmission', score: 20 },
      { range: '> 25 km from transmission', score: 5 },
    ],
    sources: 'EIA-860M (2,317 planned generators), state PUCs, ISO interconnection queues',
    rationale: 'Power is the gating constraint for every modern data center. A site that is more than 25 km from existing transmission carries 18–36 months of additional substation and line work before energization. Sites near operational generation with available interconnect capacity can move from LOI to dirt in under 12 months.',
  },
  {
    label: 'Water',
    weight: 20,
    color: '#3b82f6',
    icon: '💧',
    summary: 'Proximity to USGS streamflow and groundwater monitoring sites with active permits.',
    bands: [
      { range: '< 5 km to monitored water source', score: 20 },
      { range: '5–25 km', score: 14 },
      { range: '25–50 km', score: 8 },
      { range: '> 50 km', score: 2 },
    ],
    sources: 'USGS NWIS (1,414 active monitoring sites), state water rights records, EPA ECHO',
    rationale: 'Cooling water requirements vary by climate and design (air-cooled vs. evaporative vs. liquid loop), but all hyperscaler tenants underwrite to redundant water access. Monitored water sources are also a proxy for permittable supply — unmonitored aquifers and surface water carry far higher diligence cost.',
  },
  {
    label: 'Fiber',
    weight: 15,
    color: '#8b5cf6',
    icon: '🔗',
    summary: 'Distance to the nearest network exchange or carrier hotel.',
    bands: [
      { range: '< 5 km to network facility', score: 15 },
      { range: '5–20 km', score: 10 },
      { range: '> 20 km', score: 3 },
    ],
    sources: 'PeeringDB exchange points, carrier route maps',
    rationale: 'Latency tolerance varies by workload — AI training is more forgiving than financial services or content delivery — but every site needs at least two diverse fiber paths. Sites within 5 km of a peering exchange typically have multiple existing routes; rural sites often need 6–18 months of carrier negotiation.',
  },
  {
    label: 'Land',
    weight: 10,
    color: '#22c55e',
    icon: '🏞️',
    summary: 'Parcel size, topography, zoning, and ownership clarity.',
    bands: [
      { range: 'Confirmed clean title, > 100 acres, flat, light industrial zoning', score: 10 },
      { range: 'Workable title, 50–100 acres, mixed conditions', score: 6 },
      { range: 'Title issues, < 50 acres, or zoning conflict', score: 2 },
    ],
    sources: 'County assessor records, Konative landholder direct-source intake',
    rationale: 'Most public data center site lists ignore land entirely — they assume any 50-acre parcel will do. In practice, title encumbrances, easements, mineral rights, FAA height restrictions, and adjacent land use account for roughly 40% of LOI-to-PSA failures. Konative diligences this layer before the first conversation with a buyer.',
  },
  {
    label: 'Permitting',
    weight: 8,
    color: '#06b6d4',
    icon: '📋',
    summary: 'Local permitting velocity, host community attitudes, and regulatory risk.',
    bands: [
      { range: 'County with active DC permits issued in last 24 months', score: 8 },
      { range: 'County with industrial permits but no DC precedent', score: 5 },
      { range: 'Restrictive jurisdiction or active opposition', score: 2 },
    ],
    sources: 'County records, AG decisions, public comment trackers',
    rationale: 'A site\'s legal feasibility is a function of the political and regulatory environment around it. Loudoun County (VA), Maricopa County (AZ), and Henrico County (VA) have permitted hundreds of MW. Other counties — even adjacent ones — have moratoriums or hostile zoning boards. The same dirt scores radically differently across a county line.',
  },
  {
    label: 'Momentum',
    weight: 8,
    color: '#ec4899',
    icon: '📈',
    summary: 'Active build pipeline in the same market — a leading indicator that capital, contractors, and supply chain are flowing.',
    bands: [
      { range: '> 1 GW active development within 100 km', score: 8 },
      { range: '100 MW – 1 GW active development', score: 5 },
      { range: '< 100 MW active development', score: 3 },
    ],
    sources: 'Public DC announcements, EIA-860M planned generator pipeline, news ingestion',
    rationale: 'Momentum is a forward-looking signal. Markets with active hyperscaler builds attract follow-on capital, supply chain depth, skilled labor, and interconnect priority. A site in a market with one active 500 MW build is materially easier to close than the same site in a market with no recent activity.',
  },
]

export default function MethodologyPage() {
  const totalWeight = DIMENSIONS.reduce((sum, d) => sum + d.weight, 0)

  return (
    <div style={{ background: '#0b1020', minHeight: '100vh', color: '#f6f7fb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '4rem 2rem 3rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C8001F', marginBottom: '0.75rem' }}>
            Methodology
          </p>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5vw, 3.5rem)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, margin: '0 0 1rem', letterSpacing: '-0.01em', lineHeight: 1.05 }}>
            HOW WE SCORE A DATA CENTER SITE
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 640, lineHeight: 1.65, margin: 0, fontSize: '1.0625rem' }}>
            Most brokers say a site is &quot;good&quot; or &quot;close to power.&quot; We publish the rubric. Every facility on our platform gets scored against the same six dimensions, weighted 96 points total, sourced from public infrastructure data we maintain ourselves.
          </p>
        </div>
      </div>

      {/* Score breakdown summary */}
      <div style={{ padding: '3rem 2rem 1rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#64748b', margin: '0 0 1rem', fontWeight: 600 }}>
            The Konative Availability Score™ — {totalWeight} points
          </h2>

          <div style={{ background: '#0f1728', border: '1px solid #1e293b', borderRadius: 8, padding: '1.25rem', marginBottom: '3rem' }}>
            {DIMENSIONS.map(d => {
              const pct = (d.weight / totalWeight) * 100
              return (
                <div key={d.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 60px', alignItems: 'center', gap: '1rem', padding: '0.6rem 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ fontSize: '0.875rem', color: d.color, fontWeight: 600 }}>{d.icon} {d.label}</span>
                  <div style={{ background: '#1e293b', height: 8, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: d.color, borderRadius: 4 }} />
                  </div>
                  <span style={{ textAlign: 'right', fontSize: '0.875rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{d.weight} pts</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Per-dimension detail */}
      <div style={{ padding: '0 2rem 4rem' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          {DIMENSIONS.map(d => (
            <div key={d.label} style={{ marginBottom: '3.5rem', borderTop: `2px solid ${d.color}33`, paddingTop: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem' }}>{d.icon}</span>
                <h3 style={{ fontSize: '1.5rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, margin: 0, letterSpacing: '0.02em', color: d.color }}>
                  {d.label.toUpperCase()}
                </h3>
                <span style={{ fontSize: '0.875rem', color: '#64748b', marginLeft: 'auto' }}>{d.weight} of {totalWeight} points</span>
              </div>
              <p style={{ color: '#cbd5e1', margin: '0 0 1rem', fontSize: '1rem', lineHeight: 1.65 }}>{d.summary}</p>
              <p style={{ color: '#94a3b8', margin: '0 0 1.25rem', fontSize: '0.9375rem', lineHeight: 1.7 }}>{d.rationale}</p>

              <div style={{ background: '#0f1728', border: '1px solid #1e293b', borderRadius: 8, padding: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', marginBottom: '0.6rem' }}>Score bands</div>
                {d.bands.map((b) => (
                  <div key={b.range} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.35rem 0', fontSize: '0.875rem', borderBottom: '1px solid #1e293b' }}>
                    <span style={{ color: '#cbd5e1' }}>{b.range}</span>
                    <span style={{ fontWeight: 600, color: d.color, fontVariantNumeric: 'tabular-nums' }}>{b.score} pts</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#475569', margin: 0 }}>
                <strong style={{ color: '#64748b' }}>Sources:</strong> {d.sources}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: '#0f1728', borderTop: '1px solid #1e293b', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.01em' }}>
            BRING US A SITE. WE&apos;LL SCORE IT.
          </h2>
          <p style={{ color: '#94a3b8', margin: '0 0 1.5rem', lineHeight: 1.65 }}>
            Every site we evaluate runs through this rubric before we put it in front of a buyer. The score isn&apos;t the deal — but it tells you in 60 seconds whether the deal is worth chasing.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/assessment" style={{ background: '#C8001F', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Run the T4 Site Evaluator →
            </Link>
            <Link href="/projects" style={{ background: '#1E4FBF', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
              Browse Scored Facilities →
            </Link>
            <Link href="/contact" style={{ background: 'transparent', color: '#f6f7fb', padding: '0.75rem 1.5rem', borderRadius: 6, textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem', border: '1px solid #334155' }}>
              Submit a Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
