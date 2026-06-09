'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { HomeConnectivityContent, Tone } from '@/content/homeConnectivity'

const DataCenterMap = dynamic(() => import('@/components/DataCenterMap'), { ssr: false })

interface Deal {
  id: string
  name: string
  entity: string
  size: string
  status: 'ACTIVE' | 'ANNOUNCED' | 'CLOSED'
  geography: string
}

interface HealthStats {
  articleCount: number
  feedCount: number
  dealCount: number
  facilitiesScored?: number
  generatorsTracked?: number
  waterSitesIndexed?: number
  networkNodesIndexed?: number
}

interface HeroSectionProps {
  deals: Deal[]
  stats: HealthStats
  content: HomeConnectivityContent
}

const PLACEHOLDER_DEALS: Deal[] = [
  { id: '1', name: 'Tribal Gaming Enterprise — SD-WAN + DIA',  entity: 'Sovereign Nation',          size: '7 sites',          status: 'ACTIVE',    geography: 'Pacific Northwest' },
  { id: '2', name: 'Hyperscale Campus — Dark Fiber + Waves',   entity: 'AI Data Center Developer',  size: '400G transport',   status: 'ANNOUNCED', geography: 'Northern Virginia' },
  { id: '3', name: 'Colo Interconnect — Cloud On-Ramps',       entity: 'Colocation Operator',       size: 'AWS / Azure DX',   status: 'ACTIVE',    geography: 'Alberta, Canada' },
  { id: '4', name: 'Tribal Health Network — UCaaS + Security', entity: 'Tribal Health System',      size: '12 clinics',       status: 'ANNOUNCED', geography: 'Southwest' },
  { id: '5', name: 'Multi-Site Retail — Managed Network',      entity: 'Regional Enterprise',       size: '40 locations',     status: 'ACTIVE',    geography: 'Nationwide' },
]

const toneColor = (tone: Tone): string =>
  tone === 'rust' ? '#E07B39' : tone === 'dim' ? 'rgba(255,255,255,0.22)' : '#fff'

const statusDot = (s: string) =>
  s === 'ACTIVE' ? '#22c55e' : s === 'ANNOUNCED' ? '#D97706' : '#888'

export default function HeroSection({ deals, content }: HeroSectionProps) {
  const displayDeals = deals.length > 0 ? deals : PLACEHOLDER_DEALS
  const tickerDeals = [...displayDeals, ...displayDeals]
  const [primaryCta, ...restSecondary] = content.heroSecondaryCtas

  return (
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#08142D',
      }}
    >
      <div style={{ position: 'absolute', inset: 0 }}>
        <DataCenterMap backgroundMode />
      </div>

      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(115deg, rgba(8,20,45,0.92) 0%, rgba(8,20,45,0.80) 45%, rgba(12,32,70,0.40) 75%, rgba(30,79,191,0.08) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 2, flex: 1,
        display: 'flex', alignItems: 'center',
        maxWidth: 1320, margin: '0 auto', width: '100%',
        padding: '0 48px', gap: 80, paddingTop: 68,
      }}>
        <div style={{ flex: 1, maxWidth: 800 }}>
          <p style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#E07B39', marginBottom: 32,
          }}>
            <span style={{ display: 'block', width: 36, height: 1, background: '#E07B39', flexShrink: 0 }} />
            {content.heroEyebrow}
          </p>

          <h1 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: 'clamp(52px, 7.4vw, 96px)', lineHeight: 0.9,
            textTransform: 'uppercase', letterSpacing: '0.01em',
            color: '#fff', marginBottom: 32,
          }}>
            {content.heroHeadline.map((line, i) => (
              <span key={i} style={{ color: toneColor(line.tone), display: 'block' }}>
                {line.text}
              </span>
            ))}
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 400,
            fontSize: 17, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.6)',
            maxWidth: 600, marginBottom: 44,
          }}>
            {content.heroSubhead}
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href={content.heroPrimaryCta.href} style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
              background: '#E07B39', color: '#fff',
              padding: '18px 40px', textDecoration: 'none', display: 'inline-block',
            }}>
              {content.heroPrimaryCta.label}
            </Link>
            {primaryCta && (
              <Link href={primaryCta.href} style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
                background: 'transparent', color: 'rgba(255,255,255,0.7)',
                padding: '17px 32px', border: '1px solid rgba(255,255,255,0.25)',
                textDecoration: 'none', display: 'inline-block',
              }}>
                {primaryCta.label}
              </Link>
            )}
            {restSecondary.map((cta) => (
              <Link key={cta.href} href={cta.href} style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
                background: 'transparent', color: 'rgba(255,255,255,0.45)',
                padding: '17px 0', textDecoration: 'none', display: 'inline-block',
              }}>
                {cta.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{ flexShrink: 0, width: 280, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {content.heroStats.map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(8,20,45,0.82)',
              border: stat.highlight ? '1px solid rgba(224,123,57,0.35)' : '1px solid rgba(255,255,255,0.1)',
              padding: '20px 22px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: stat.highlight ? 30 : 40, lineHeight: 1, marginBottom: 4,
                color: stat.rust || stat.highlight ? '#E07B39' : '#fff',
              }}>
                {stat.value}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)', lineHeight: 1.4,
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal ticker */}
      <div style={{
        position: 'relative', zIndex: 2,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(4,10,22,0.85)', backdropFilter: 'blur(8px)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex',
          animation: 'ticker-scroll 32s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {tickerDeals.map((deal, i) => (
            <div key={`${deal.id}-${i}`} style={{
              padding: '14px 36px',
              fontFamily: 'Inter, sans-serif',
              fontSize: 11, letterSpacing: '0.13em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.4)',
              borderRight: '1px solid rgba(255,255,255,0.07)',
              display: 'inline-flex', alignItems: 'center', gap: 10, flexShrink: 0,
            }}>
              <span style={{
                width: 5, height: 5, borderRadius: '50%',
                background: statusDot(deal.status), flexShrink: 0,
                display: 'inline-block',
              }} />
              {deal.name} · {deal.size} · {deal.geography}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
