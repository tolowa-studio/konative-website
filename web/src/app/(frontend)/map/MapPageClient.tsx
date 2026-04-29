'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState, useCallback } from 'react'
import { LAYER_COLORS, type MapCounts, type LayerKey } from '@/components/DataCenterMap'

const DataCenterMap = dynamic(() => import('@/components/DataCenterMap'), { ssr: false })

const SOURCES = [
  { key: 'facilities', label: 'IM3 Atlas',   desc: 'Verified US data centers',     url: 'https://github.com/IMMM-SFA/datacenter-atlas' },
  { key: 'network',    label: 'PeeringDB',    desc: 'Colocation & IX facilities',   url: 'https://www.peeringdb.com' },
  { key: 'power',      label: 'EIA-860M',     desc: 'Planned generation pipeline',  url: 'https://www.eia.gov/electricity/data/eia860m/' },
  { key: 'projects',   label: 'OSM/Wikidata', desc: 'Community + news extraction',  url: 'https://www.openstreetmap.org' },
] as const

export default function MapPageClient() {
  const [counts, setCounts] = useState<MapCounts | null>(null)
  const [toolMode, setToolMode] = useState(false)

  useEffect(() => {
    fetch('/api/v1/map-data')
      .then(r => r.json())
      .then(d => setCounts(d.counts))
      .catch(() => {})
  }, [])

  // Escape key exits tool mode
  useEffect(() => {
    if (!toolMode) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setToolMode(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toolMode])

  const total = counts?.total ?? 0

  // ── Tool Mode — full-viewport GIS experience ──────────────────────────────
  if (toolMode) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100dvh',
        zIndex: 1001,
        background: '#08142D',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Tool mode top bar */}
        <div style={{
          height: 36,
          flexShrink: 0,
          background: 'rgba(4,12,28,0.96)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          zIndex: 20,
        }}>
          {/* Left — mode label only */}
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 9,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.25)',
          }}>
            GIS Tool Mode
          </span>

          {/* Right — exit button (no submit land link here — lives in Demo Views) */}
          <button
            onClick={() => setToolMode(false)}
            title="Exit tool mode (Esc)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.45)',
              cursor: 'pointer',
              padding: '4px 12px',
              color: '#22c55e',
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            }}
            onMouseEnter={e => {
              const btn = e.currentTarget
              btn.style.background = 'rgba(34,197,94,0.22)'
              btn.style.borderColor = 'rgba(34,197,94,0.8)'
              btn.style.color = '#4ade80'
            }}
            onMouseLeave={e => {
              const btn = e.currentTarget
              btn.style.background = 'rgba(34,197,94,0.12)'
              btn.style.borderColor = 'rgba(34,197,94,0.45)'
              btn.style.color = '#22c55e'
            }}
          >
            <span style={{ fontSize: 11, lineHeight: 1 }}>✕</span>
            Exit Tool Mode
            <span style={{ opacity: 0.45, fontSize: 8, marginLeft: 2 }}>ESC</span>
          </button>
        </div>

        {/* Map fills remaining height */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          <DataCenterMap />
        </div>
      </div>
    )
  }

  // ── Editorial Mode — page with header + map + footer ─────────────────────
  return (
    <div style={{ background: '#08142D', height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Page header */}
      <div style={{
        paddingTop: 80, paddingBottom: 20,
        paddingLeft: 48, paddingRight: 48,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>

          {/* Title block — compact */}
          <div>
            <p style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase',
              color: '#E07B39', marginBottom: 6,
            }}>
              <span style={{ display: 'block', width: 20, height: 1, background: '#E07B39' }} />
              Live Intelligence
            </p>
            <h1 style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 800,
              fontSize: 'clamp(28px, 3.5vw, 48px)', lineHeight: 0.92,
              textTransform: 'uppercase', color: '#fff', marginBottom: 0,
            }}>
              US + CANADA&nbsp;
              <span style={{ color: '#E07B39' }}>Data Center Map</span>
            </h1>
            {total > 0 && (
              <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 5 }}>
                <strong style={{ color: 'rgba(255,140,60,0.7)' }}>{total.toLocaleString()}</strong> records · toggle layers in the left panel
              </p>
            )}
          </div>

          {/* Right side — source badges + Tool Mode button */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>

            {/* Compact source badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {SOURCES.map(({ key, label, url }) => {
                const count = counts?.[key as LayerKey] ?? 0
                const active = count > 0
                return (
                  <a key={key} href={url} target="_blank" rel="noopener noreferrer" style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    fontFamily: 'Inter, sans-serif', fontSize: 10,
                    color: active ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.15)',
                    textDecoration: 'none',
                  }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: LAYER_COLORS[key as LayerKey],
                      opacity: active ? 0.9 : 0.2,
                      flexShrink: 0,
                    }} />
                    {label}
                    {active && <span style={{ color: 'rgba(255,255,255,0.2)' }}>({count.toLocaleString()})</span>}
                  </a>
                )
              })}
            </div>

            {/* Tool Mode button */}
            <button
              onClick={() => setToolMode(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                background: 'rgba(224,123,57,0.08)',
                border: '1px solid rgba(224,123,57,0.35)',
                cursor: 'pointer',
                padding: '7px 14px',
                color: '#E07B39',
                fontFamily: 'Inter, sans-serif',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                transition: 'background 0.15s, border-color 0.15s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                const btn = e.currentTarget
                btn.style.background = 'rgba(224,123,57,0.18)'
                btn.style.borderColor = 'rgba(224,123,57,0.65)'
              }}
              onMouseLeave={e => {
                const btn = e.currentTarget
                btn.style.background = 'rgba(224,123,57,0.08)'
                btn.style.borderColor = 'rgba(224,123,57,0.35)'
              }}
            >
              <span style={{ fontSize: 13, lineHeight: 1 }}>⛶</span>
              Launch Tool Mode
            </button>
          </div>
        </div>
      </div>

      {/* Map — fills all remaining height */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <DataCenterMap />
      </div>

      {/* Footer — thin single-line bar */}
      <div style={{
        padding: '0 20px',
        height: 28,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
        gap: 16,
      }}>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.04em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          IM3/PeeringDB · EIA-860M · OSM/Wikidata · News: daily
        </p>
        <Link href="/capacity" style={{
          fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: 9,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.25)', textDecoration: 'none', whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          Find Capacity →
        </Link>
      </div>
    </div>
  )
}
