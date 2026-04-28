'use client'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'

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

function formatCount(n: number | undefined, fallback: string): string {
  if (!n || n <= 0) return fallback
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

interface HeroSectionProps {
  deals: Deal[]
  stats: HealthStats
}

const PLACEHOLDER_DEALS: Deal[] = [
  { id: '1', name: 'Loudoun County Land Package',  entity: 'Undisclosed Hyperscaler',    size: '320 acres · 230kV', status: 'ACTIVE',    geography: 'Northern Virginia' },
  { id: '2', name: 'Permian Basin Power Site',      entity: 'Infrastructure Fund',        size: '1,200 acres',       status: 'ANNOUNCED', geography: 'West Texas' },
  { id: '3', name: 'Alberta Transmission Corridor', entity: 'Canadian Pension / AI Co.',  size: '2,400 acres',       status: 'ACTIVE',    geography: 'Alberta, Canada' },
  { id: '4', name: 'Carolina Colo Campus',          entity: 'Colo Operator + Family JV',  size: '180MW RFP',         status: 'ANNOUNCED', geography: 'North Carolina' },
  { id: '5', name: 'Pacific Northwest Land Play',   entity: 'Sovereign Wealth Fund',      size: '800 acres · 500kV', status: 'ACTIVE',    geography: 'Pacific Northwest' },
]

function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState<number | string>(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return
      io.disconnect()
      const isFloat = String(target).includes('.')
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
        const cur = ease * target
        setVal(isFloat ? parseFloat(cur.toFixed(1)) : Math.floor(cur))
        if (t < 1) requestAnimationFrame(tick)
        else setVal(target)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [target, duration])
  return [val, ref] as const
}

const statusDot = (s: string) =>
  s === 'ACTIVE' ? '#22c55e' : s === 'ANNOUNCED' ? '#D97706' : '#888'

export default function HeroSection({ deals, stats }: HeroSectionProps) {
  const displayDeals = deals.length > 0 ? deals : PLACEHOLDER_DEALS
  const tickerDeals = [...displayDeals, ...displayDeals]

  const [dealCount, dealRef] = useCountUp(stats.dealCount || displayDeals.length)

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
            Datacenter Brokerage
          </p>

          <h1 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: 'clamp(56px, 8vw, 104px)', lineHeight: 0.88,
            textTransform: 'uppercase', letterSpacing: '0.01em',
            color: '#fff', marginBottom: 32,
          }}>
            OWN POWERED<br />
            <span style={{ color: '#E07B39' }}>LAND?</span><br />
            <span style={{ color: 'rgba(255,255,255,0.22)' }}>THE AI BUILDOUT</span><br />
            WANTS TO TALK.
          </h1>

          <p style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 400,
            fontSize: 17, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.55)',
            maxWidth: 580, marginBottom: 44,
          }}>
            Hyperscalers and data center developers are racing to lock up powered land across North America.
            Konative brokers those deals — sourcing sites, connecting investors, and managing the transaction
            from first call to close.
          </p>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link href="/land/submit" style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
              background: '#E07B39', color: '#fff',
              padding: '18px 40px', textDecoration: 'none', display: 'inline-block',
            }}>
              Submit Your Land →
            </Link>
            <Link href="/capacity" style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
              background: 'transparent', color: 'rgba(255,255,255,0.7)',
              padding: '17px 32px', border: '1px solid rgba(255,255,255,0.25)',
              textDecoration: 'none', display: 'inline-block',
            }}>
              Find Capacity →
            </Link>
            <Link href="/assessment" style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase',
              background: 'transparent', color: 'rgba(255,255,255,0.4)',
              padding: '17px 0', textDecoration: 'none', display: 'inline-block',
            }}>
              Evaluate a Site →
            </Link>
          </div>
        </div>

        <div style={{ flexShrink: 0, width: 280, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[
            { val: formatCount(stats.facilitiesScored, '—'), label: 'DC Facilities Scored', rust: true },
            { val: formatCount(stats.generatorsTracked, '—'), label: 'Planned Generators Tracked', rust: false },
            { val: formatCount(stats.waterSitesIndexed, '—'), label: 'Water Sites Indexed', rust: false },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(8,20,45,0.82)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '20px 22px',
              backdropFilter: 'blur(12px)',
            }}>
              <div style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: 40, lineHeight: 1, marginBottom: 4,
                color: stat.rust ? '#E07B39' : '#fff',
              }}>
                {stat.val}
              </div>
              <div style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 500,
                fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.35)',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
          <div style={{
            background: 'rgba(8,20,45,0.82)',
            border: '1px solid rgba(224,123,57,0.35)',
            padding: '20px 22px',
            backdropFilter: 'blur(12px)',
          }}>
            <div ref={dealRef as React.RefObject<HTMLDivElement>} style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
              fontSize: 28, lineHeight: 1.2, marginBottom: 4, color: '#E07B39',
            }}>
              {dealCount} ACTIVE
            </div>
            <div style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 500,
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.35)',
            }}>
              Transactions in Motion
            </div>
          </div>
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
