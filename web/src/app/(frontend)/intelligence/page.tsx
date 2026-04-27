import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Intelligence — Konative',
  description: 'Konative\'s public intelligence: Gulf capital tracker, Canada market deep-dive, site scoring methodology, and the weekly newsletter.',
}

const SECTIONS = [
  {
    href: '/canada',
    label: 'Canada Market Deep Dive',
    eyebrow: 'Market Intelligence',
    headline: 'Canada\'s 10 GW pipeline, four different markets',
    summary: 'Quebec, Ontario, Alberta, British Columbia — each operates under a structurally different power regime. Plus the C$2B federal Sovereign AI Compute Strategy and the First Nations land + power vector that will determine who clears the queue.',
    accent: '#3b82f6',
  },
  {
    href: '/intelligence/saudi',
    label: 'Gulf Capital Tracker',
    eyebrow: 'Capital Flows',
    headline: '~$80B flowing from the Gulf into NA AI infrastructure',
    summary: 'HUMAIN (PIF), MGX/Mubadala, G42, DataVolt — what they\'re building, where, with whom. Updated weekly. The MGX/AIP/GIP × Aligned Data Centers acquisition alone is $40B.',
    accent: '#E07B39',
  },
  {
    href: '/intelligence/first-nations',
    label: 'First Nations + Tribal DC',
    eyebrow: 'Indigenous Land + Power',
    headline: 'Indigenous land, Indigenous power, Indigenous equity',
    summary: 'Cross-border intelligence on Indigenous-led DC development. Woodland Cree 650 MW, Prophet River, Innava Albuquerque, plus the federal frameworks (C$2B Sovereign AI, US$50M DOE, US$20B LPO) that make sovereign-equity deals viable.',
    accent: '#facc15',
  },
  {
    href: '/methodology',
    label: 'Site Scoring Methodology',
    eyebrow: 'How We Work',
    headline: 'Six dimensions, 96 points, no black box',
    summary: 'Power 35 / Water 20 / Fiber 15 / Land 10 / Permitting 8 / Momentum 8. Score bands, sources, and rationale for every dimension. Apply this rubric to any site we evaluate.',
    accent: '#22c55e',
  },
  {
    href: '/news',
    label: 'Live Market Intel Feed',
    eyebrow: 'News + Analysis',
    headline: 'Filtered DC market intelligence, updated daily',
    summary: 'Curated from open sources. Filter by country, topic, content type. The raw signal beneath the weekly newsletter.',
    accent: '#a78bfa',
  },
]

export default function IntelligenceIndexPage() {
  return (
    <div style={{ background: '#0b1020', minHeight: '100vh', color: '#f6f7fb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero */}
      <section style={{ padding: '4rem 2rem 3rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#E07B39', marginBottom: '0.75rem' }}>
            Intelligence
          </p>
          <h1 style={{ fontSize: 'clamp(2.25rem, 5.5vw, 3.5rem)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, margin: '0 0 1rem', letterSpacing: '-0.01em', lineHeight: 1.05 }}>
            WHAT WE PUBLISH, AND WHY
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 720, lineHeight: 1.65, margin: 0, fontSize: '1.0625rem' }}>
            Konative tracks three high-signal markets: Gulf sovereign capital flowing into North American AI infrastructure, First Nations and Indigenous Development Corp land + power, and the modular DC build methodology that&apos;s the only viable path to absorbing 15+ GW per year. Everything below is public. The thesis is that credibility isn&apos;t a deck — it&apos;s a methodology, a tracker, and a record.
          </p>
        </div>
      </section>

      {/* Featured Tool — T4 Site Evaluator */}
      <section style={{ padding: '3rem 2rem 1rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #083344 0%, #0e7490 35%, #06b6d4 100%)',
            borderRadius: 12,
            padding: '2.5rem 2.5rem',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 20px 60px -20px rgba(6, 182, 212, 0.4)',
          }}>
            {/* Decorative grid lines */}
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(0deg, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '2rem', alignItems: 'center' }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.875rem', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: '#0b1020',
                    background: '#67e8f9',
                    padding: '4px 10px',
                    borderRadius: 3,
                    fontWeight: 800,
                  }}>
                    Free Tool
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: '#a5f3fc',
                    fontWeight: 600,
                  }}>
                    Powered by Tier IV DevCo
                  </span>
                </div>

                <h2 style={{
                  fontSize: 'clamp(1.875rem, 4.5vw, 2.75rem)',
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 800,
                  margin: '0 0 0.75rem',
                  letterSpacing: '-0.01em',
                  lineHeight: 1.05,
                  color: '#fff',
                  textTransform: 'uppercase',
                }}>
                  T4 INFRASTRUCTURE<br />SITE EVALUATOR
                </h2>

                <p style={{
                  color: '#cffafe',
                  margin: '0 0 1.25rem',
                  fontSize: '1.0625rem',
                  lineHeight: 1.6,
                  maxWidth: 560,
                }}>
                  Score any parcel in under 10 minutes across power, fiber, site characteristics, development readiness, and market positioning. Get a sharable readiness report you can put in front of buyers, lenders, or partners.
                </p>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.25rem' }}>
                  {['Power', 'Fiber', 'Site', 'Readiness', 'Market'].map((p) => (
                    <span key={p} style={{
                      fontSize: '0.7rem',
                      color: '#0b1020',
                      background: 'rgba(255,255,255,0.92)',
                      padding: '4px 10px',
                      borderRadius: 100,
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                    }}>
                      {p}
                    </span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link href="/assessment" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: '#fff',
                    color: '#083344',
                    padding: '0.875rem 1.75rem',
                    borderRadius: 6,
                    textDecoration: 'none',
                    fontWeight: 800,
                    fontSize: '0.9375rem',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}>
                    Launch Site Evaluator →
                  </Link>
                  <span style={{ fontSize: '0.8rem', color: '#a5f3fc' }}>
                    No account required · ~10 min
                  </span>
                </div>
              </div>

              {/* Big icon / visual anchor */}
              <div style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontSize: 'clamp(4rem, 10vw, 7rem)',
                fontWeight: 900,
                color: 'rgba(255,255,255,0.18)',
                letterSpacing: '-0.04em',
                lineHeight: 0.9,
                whiteSpace: 'nowrap',
                userSelect: 'none',
              }}>
                T4
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section header */}
      <div style={{ maxWidth: 960, margin: '2rem auto 0', padding: '0 2rem' }}>
        <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748b', margin: 0, fontWeight: 600 }}>
          Research + Trackers
        </p>
      </div>

      {/* Sections */}
      <section style={{ padding: '1rem 2rem 3rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gap: '1rem' }}>
          {SECTIONS.map(s => (
            <Link key={s.href} href={s.href} style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: '#0f1728', border: '1px solid #1e293b', borderLeft: `3px solid ${s.accent}`, borderRadius: 8, padding: '1.5rem 1.75rem', transition: 'border-color 0.15s' }}>
              <p style={{ fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: s.accent, margin: '0 0 0.5rem', fontWeight: 600 }}>
                {s.eyebrow}
              </p>
              <h2 style={{ fontSize: '1.5rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, margin: '0 0 0.75rem', letterSpacing: '-0.005em', color: '#f6f7fb' }}>
                {s.headline}
              </h2>
              <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem', lineHeight: 1.65 }}>{s.summary}</p>
              <p style={{ color: s.accent, margin: '0.75rem 0 0', fontSize: '0.8rem', fontWeight: 600 }}>
                {s.label} →
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #08142D 0%, #0C2046 100%)', borderTop: '1px solid #1e293b', padding: '3rem 2rem' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.75rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.01em' }}>
            ONE SHORT EMAIL EACH WEEK. NO FILLER.
          </h2>
          <p style={{ color: '#cbd5e1', margin: '0 0 1.5rem', lineHeight: 1.65 }}>
            Konative&apos;s weekly intelligence digest covers what moved in the markets we cover: site selection, capital flows, regulatory shifts, and the deals worth knowing.
          </p>
          <Link href="/news" style={{ background: '#E07B39', color: '#fff', padding: '0.875rem 1.75rem', borderRadius: 6, textDecoration: 'none', fontWeight: 700, fontSize: '0.9375rem' }}>
            Subscribe →
          </Link>
        </div>
      </section>
    </div>
  )
}
