'use client'

import Link from 'next/link'

const doors = [
  {
    label: 'I own land',
    desc: 'Near a substation or transmission corridor. Tell us about your parcel.',
    cta: 'Submit Your Land →',
    href: '/land/submit',
    primary: true,
  },
  {
    label: 'I have capital',
    desc: 'Looking to deploy into powered land, build-to-suit, or operating assets.',
    cta: 'Talk to Us →',
    href: '/invest',
    primary: false,
  },
  {
    label: 'I need capacity',
    desc: 'Looking for MW. Tell us your requirements and we\'ll source the right site.',
    cta: 'Submit Your RFP →',
    href: '/capacity',
    primary: false,
  },
  {
    label: 'Evaluate a site',
    desc: 'Run a site through our infrastructure evaluation tool — power, fiber, and development readiness in minutes.',
    cta: 'Launch Site Eval →',
    href: '/assessment',
    primary: false,
  },
]

export default function StartNowCTA() {
  return (
    <section id="start-now" style={{
      background: '#0C2046', padding: '100px 0',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200&q=70')",
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.05,
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 1320, margin: '0 auto', padding: '0 48px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            fontFamily: 'Inter, sans-serif', fontWeight: 600,
            fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#E07B39', marginBottom: 20,
          }}>
            <span style={{ display: 'block', width: 28, height: 1, background: '#E07B39' }} />
            Get Started
            <span style={{ display: 'block', width: 28, height: 1, background: '#E07B39' }} />
          </div>
          <h2 style={{
            fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
            fontSize: 'clamp(44px, 5.5vw, 80px)', lineHeight: 0.9,
            textTransform: 'uppercase', letterSpacing: '0.01em',
            color: '#fff', marginBottom: 20,
          }}>
            TELL US WHERE<br />YOU <span style={{ color: '#E07B39' }}>STAND.</span>
          </h2>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: 1.7,
            color: 'rgba(255,255,255,0.45)', maxWidth: 540, margin: '0 auto',
          }}>
            Pick the door that fits your situation. Five minutes, no obligation.
            We respond within 48 hours — directly from the team, not an SDR.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 32,
        }}>
          {doors.map((door, i) => (
            <div key={i} style={{
              background: '#0C2046',
              padding: '44px 40px',
              borderTop: door.primary ? '3px solid #E07B39' : '3px solid transparent',
              display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
            }}>
              <h3 style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: 28, textTransform: 'uppercase', color: '#fff',
                lineHeight: 1, marginBottom: 12,
              }}>
                {door.label}
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 14,
                lineHeight: 1.7, color: 'rgba(255,255,255,0.5)', marginBottom: 28, flex: 1,
              }}>
                {door.desc}
              </p>
              <Link href={door.href} style={{
                fontFamily: 'Inter, sans-serif', fontWeight: 600,
                fontSize: 12, letterSpacing: '0.12em', textTransform: 'uppercase',
                background: door.primary ? '#E07B39' : 'transparent',
                color: door.primary ? '#fff' : 'rgba(255,255,255,0.7)',
                padding: door.primary ? '14px 28px' : '13px 28px',
                border: door.primary ? 'none' : '1px solid rgba(255,255,255,0.25)',
                textDecoration: 'none', display: 'inline-block',
              }}>
                {door.cta}
              </Link>
            </div>
          ))}
        </div>

        <p style={{
          fontFamily: 'Inter, sans-serif', fontSize: 12,
          color: 'rgba(255,255,255,0.2)', textAlign: 'center',
        }}>
          48-hour response guarantee · No obligation · Konative.com is not a lead aggregator — your submission goes directly to our deal team
        </p>
      </div>
    </section>
  )
}
