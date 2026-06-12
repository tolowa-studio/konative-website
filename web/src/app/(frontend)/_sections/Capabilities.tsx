'use client'

import { useState } from 'react'
import type { HomeConnectivityContent } from '@/content/homeConnectivity'

export default function Capabilities({ content }: { content: HomeConnectivityContent }) {
  const [hovered, setHovered] = useState<number | null>(null)
  const capabilities = content.capabilities

  return (
    <section id="capabilities" style={{ background: '#0C2046', padding: '100px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 48px' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'end', marginBottom: 64 }}>
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase',
              color: '#C8001F', marginBottom: 20,
            }}>
              <span style={{ display: 'block', width: 28, height: 1, background: '#C8001F' }} />
              {content.howEyebrow}
            </div>
            <h2 style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
              fontSize: 'clamp(44px, 5.5vw, 80px)', lineHeight: 0.9,
              textTransform: 'uppercase', letterSpacing: '0.01em', color: '#fff',
            }}>
              {content.howHeadingTop}<br /><span style={{ color: '#C8001F' }}>{content.howHeadingBottom}</span>
            </h2>
          </div>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 16, lineHeight: 1.75,
            color: 'rgba(255,255,255,0.45)', maxWidth: 480,
          }}>
            {content.howIntro}
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1, background: 'rgba(255,255,255,0.08)',
        }}>
          {capabilities.map((cap, i) => (
            <div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: '#0C2046',
                padding: '40px 36px',
                borderLeft: hovered === i ? '2px solid #C8001F' : '2px solid transparent',
                transition: 'border-color 0.2s',
              }}
            >
              <div style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: 13, letterSpacing: '0.2em', color: '#C8001F', marginBottom: 16,
              }}>
                {cap.num}
              </div>
              <h3 style={{
                fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700,
                fontSize: 26, textTransform: 'uppercase', color: '#fff',
                lineHeight: 1, marginBottom: 12,
              }}>
                {cap.title}
              </h3>
              <p style={{
                fontFamily: 'Inter, sans-serif', fontSize: 13,
                lineHeight: 1.7, color: 'rgba(255,255,255,0.45)',
              }}>
                {cap.body}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
