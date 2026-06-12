'use client'

import { useState } from 'react'
import type { CASResult, CASGrade } from '@/lib/availability-score'

// ── Grade colours ─────────────────────────────────────────────────────────────

const GRADE_COLORS: Record<CASGrade, string> = {
  'A+': '#22c55e',
  'A':  '#4ade80',
  'B+': '#86efac',
  'B':  '#fbbf24',
  'C+': '#fb923c',
  'C':  '#f97316',
  'D':  '#ef4444',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DimensionBar({
  label,
  score,
  maxScore,
  detail,
  color,
}: {
  label: string
  score: number
  maxScore: number
  detail: string
  color: string
}) {
  const pct = Math.round((score / maxScore) * 100)
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
          {label}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>
          {score}<span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>/{maxScore}</span>
        </span>
      </div>
      {/* Bar track */}
      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', position: 'relative', borderRadius: 2 }}>
        <div
          style={{
            position: 'absolute', left: 0, top: 0, bottom: 0,
            width: `${pct}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 3, lineHeight: 1.4 }}>
        {detail}
      </div>
    </div>
  )
}

function ScoreBadge({ score, grade }: { score: number; grade: CASGrade }) {
  const color = GRADE_COLORS[grade]
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* Big number */}
      <div style={{
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 52,
        fontWeight: 700,
        lineHeight: 1,
        color: '#fff',
        letterSpacing: '-0.02em',
      }}>
        {score}
      </div>
      {/* Grade badge */}
      <div style={{
        background: color,
        color: '#fff',
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 22,
        fontWeight: 800,
        letterSpacing: '0.05em',
        padding: '4px 12px',
        lineHeight: 1.2,
      }}>
        {grade}
      </div>
    </div>
  )
}

function FlagBadge({ label, warning }: { label: string; warning: boolean }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: warning ? 'rgba(251,146,60,0.15)' : 'rgba(34,197,94,0.12)',
      border: `1px solid ${warning ? 'rgba(251,146,60,0.4)' : 'rgba(34,197,94,0.3)'}`,
      padding: '3px 8px', fontSize: 10, fontWeight: 600,
      color: warning ? '#fb923c' : '#4ade80',
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      <span>{warning ? '⚠' : '✓'}</span>
      {label}
    </div>
  )
}

// ── Dimension colours (by index order) ───────────────────────────────────────

const DIM_COLORS = ['#eab308', '#22d3ee', '#38bdf8', '#84cc16', '#f97316', '#a855f7']

// ── Main panel ────────────────────────────────────────────────────────────────

interface Props {
  result: CASResult
  onClose: () => void
}

export default function AvailabilityScorePanel({ result, onClose }: Props) {
  const [showMethodology, setShowMethodology] = useState(false)
  const { score, grade, dimensions, metadata } = result

  const dims = [
    { key: 'power',         label: 'Power Proximity',          d: dimensions.power         },
    { key: 'queue',         label: 'Grid Queue Capacity',       d: dimensions.queue         },
    { key: 'water',         label: 'Water Risk',                d: dimensions.water         },
    { key: 'environmental', label: 'Environmental Constraints', d: dimensions.environmental },
    { key: 'wildfire',      label: 'Wildfire Risk',             d: dimensions.wildfire      },
    { key: 'labor',         label: 'Labor Market',              d: dimensions.labor         },
  ]

  // Derive flags for summary badges
  const flags = [
    { label: 'Grid proximity',   warning: dimensions.power.score < 10 },
    { label: 'Queue capacity',   warning: dimensions.queue.score < 8  },
    { label: 'Water risk',       warning: dimensions.water.score < 8  },
    { label: 'Protected area',   warning: dimensions.environmental.score < 10 },
    { label: 'Wildfire exposure',warning: dimensions.wildfire.score < 8 },
    { label: 'Labor access',     warning: dimensions.labor.score < 6  },
  ]

  const labelStyle: React.CSSProperties = {
    fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C8001F',
  }

  return (
    <div style={{
      width: '100%', height: '100%',
      overflowY: 'auto',
      background: 'rgba(8,20,45,0.92)',
      border: '1px solid rgba(255,255,255,0.12)',
      backdropFilter: 'blur(10px)',
      fontFamily: 'Inter, sans-serif',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '12px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0,
      }}>
        <div>
          <div style={labelStyle}>Canadian Availability Score™</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {result.lat.toFixed(3)}, {result.lng.toFixed(3)}
            {metadata.province && (
              <span style={{ marginLeft: 6, color: '#C8001F' }}>{metadata.province}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Score badge */}
      <div style={{ padding: '14px 14px 0' }}>
        <ScoreBadge score={score} grade={grade} />
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, marginBottom: 12 }}>
          out of 100 · 50 km radius
        </div>

        {/* Summary flags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 14 }}>
          {flags.map(f => (
            <FlagBadge key={f.label} label={f.label} warning={f.warning} />
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginBottom: 14 }} />
      </div>

      {/* Dimension bars */}
      <div style={{ padding: '0 14px', flex: 1, overflowY: 'auto' }}>
        {dims.map(({ key, d }, i) => (
          <DimensionBar
            key={key}
            label={d.label}
            score={d.score}
            maxScore={d.maxScore}
            detail={d.detail}
            color={DIM_COLORS[i]}
          />
        ))}

        {/* Methodology toggle */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 8, paddingTop: 10 }}>
          <button
            onClick={() => setShowMethodology(v => !v)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 5, padding: 0,
            }}
          >
            <span style={{ fontSize: 12 }}>{showMethodology ? '▾' : '▸'}</span>
            Methodology
          </button>

          {showMethodology && (
            <div style={{ marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>
              <p style={{ margin: '0 0 6px' }}>
                The Canadian Availability Score™ is a composite 0–100 index for assessing datacenter development suitability at any Canadian lat/lng.
              </p>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                <li><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Power Proximity (25 pts)</strong> — distance to nearest interconnection queue POI + cluster density within 25 km.</li>
                <li><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Grid Queue Capacity (20 pts)</strong> — total MW in interconnection queue within 50 km.</li>
                <li><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Water Risk (15 pts)</strong> — WRI Aqueduct 4.0 provincial summary (low risk = high score).</li>
                <li><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Environmental Constraints (15 pts)</strong> — CPCAD protected areas (−10 pts) and CIRNAC Indigenous lands (−8 pts) within search radius.</li>
                <li><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Wildfire Risk (15 pts)</strong> — CWFIS NFDB provincial fire density (20-year horizon).</li>
                <li><strong style={{ color: 'rgba(255,255,255,0.6)' }}>Labor Market (10 pts)</strong> — proximity to major Canadian metro centers as a proxy for tech talent supply.</li>
              </ul>
              <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.25)' }}>
                Computed at {new Date(metadata.computedAt).toLocaleTimeString()}. Queue data: Supabase PostGIS. Environmental: bbox approximation. Wildfire + Water: provincial lookup.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
