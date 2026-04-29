'use client'

import Link from 'next/link'
import { useState } from 'react'

const panels = [
  {
    num: '01',
    eyebrow: 'For Landowners',
    title: 'You hold\npowered land.',
    desc: 'Near a substation, transmission corridor, or utility easement? Data center developers are paying significant premiums for well-sited land. We run the analysis, bring qualified buyers, and broker the deal — sale, ground lease, or joint venture.',
    cta: 'Submit Your Land →',
    href: '/land/submit',
    primary: true,
  },
  {
    num: '02',
    eyebrow: 'For Investors',
    title: 'You have\ncapital to deploy.',
    desc: 'Powered land, build-to-suit data centers, and operating assets across North America. We source off-market opportunities, structure the deal, and manage the transaction from LOI to close.',
    cta: 'Talk to Us About Investing →',
    href: '/invest',
    primary: false,
  },
  {
    num: '03',
    eyebrow: 'For Occupiers',
    title: 'You need\ndata center capacity.',
    desc: 'Looking for MW? Tell us your requirements — power, market, timeline, workload. We find the right site or operator, make the introduction, and represent your interests through lease or acquisition.',
    cta: 'Submit Your RFP →',
    href: '/capacity',
    primary: false,
  },
]

export default function WhoWeServe() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <section id="who-we-serve" style={{ background: '#0C2046', padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: 'Inter, sans-serif', fontWeight: 600,
          fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
          color: '#E07B39', marginBottom: 20,
        }}>
          <span style={{ display: 'block', width: 28, height: 1, background: '#E07B39' }} />
          Who We Work With
        </div>

        <h2 style={{
          fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
          fontSize: 'clamp(44px, 5.5vw, 80px)', lineHeight: 0.9,
          textTransform: 'uppercase', letterSpacing: '0.01em',
          color: '#fff', marginBottom: 60,
        }}>
          THREE DOORS.<br /><span style={{ color: '#E07B39' }}>ONE BROKERAGE.</span>
        </h2>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.08)',
        }}>
          {panels.map((panel, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: '#0C2046',
                padding: '48px 40px',
                borderTop: panel.primary
                  ? '3px solid #E07B39'
                  : hovered === i ? '3px solid rgba(255,255,255,0.3)' : '3px solid transparent',
                transition: 'border-color 0.2s',
                cursor: 'default',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: 60, color: 'rgba(255,255,255,0.06)', lineHeight: 1, marginBottom: 16,
              }}>
                {panel.num}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
                color: panel.primary ? '#E07B39' : 'rgba(255,255,255,0.35)',
                marginBottom: 12,
              }}>
                {panel.eyebrow}
              </div>
              <h3 style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: 30, textTransform: 'uppercase', color: '#fff',
                marginBottom: 16, lineHeight: 1.05, whiteSpace: 'pre-line',
              }}>
                {panel.title}
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 14,
                lineHeight: 1.75, color: 'rgba(255,255,255,0.55)', marginBottom: 28, flex: 1,
              }}>
                {panel.desc}
              </p>
              <Link href={panel.href} style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
                color: panel.primary ? '#E07B39' : 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                borderBottom: `1px solid ${panel.primary ? '#E07B39' : 'rgba(255,255,255,0.25)'}`,
                paddingBottom: 2,
                alignSelf: 'flex-start',
              }}>
                {panel.cta}
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
