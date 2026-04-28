'use client'

import Link from 'next/link'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function Footer() {
  const isMobile = useIsMobile()
  return (
    <footer style={{ background: '#08142D', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '64px 0 32px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 20px' : '0 48px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 32 : 48, marginBottom: 48 }}>

          <div style={isMobile ? { gridColumn: '1 / -1' } : undefined}>
            <Link href="/" style={{
              display: 'inline-block', marginBottom: 16, textDecoration: 'none',
              fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
              fontSize: 22, letterSpacing: '0.04em', textTransform: 'uppercase',
            }}>
              <span style={{ color: '#fff' }}>KO</span>
              <span style={{ color: '#E07B39' }}>NATIVE</span>
            </Link>
            <p style={{
              fontFamily: 'Inter, sans-serif', fontSize: 13,
              lineHeight: 1.7, color: 'rgba(255,255,255,0.35)', maxWidth: 260,
            }}>
              End-to-end energy infrastructure brokerage and development. Connecting investors, landholders, supply chain, and teams to close deals that move.
            </p>
          </div>

          <div>
            <h4 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: 16,
            }}>
              Services
            </h4>
            {['Capital Matchmaking', 'Site Acquisition', 'Supply Chain', 'Power Sourcing', 'BTM Strategy', 'Staffing'].map(s => (
              <Link key={s} href="/contact" style={{
                display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13,
                color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8,
              }}>
                {s}
              </Link>
            ))}
          </div>

          <div>
            <h4 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: 16,
            }}>
              Company
            </h4>
            {[
              { label: 'Team', href: '/#team' },
              { label: 'Deals', href: '/deals' },
              { label: 'Market Intel', href: '/market-intel' },
              { label: 'Contact', href: '/contact' },
              { label: 'Data Sources & Licenses', href: '/licenses' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{
                display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13,
                color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8,
              }}>
                {l.label}
              </Link>
            ))}
          </div>

          <div>
            <h4 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: 16,
            }}>
              Start Here
            </h4>
            {[
              { label: "I'm an Investor", href: '/contact' },
              { label: 'I Have Land', href: '/contact' },
              { label: 'I Have a Project', href: '/contact' },
              { label: 'Newsletter', href: '/#market-intel' },
            ].map(l => (
              <Link key={l.label} href={l.href} style={{
                display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 13,
                color: 'rgba(255,255,255,0.45)', textDecoration: 'none', marginBottom: 8,
              }}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 24,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 6 : 0,
          justifyContent: 'space-between',
          fontFamily: 'Inter, sans-serif', fontSize: 11,
          color: 'rgba(255,255,255,0.2)',
        }}>
          <span>© 2026 Konative · tolowastudio.com</span>
          <span>Datacenter Brokerage &amp; Development</span>
        </div>

      </div>
    </footer>
  )
}
