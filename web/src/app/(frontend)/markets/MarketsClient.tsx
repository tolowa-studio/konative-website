'use client'

import Link from 'next/link'
import { useState } from 'react'
import HeroBackdrop from '@/components/marketing/HeroBackdrop'
import type { MARKETS } from './[state]/page'

type MarketsMap = typeof MARKETS
const RED = '#C8001F'
const TEXT = '#111111'
const STEEL = '#374151'
const MUTED = '#6B7280'
const DIVIDER = '#E5E7EB'
const SURFACE = '#F9FAFB'
const TIER_COLORS = { primary: RED, emerging: STEEL, developing: '#111111' }
const TIER_LABELS = { primary: 'PRIMARY', emerging: 'EMERGING', developing: 'DEVELOPING' }

export default function MarketsClient({ markets }: { markets: MarketsMap }) {
  const primary = Object.entries(markets).filter(([, m]) => m.tier === 'primary')
  const emerging = Object.entries(markets).filter(([, m]) => m.tier === 'emerging')
  const developing = Object.entries(markets).filter(([, m]) => m.tier === 'developing')
  const countryCount = new Set(Object.values(markets).map((m) => m.country)).size

  return (
    <div className="markets-page" style={{ background: '#fff', minHeight: '100vh', fontFamily: 'Inter, sans-serif', color: TEXT }}>
      <div style={{ position: 'relative', overflow: 'hidden', background: '#0A0F1E', paddingTop: 142, paddingBottom: 56, paddingLeft: 48, paddingRight: 48, borderBottom: `1px solid ${DIVIDER}` }}>
        <HeroBackdrop
          src="https://images.unsplash.com/photo-1506747111041-18b1844bf60f?auto=format&fit=crop&w=2000&q=70"
          alt="North American city grid glowing at night from above"
        />
        <div className="markets-page__hero-grid" style={{ position: 'relative', zIndex: 2, maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(300px, 430px)', gap: 48, alignItems: 'end' }}>
          <div>
            <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: RED, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'block', width: 28, height: 2, background: RED }} />
              Intelligence by Market
            </p>
            <h1 style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 'clamp(50px, 7vw, 96px)', lineHeight: 0.9, textTransform: 'uppercase', color: '#ffffff', margin: '0 0 22px', maxWidth: 860 }}>
              NORTH AMERICAN<br /><span style={{ color: RED }}>CONNECTIVITY MARKETS</span>
            </h1>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, lineHeight: 1.65, color: 'rgba(255,255,255,0.78)', maxWidth: 650, margin: '0 0 28px' }}>
              Power pipeline, network infrastructure, route pressure, and project data for {Object.keys(markets).length} key markets. Built to help buyers and developers understand where connectivity demand is forming.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/canada" style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#fff', background: RED, textDecoration: 'none', padding: '12px 20px', borderRadius: 2 }}>
                Canada Deep Dive
              </Link>
              <Link href="/map" style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: STEEL, background: '#fff', textDecoration: 'none', padding: '11px 20px', border: `1px solid ${DIVIDER}`, borderRadius: 2 }}>
                Open Map View
              </Link>
            </div>
          </div>
          <div style={{ background: '#111', color: '#fff', borderTop: `4px solid ${RED}`, padding: 28, boxShadow: '0 22px 60px rgba(17,17,17,0.16)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 26 }}>
              {[
                { label: 'Markets', value: Object.keys(markets).length },
                { label: 'Countries', value: countryCount },
                { label: 'Primary', value: primary.length },
              ].map((stat) => (
                <div key={stat.label}>
                  <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 42, fontWeight: 800, lineHeight: 1, color: '#fff' }}>{stat.value}</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.52)' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                { label: 'Power pipeline', width: '84%' },
                { label: 'Fiber density', width: '68%' },
                { label: 'Site pressure', width: '76%' },
              ].map((row) => (
                <div key={row.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.64)', marginBottom: 6 }}>
                    <span>{row.label}</span>
                  </div>
                  <div style={{ height: 6, background: 'rgba(255,255,255,0.12)' }}>
                    <div style={{ width: row.width, height: '100%', background: RED }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '56px 48px 90px' }}>
        <MarketGroup label="Primary Markets" markets={primary} />
        <div style={{ marginTop: 48 }}>
          <MarketGroup label="Emerging Markets" markets={emerging} />
        </div>
        <div style={{ marginTop: 48 }}>
          <MarketGroup label="Developing Markets" markets={developing} />
        </div>
      </div>
    </div>
  )
}

function MarketGroup({ label, markets }: { label: string; markets: [string, MarketsMap[string]][] }) {
  return (
    <div>
      <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: RED, marginBottom: 20 }}>
        {label}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {markets.map(([slug, m]) => <MarketCard key={slug} slug={slug} market={m} />)}
      </div>
    </div>
  )
}

function MarketCard({ slug, market: m }: { slug: string; market: MarketsMap[string] }) {
  const [hovered, setHovered] = useState(false)
  return (
    <Link href={`/markets/${slug}`} style={{ textDecoration: 'none' }}>
      <div
        style={{ background: hovered ? SURFACE : '#fff', padding: '28px 28px', transition: 'background 0.15s, box-shadow 0.15s', cursor: 'pointer', border: `1px solid ${DIVIDER}`, borderTop: `3px solid ${TIER_COLORS[m.tier]}`, minHeight: 230, display: 'flex', flexDirection: 'column', boxShadow: hovered ? '0 10px 24px rgba(17,17,17,0.08)' : 'none' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <span style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800, fontSize: 32, color: TEXT, lineHeight: 1, textTransform: 'uppercase' }}>
            {m.name}
          </span>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 8, fontWeight: 600, letterSpacing: '0.15em', color: TIER_COLORS[m.tier], border: `1px solid ${TIER_COLORS[m.tier]}`, padding: '2px 6px', textTransform: 'uppercase', marginTop: 4, flexShrink: 0 }}>
            {TIER_LABELS[m.tier]}
          </span>
        </div>
        <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10, fontWeight: 700 }}>
          {m.iso} · {m.country === 'US' ? 'United States' : m.country === 'CA' ? 'Canada' : 'Mexico'}
        </div>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: MUTED, lineHeight: 1.55, margin: '0 0 16px' }}>
          {m.subheadline}
        </p>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, color: RED, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginTop: 'auto' }}>
          View Market
        </span>
      </div>
    </Link>
  )
}
