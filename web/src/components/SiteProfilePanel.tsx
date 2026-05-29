'use client'

import { useEffect, useState } from 'react'
import { computeFeasibility } from '@/lib/feasibility-score'
import type { FeasibilityResult } from '@/lib/feasibility-score'
import type { CASResult, CASGrade } from '@/lib/availability-score'
import type { QueueRadiusResponse } from '@/types/queue'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  operational: '#22d3ee',
  construction: '#E07B39',
  announced: '#a78bfa',
  stalled: '#f59e0b',
  blocked: '#ef4444',
  paused: '#fb923c',
  canceled: '#64748b',
}

const VERDICT_COLORS = {
  credible:  '#22c55e',
  aggressive: '#f59e0b',
  not_likely: '#ef4444',
}

const VERDICT_LABELS = {
  credible:   'CREDIBLE',
  aggressive: 'AGGRESSIVE',
  not_likely: 'NOT LIKELY',
}

const SOURCE_LABELS: Record<string, string> = {
  osm: 'OpenStreetMap', wikidata: 'Wikidata',
  news_extraction: 'News', ieso_queue: 'IESO', manual: 'Manual',
  im3: 'IM3 Atlas', peeringdb: 'PeeringDB', eia_860m: 'EIA-860M',
}

const GRADE_COLORS: Record<CASGrade, string> = {
  'A+': '#22c55e',
  'A':  '#4ade80',
  'B+': '#86efac',
  'B':  '#fbbf24',
  'C+': '#fb923c',
  'C':  '#f97316',
  'D':  '#ef4444',
}

const DIM_COLORS = ['#eab308', '#22d3ee', '#38bdf8', '#84cc16', '#f97316', '#a855f7']

// ── Shared style tokens ───────────────────────────────────────────────────────

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 9,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#E07B39',
  fontFamily: 'Inter, sans-serif',
}

const PANEL_BASE: React.CSSProperties = {
  position: 'absolute',
  right: 16,
  top: 16,
  bottom: 32,
  zIndex: 20,
  width: 380,
  background: 'rgba(8,20,45,0.92)',
  border: '1px solid rgba(255,255,255,0.1)',
  backdropFilter: 'blur(8px)',
  fontFamily: 'Inter, sans-serif',
  display: 'flex',
  flexDirection: 'column',
  overflowY: 'auto',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0 14px', paddingTop: 10, marginTop: 10 }}>
      <div style={LABEL_STYLE}>{label}</div>
    </div>
  )
}

function MiniDimensionBar({
  label,
  score,
  maxScore,
  color,
  detail,
}: {
  label: string
  score: number
  maxScore: number
  color: string
  detail: string
}) {
  const [showTip, setShowTip] = useState(false)
  const pct = Math.round((score / maxScore) * 100)
  return (
    <div
      style={{ marginBottom: 7, position: 'relative', cursor: 'help' }}
      onMouseEnter={() => setShowTip(true)}
      onMouseLeave={() => setShowTip(false)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 2 }}>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
          {label}
        </span>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
          {score}<span style={{ fontWeight: 400, color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>/{maxScore}</span>
        </span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, position: 'relative' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color, borderRadius: 2 }} />
      </div>
      {showTip && (
        <div style={{
          position: 'absolute', right: 0, top: 24, zIndex: 30,
          background: 'rgba(8,20,45,0.98)', border: '1px solid rgba(255,255,255,0.15)',
          padding: '6px 10px', fontSize: 10, color: 'rgba(255,255,255,0.7)',
          lineHeight: 1.5, maxWidth: 240, backdropFilter: 'blur(8px)',
          pointerEvents: 'none',
        }}>
          {detail}
        </div>
      )}
    </div>
  )
}

// ── Site mode — clicked a dot ─────────────────────────────────────────────────

interface SiteProps {
  feature: {
    name?: string
    operator?: string
    city?: string
    state?: string
    status?: string
    mw?: number
    source?: string
    sourceUrl?: string
    announcedDate?: string | null
    expectedOnlineDate?: string | null
    blockReason?: string | null
    blockReasonDetail?: string | null
    extractionConfidence?: number | null
    verified?: boolean
    lat?: number
    lng?: number
  }
  lat: number
  lng: number
  onClose: () => void
}

function SiteModePanel({ feature: p, lat, lng, onClose }: SiteProps) {
  const [cas, setCas] = useState<{ status: 'idle' | 'loading' | 'done' | 'error'; result: CASResult | null }>({ status: 'idle', result: null })

  const isCanadian = lat >= 41 && lat <= 84 && lng >= -141 && lng <= -52

  useEffect(() => {
    if (!isCanadian) return
    setCas({ status: 'loading', result: null })
    fetch(`/api/v1/availability-score?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then((result: CASResult) => setCas({ status: 'done', result }))
      .catch(() => setCas({ status: 'error', result: null }))
  }, [lat, lng, isCanadian])

  const mw = p.mw ?? 0
  const status = p.status ?? 'unknown'
  const statusColor = STATUS_COLORS[status] ?? 'rgba(255,255,255,0.4)'

  // Feasibility check
  const feasibility: FeasibilityResult | null = computeFeasibility({
    capacityMw: mw > 0 ? mw : null,
    status,
    expectedOnlineDate: p.expectedOnlineDate ?? null,
    announcedDate: p.announcedDate ?? null,
  })

  const sourceLabel = SOURCE_LABELS[p.source ?? ''] ?? (p.source ?? 'Unknown')

  return (
    <div style={PANEL_BASE}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '12px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 5 }}>
            {p.name ?? 'Unnamed Project'}
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
            {p.operator && <span>{p.operator}</span>}
            {(p.city || p.state) && (
              <span style={{ color: 'rgba(255,255,255,0.3)' }}>
                {[p.city, p.state].filter(Boolean).join(', ')}
              </span>
            )}
            {p.source && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '1px 6px',
                background: 'rgba(224,123,57,0.15)',
                border: '1px solid rgba(224,123,57,0.4)',
                color: '#E07B39',
              }}>
                {sourceLabel}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4, flexShrink: 0 }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Key Metrics */}
      <div style={{ padding: '12px 14px', flexShrink: 0 }}>
        <div style={LABEL_STYLE}>Key Metrics</div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 10px' }}>
            <div style={LABEL_STYLE}>Capacity</div>
            <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginTop: 2 }}>
              {mw > 0 ? mw.toLocaleString() : '—'}
              {mw > 0 && <span style={{ fontSize: 13, fontWeight: 400, color: 'rgba(255,255,255,0.5)', marginLeft: 3 }}>MW</span>}
            </div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 10px' }}>
            <div style={LABEL_STYLE}>Status</div>
            <div style={{
              fontFamily: '"Barlow Condensed", sans-serif', fontSize: 17, fontWeight: 700,
              color: statusColor, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              {status}
            </div>
          </div>
        </div>
        {(p.expectedOnlineDate || p.announcedDate) && (
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {p.announcedDate && (
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '6px 10px' }}>
                <div style={LABEL_STYLE}>Announced</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                  {new Date(p.announcedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </div>
              </div>
            )}
            {p.expectedOnlineDate && (
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '6px 10px' }}>
                <div style={LABEL_STYLE}>Target Online</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                  {new Date(p.expectedOnlineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                </div>
              </div>
            )}
          </div>
        )}
        {(p.blockReason || p.blockReasonDetail) && (
          <div style={{ marginTop: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', padding: '8px 10px' }}>
            <div style={LABEL_STYLE}>Pipeline Issue</div>
            {p.blockReason && (
              <div style={{ fontSize: 12, color: '#fca5a5', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {p.blockReason.replace(/_/g, ' ')}
              </div>
            )}
            {p.blockReasonDetail && (
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 6, lineHeight: 1.55 }}>
                {p.blockReasonDetail}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Reality Check card */}
      {feasibility && (
        <>
          <SectionDivider label="Reality Check" />
          <div style={{ padding: '10px 14px', flexShrink: 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${VERDICT_COLORS[feasibility.verdict]}44`, padding: '12px 14px' }}>
              {/* Verdict badge */}
              <div style={{
                display: 'inline-block',
                background: `${VERDICT_COLORS[feasibility.verdict]}22`,
                border: `1px solid ${VERDICT_COLORS[feasibility.verdict]}`,
                color: VERDICT_COLORS[feasibility.verdict],
                fontFamily: '"Barlow Condensed", sans-serif',
                fontSize: 18, fontWeight: 700, letterSpacing: '0.08em',
                padding: '4px 12px', marginBottom: 10,
              }}>
                {VERDICT_LABELS[feasibility.verdict]}
              </div>

              {/* Timeline side-by-side */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', padding: '6px 10px' }}>
                  <div style={LABEL_STYLE}>Claimed Online</div>
                  <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                    {feasibility.monthsClaimed}mo
                  </div>
                </div>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', padding: '6px 10px' }}>
                  <div style={LABEL_STYLE}>Realistic Earliest</div>
                  <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 18, fontWeight: 700, color: VERDICT_COLORS[feasibility.verdict], marginTop: 2 }}>
                    {feasibility.monthsRequired}mo
                  </div>
                </div>
              </div>

              {/* Binding constraints */}
              {feasibility.bindingConstraints.length > 0 && (
                <ul style={{ margin: '0 0 8px', paddingLeft: 14, fontSize: 10, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7 }}>
                  {feasibility.bindingConstraints.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}

              {/* Explanation */}
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6, fontStyle: 'italic' }}>
                {feasibility.explanation}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Availability Score (Canadian only) */}
      {isCanadian && (
        <>
          <SectionDivider label="Availability Score" />
          <div style={{ padding: '10px 14px', flexShrink: 0 }}>
            {cas.status === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11, padding: '8px 0' }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 14 }}>⟳</span>
                Computing score…
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
              </div>
            )}
            {cas.status === 'error' && (
              <div style={{ fontSize: 10, color: 'rgba(255,100,100,0.7)', padding: '6px 0' }}>
                Could not load availability score.
              </div>
            )}
            {cas.status === 'done' && cas.result && (() => {
              const r = cas.result
              const gradeColor = GRADE_COLORS[r.grade]
              const dims = [
                { key: 'power',         label: 'Power',         d: r.dimensions.power         },
                { key: 'queue',         label: 'Queue',         d: r.dimensions.queue         },
                { key: 'water',         label: 'Water',         d: r.dimensions.water         },
                { key: 'environment',   label: 'Environment',   d: r.dimensions.environmental },
                { key: 'wildfire',      label: 'Wildfire',      d: r.dimensions.wildfire      },
                { key: 'labor',         label: 'Labor',         d: r.dimensions.labor         },
              ]
              return (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 38, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                      {r.score}
                    </div>
                    <div style={{ background: gradeColor, color: '#fff', fontFamily: '"Barlow Condensed", sans-serif', fontSize: 18, fontWeight: 800, padding: '2px 10px', lineHeight: 1.2 }}>
                      {r.grade}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em' }}>
                      out of 100
                      {r.metadata.province && <div style={{ color: '#E07B39', letterSpacing: '0.08em' }}>{r.metadata.province}</div>}
                    </div>
                  </div>
                  {dims.map(({ key, label, d }, i) => (
                    <MiniDimensionBar
                      key={key}
                      label={label}
                      score={d.score}
                      maxScore={d.maxScore}
                      color={DIM_COLORS[i]}
                      detail={d.detail}
                    />
                  ))}
                </div>
              )
            })()}
          </div>
        </>
      )}

      {/* Source & Verification */}
      <SectionDivider label="Source & Verification" />
      <div style={{ padding: '10px 14px 16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {p.sourceUrl ? (
            <a
              href={p.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 11, color: '#60a5fa', wordBreak: 'break-all', lineHeight: 1.4 }}
            >
              {p.sourceUrl}
            </a>
          ) : (
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>No source URL</div>
          )}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {p.verified && (
              <span style={{
                fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '2px 7px',
                background: 'rgba(34,197,94,0.12)',
                border: '1px solid rgba(34,197,94,0.4)',
                color: '#22c55e',
              }}>
                ✓ Verified
              </span>
            )}
            {p.extractionConfidence != null && (
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                Confidence: {Math.round(p.extractionConfidence * 100)}%
              </span>
            )}
          </div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)' }}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Identify mode — clicked empty space ───────────────────────────────────────

interface IdentifyProps {
  lat: number
  lng: number
  onClose: () => void
}

function IdentifyModePanel({ lat, lng, onClose }: IdentifyProps) {
  const [cas, setCas] = useState<{ status: 'idle' | 'loading' | 'done' | 'error'; result: CASResult | null }>({ status: 'idle', result: null })
  const [queue, setQueue] = useState<{ status: 'idle' | 'loading' | 'done' | 'error'; data: QueueRadiusResponse | null }>({ status: 'idle', data: null })

  const isCanadian = lat >= 41 && lat <= 84 && lng >= -141 && lng <= -52

  useEffect(() => {
    // Queue data
    setQueue({ status: 'loading', data: null })
    fetch(`/api/v1/queue?lat=${lat}&lng=${lng}&radius_km=50`)
      .then(r => r.json())
      .then((data: QueueRadiusResponse) => setQueue({ status: 'done', data }))
      .catch(() => setQueue({ status: 'error', data: null }))

    // CAS (Canadian only)
    if (isCanadian) {
      setCas({ status: 'loading', result: null })
      fetch(`/api/v1/availability-score?lat=${lat}&lng=${lng}`)
        .then(r => r.json())
        .then((result: CASResult) => setCas({ status: 'done', result }))
        .catch(() => setCas({ status: 'error', result: null }))
    }
  }, [lat, lng, isCanadian])

  return (
    <div style={PANEL_BASE}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        padding: '12px 14px 10px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 4 }}>
            What&apos;s Here?
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>
            {lat.toFixed(4)}, {lng.toFixed(4)}
            {isCanadian && <span style={{ marginLeft: 8, color: '#E07B39', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Canada</span>}
          </div>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4, flexShrink: 0 }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Queue section */}
      <SectionDivider label="Queue Radius · 50 km" />
      <div style={{ padding: '10px 14px', flexShrink: 0 }}>
        {queue.status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11, padding: '6px 0' }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 14 }}>⟳</span>
            Loading queue data…
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {queue.status === 'error' && (
          <div style={{ fontSize: 10, color: 'rgba(255,100,100,0.7)' }}>Failed to load queue data.</div>
        )}
        {queue.status === 'done' && queue.data && (() => {
          const { totalMw, rows, medianYearsToCod } = queue.data
          return (
            <div>
              {rows.length === 0 ? (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>No queue projects within 50 km.</div>
              ) : (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 10px' }}>
                      <div style={LABEL_STYLE}>Total MW</div>
                      <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                        {totalMw.toLocaleString()}
                      </div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 10px' }}>
                      <div style={LABEL_STYLE}>Projects</div>
                      <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                        {rows.length}
                      </div>
                    </div>
                    {medianYearsToCod !== null && (
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 10px' }}>
                        <div style={LABEL_STYLE}>Median COD</div>
                        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', marginTop: 2 }}>
                          {medianYearsToCod.toFixed(1)}y
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Top 5 rows */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 160, overflowY: 'auto' }}>
                    {rows.slice(0, 5).map(row => (
                      <div key={row.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 8px', fontSize: 10 }}>
                        <div style={{ fontWeight: 600, color: '#fff', marginBottom: 2, lineHeight: 1.3 }}>{row.projectName}</div>
                        <div style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {row.capacityMw.toLocaleString()} MW · {row.resourceType} · {row.authority}
                        </div>
                      </div>
                    ))}
                    {rows.length > 5 && (
                      <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '4px 0' }}>
                        +{rows.length - 5} more projects
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })()}
      </div>

      {/* CAS (Canadian only) */}
      {isCanadian && (
        <>
          <SectionDivider label="Canadian Availability Score™" />
          <div style={{ padding: '10px 14px 16px', flexShrink: 0 }}>
            {cas.status === 'loading' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11 }}>
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 14 }}>⟳</span>
                Computing CAS…
              </div>
            )}
            {cas.status === 'error' && (
              <div style={{ fontSize: 10, color: 'rgba(255,100,100,0.7)' }}>Could not compute availability score.</div>
            )}
            {cas.status === 'done' && cas.result && (() => {
              const r = cas.result
              const gradeColor = GRADE_COLORS[r.grade]
              const dims = [
                { key: 'power',         label: 'Power',         d: r.dimensions.power         },
                { key: 'queue',         label: 'Queue',         d: r.dimensions.queue         },
                { key: 'water',         label: 'Water',         d: r.dimensions.water         },
                { key: 'environment',   label: 'Environment',   d: r.dimensions.environmental },
                { key: 'wildfire',      label: 'Wildfire',      d: r.dimensions.wildfire      },
                { key: 'labor',         label: 'Labor',         d: r.dimensions.labor         },
              ]
              return (
                <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                    <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 42, fontWeight: 700, color: '#fff', lineHeight: 1 }}>
                      {r.score}
                    </div>
                    <div style={{ background: gradeColor, color: '#fff', fontFamily: '"Barlow Condensed", sans-serif', fontSize: 20, fontWeight: 800, padding: '3px 10px', lineHeight: 1.2 }}>
                      {r.grade}
                    </div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>
                      out of 100
                      {r.metadata.province && <div style={{ color: '#E07B39', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: 2 }}>{r.metadata.province}</div>}
                    </div>
                  </div>
                  {dims.map(({ key, label, d }, i) => (
                    <MiniDimensionBar
                      key={key}
                      label={label}
                      score={d.score}
                      maxScore={d.maxScore}
                      color={DIM_COLORS[i]}
                      detail={d.detail}
                    />
                  ))}
                </div>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}

// ── Public API ────────────────────────────────────────────────────────────────

export interface SiteProfilePanelSiteState {
  mode: 'site'
  // Raw GeoJSON feature properties
  properties: Record<string, unknown>
  lat: number
  lng: number
}

export interface SiteProfilePanelIdentifyState {
  mode: 'identify'
  lat: number
  lng: number
}

export type SiteProfilePanelState = SiteProfilePanelSiteState | SiteProfilePanelIdentifyState

interface SiteProfilePanelProps {
  state: SiteProfilePanelState
  onClose: () => void
}

export default function SiteProfilePanel({ state, onClose }: SiteProfilePanelProps) {
  if (state.mode === 'site') {
    const p = state.properties
    const str = (v: unknown) => (v == null ? undefined : String(v))
    const num = (v: unknown) => (v == null ? undefined : Number(v))
    return (
      <SiteModePanel
        feature={{
          name: str(p.name),
          operator: str(p.operator),
          city: str(p.city),
          state: str(p.state),
          status: str(p.status),
          mw: num(p.mw),
          source: str(p.source),
          sourceUrl: str(p.sourceUrl),
          announcedDate: str(p.announcedDate) ?? null,
          expectedOnlineDate: str(p.expectedOnlineDate) ?? null,
          extractionConfidence: p.extractionConfidence != null ? Number(p.extractionConfidence) : null,
          verified: p.verified === true || p.verified === 'true',
        }}
        lat={state.lat}
        lng={state.lng}
        onClose={onClose}
      />
    )
  }

  return (
    <IdentifyModePanel
      lat={state.lat}
      lng={state.lng}
      onClose={onClose}
    />
  )
}
