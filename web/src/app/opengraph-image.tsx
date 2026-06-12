import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Konative — North American Data Center Intelligence'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#08142D',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Top: wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 32, height: 2, background: '#C8001F' }} />
          <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C8001F' }}>
            KONATIVE
          </span>
        </div>

        {/* Center: headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 0.93, textTransform: 'uppercase', color: '#ffffff', letterSpacing: '0.01em' }}>
            NORTH AMERICAN
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 0.93, textTransform: 'uppercase', color: '#C8001F', letterSpacing: '0.01em' }}>
            DATA CENTER MAP
          </div>
          <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', marginTop: 16, maxWidth: 620, lineHeight: 1.5 }}>
            3,100+ facilities, power pipeline, and connectivity infrastructure across the US and Canada.
          </div>
        </div>

        {/* Bottom: stats bar */}
        <div style={{ display: 'flex', gap: 48, alignItems: 'flex-end' }}>
          {[
            { value: '1,436', label: 'DC Projects' },
            { value: '1,572', label: 'Network Nodes' },
            { value: '105', label: 'IM3 Facilities' },
            { value: '12', label: 'Markets' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color: '#ffffff' }}>{s.value}</span>
              <span style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 13, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
            konative.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
