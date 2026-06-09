'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ background: '#08142D', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '64px 0 32px' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>

          <div>
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
              Vendor-neutral internet & network connectivity brokerage. We source, design, and manage connectivity for Tribal enterprises and the data centers powering AI — backed by Avant&apos;s supplier portfolio, at no cost to you.
            </p>
          </div>

          <div>
            <h4 style={{
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.25)', marginBottom: 16,
            }}>
              What We Broker
            </h4>
            {['Internet & Fiber', 'Dark Fiber & Waves', 'SD-WAN & Managed Network', 'UCaaS & CCaaS', 'Cloud On-Ramps', 'Cybersecurity'].map(s => (
              <Link key={s} href="/connectivity" style={{
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
              { label: 'Intelligence', href: '/intelligence' },
              { label: 'Data Center Map', href: '/map' },
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
              { label: 'Tribal Enterprise', href: '/tribal' },
              { label: 'Data Center Connectivity', href: '/data-center-connectivity' },
              { label: 'Get a Quote', href: '/contact' },
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
          display: 'flex', justifyContent: 'space-between',
          fontFamily: 'Inter, sans-serif', fontSize: 11,
          color: 'rgba(255,255,255,0.2)',
        }}>
          <span>© 2026 Konative · tolowastudio.com</span>
          <span>Connectivity Brokerage · Avant Partner</span>
        </div>

      </div>
    </footer>
  )
}
