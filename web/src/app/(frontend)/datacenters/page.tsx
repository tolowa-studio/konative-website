import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Datacenter Connectivity | Konative — Avant Trusted Advisor',
  description: 'Connectivity advisory for greenfield datacenter developers, hyperscalers, and AI compute operators. Dark fiber, DIA, colo uplinks via Avant\'s 3,000+ supplier network. Engage at site selection, not ribbon-cutting.',
  openGraph: {
    title: 'Datacenter Connectivity Intelligence | Konative',
    description: 'The connectivity intelligence brokerage for greenfield datacenters. FERC queue monitoring, early-signal engagement, Zayo/Lumen/Arelion and 200+ more.',
  },
}

const timingLaw = [
  { phase: 'Site Selection', timeline: '36–48 months pre-commissioning', note: 'Fiber route feasibility, carrier coordination, conduit pathway planning' },
  { phase: 'Design & Engineering', timeline: '24–36 months', note: 'Dark fiber permitting, IRU negotiations, carrier contracts structured' },
  { phase: 'Construction', timeline: '18–30 months', note: 'Physical build, testing, carrier provisioning' },
  { phase: 'Commissioning', timeline: '0–6 months', note: 'Most TAs engage here. Deals already locked. Too late.' },
]

const signalSources = [
  {
    icon: '⚡',
    title: 'FERC Interconnection Queue',
    desc: 'Large-load additions (100MW+) to regional ISO queues signal greenfield datacenter or AI compute buildout. We monitor MISO, PJM, CAISO, WECC, SPP, and ERCOT queues daily.',
  },
  {
    icon: '🏗',
    title: 'State PUC Large-Load Filings',
    desc: 'Utility commission applications for new large-load service in Texas, Virginia, Georgia, Arizona, Nevada, and Oregon — filed months before building permits.',
  },
  {
    icon: '🗓',
    title: 'County Building Permits',
    desc: 'Critical facility and electrical substation upgrade permits. We monitor active datacenter development markets in real time.',
  },
  {
    icon: '👥',
    title: 'LinkedIn Job Signals',
    desc: 'Critical Facilities Manager, Data Center Network Architect postings at companies with no existing DC footprint in a region = early-stage build.',
  },
  {
    icon: '📰',
    title: 'Trade Press Intelligence',
    desc: 'Data Center Dynamics, Data Center Knowledge, The Registry, and local business journals. We track announcements before they\'re press releases.',
  },
  {
    icon: '🏕',
    title: 'Tribal Energy Authority Filings',
    desc: 'Tribal land + large power request = sovereign datacenter opportunity with compressed permitting timelines (3–10 year reduction via tribal sovereignty).',
  },
]

const suppliers = [
  { name: 'Zayo', category: 'Dark Fiber / Wavelengths' },
  { name: 'Lumen', category: 'Dark Fiber / IP Transit' },
  { name: 'Arelion', category: 'Long-Haul / IP Transit' },
  { name: 'Uniti', category: 'Regional Dark Fiber' },
  { name: 'FiberLight', category: 'Metro Dark Fiber' },
  { name: 'Crown Castle', category: 'Metro Fiber / Small Cell' },
  { name: 'Cogent', category: 'IP Transit / Wavelengths' },
  { name: 'Equinix', category: 'Colocation / Interconnection' },
  { name: '+ 200 more', category: 'via Avant\'s 3,000+ supplier network', highlight: true },
]

export default function DatacentersPage() {
  return (
    <main style={{ background: '#08142D', minHeight: '100vh', color: '#fff' }}>

      {/* Hero */}
      <section style={{
        maxWidth: 1320, margin: '0 auto', padding: '140px 48px 100px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <p style={{
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'Inter, sans-serif', fontWeight: 600,
          fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#E07B39', marginBottom: 32,
        }}>
          <span style={{ display: 'block', width: 36, height: 1, background: '#E07B39', flexShrink: 0 }} />
          Datacenter Connectivity · Avant Trusted Advisor
        </p>

        <h1 style={{
          fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
          fontSize: 'clamp(52px, 7vw, 96px)', lineHeight: 0.88,
          textTransform: 'uppercase', letterSpacing: '0.01em',
          color: '#fff', marginBottom: 32, maxWidth: 900,
        }}>
          THE RIGHT FIBER<br />
          <span style={{ color: '#E07B39' }}>BEFORE THE</span><br />
          CONCRETE POURS.
        </h1>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 18, lineHeight: 1.75,
          color: 'rgba(255,255,255,0.6)', maxWidth: 680, marginBottom: 48,
        }}>
          Connectivity for greenfield datacenters is designed 18–36 months before commissioning. We track FERC interconnection filings, large-load utility applications, and site permits — and we&apos;re in the room at site selection. By ribbon-cutting, you&apos;re too late.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <Link href="https://cal.com/jeramey-james" target="_blank" rel="noopener" style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: '#E07B39', color: '#fff',
            padding: '18px 44px', textDecoration: 'none', display: 'inline-block',
          }}>
            Get a Site Connectivity Analysis →
          </Link>
          <Link href="/intelligence" style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 500,
            fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
            background: 'transparent', color: 'rgba(255,255,255,0.7)',
            padding: '17px 32px', border: '1px solid rgba(255,255,255,0.25)',
            textDecoration: 'none', display: 'inline-block',
          }}>
            View Intelligence Hub →
          </Link>
        </div>
      </section>

      {/* Timing Law */}
      <section style={{ background: '#0C2046', padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#E07B39', marginBottom: 20,
          }}>
            <span style={{ display: 'block', width: 28, height: 1, background: '#E07B39' }} />
            The Timing Law
          </div>

          <h2 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 0.92,
            textTransform: 'uppercase', color: '#fff', marginBottom: 16,
          }}>
            FIBER TAKES<br /><span style={{ color: '#E07B39' }}>12–24 MONTHS</span><br />TO PERMIT.
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.5)', maxWidth: 600, marginBottom: 56,
          }}>
            The window to optimize your connectivity — carrier selection, route options, contract structure — closes before your building permit is issued. Here&apos;s the real timeline.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, background: 'rgba(255,255,255,0.06)' }}>
            {timingLaw.map((phase, i) => (
              <div key={i} style={{
                background: '#0C2046', padding: '36px 28px',
                borderTop: i === 3 ? '3px solid rgba(224,123,57,0.5)' : '3px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{
                  fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                  fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: i === 3 ? '#E07B39' : '#fff', marginBottom: 8,
                }}>
                  {phase.phase}
                </div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 700,
                  fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 16,
                }}>
                  {phase.timeline}
                </div>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 13,
                  color: i === 3 ? 'rgba(224,123,57,0.7)' : 'rgba(255,255,255,0.45)',
                  lineHeight: 1.6,
                }}>
                  {phase.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Early Warning System */}
      <section style={{ padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#E07B39', marginBottom: 20,
          }}>
            <span style={{ display: 'block', width: 28, height: 1, background: '#E07B39' }} />
            The Early-Warning System
          </div>

          <h2 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 0.92,
            textTransform: 'uppercase', color: '#fff', marginBottom: 16,
          }}>
            WE SEE YOUR PROJECT<br /><span style={{ color: '#E07B39' }}>BEFORE YOU RFP.</span>
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.5)', maxWidth: 620, marginBottom: 56,
          }}>
            We monitor six signal sources that surface greenfield datacenter projects 18–36 months before commissioning. By the time you&apos;re issuing an RFP, we&apos;ve already mapped your fiber options, identified the right carriers, and know what the deal should look like.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, background: 'rgba(255,255,255,0.06)' }}>
            {signalSources.map((source, i) => (
              <div key={i} style={{
                background: '#08142D', padding: '36px 32px',
                borderTop: '2px solid rgba(224,123,57,0.2)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 16 }}>{source.icon}</div>
                <h3 style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 700,
                  fontSize: 14, color: '#fff', marginBottom: 10, lineHeight: 1.3,
                }}>
                  {source.title}
                </h3>
                <p style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 13,
                  color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
                }}>
                  {source.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supplier Depth */}
      <section style={{ background: '#0C2046', padding: '100px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#E07B39', marginBottom: 20,
          }}>
            <span style={{ display: 'block', width: 28, height: 1, background: '#E07B39' }} />
            Supplier Network via Avant
          </div>

          <h2 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 0.92,
            textTransform: 'uppercase', color: '#fff', marginBottom: 16,
          }}>
            EVERY CARRIER.<br /><span style={{ color: '#E07B39' }}>ONE ADVISOR.</span>
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.5)', maxWidth: 600, marginBottom: 56,
          }}>
            As an Avant Trusted Advisor, we access 3,000+ suppliers. For datacenter connectivity, we work the dark fiber, wavelength, DIA, and colo ecosystem — with verified post-sale performance data behind every recommendation.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {suppliers.map((supplier, i) => (
              <div key={i} style={{
                background: supplier.highlight ? 'rgba(224,123,57,0.1)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${supplier.highlight ? 'rgba(224,123,57,0.3)' : 'rgba(255,255,255,0.08)'}`,
                padding: '20px 28px', minWidth: 160,
              }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontWeight: 700,
                  fontSize: 15, color: supplier.highlight ? '#E07B39' : '#fff',
                  marginBottom: 4,
                }}>
                  {supplier.name}
                </div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 11,
                  color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em',
                }}>
                  {supplier.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 48px', maxWidth: 1320, margin: '0 auto', textAlign: 'center' }}>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 600,
          fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#E07B39', marginBottom: 24,
        }}>
          Engage at site selection. Not ribbon-cutting.
        </p>
        <h2 style={{
          fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
          fontSize: 'clamp(44px, 6vw, 88px)', lineHeight: 0.9,
          textTransform: 'uppercase', color: '#fff', marginBottom: 24,
        }}>
          TELL US YOUR SITE.<br /><span style={{ color: '#E07B39' }}>WE&apos;LL MAP THE</span><br />
          CONNECTIVITY.
        </h2>
        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 16, color: 'rgba(255,255,255,0.5)',
          maxWidth: 520, margin: '0 auto 44px', lineHeight: 1.7,
        }}>
          Share your site location and requirements. We&apos;ll produce a connectivity analysis showing fiber routes, available carriers, and estimated MRC — before you&apos;ve broken ground.
        </p>
        <Link href="https://cal.com/jeramey-james" target="_blank" rel="noopener" style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 600,
          fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase',
          background: '#E07B39', color: '#fff',
          padding: '20px 56px', textDecoration: 'none', display: 'inline-block',
        }}>
          Get a Site Connectivity Analysis →
        </Link>
      </section>

    </main>
  )
}
