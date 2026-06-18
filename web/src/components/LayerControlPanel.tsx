'use client'

import { useState } from 'react'
import type { LayerCategory, LayerManifestEntry } from '@/types/map-layers'
import type { LayerKey, MapCounts, CountryFilter } from './DataCenterMap'
import { LAYER_COLORS, LAYER_LABELS } from './DataCenterMap'

// ── style constants ───────────────────────────────────────────────────────────

const PANEL_BG = 'rgba(255,255,255,0.94)'
const PANEL_BORDER = '1px solid rgba(17,24,39,0.12)'
const BLUR = 'blur(8px)'

const labelStyle: React.CSSProperties = {
  fontSize: 9,
  fontFamily: 'Inter, sans-serif',
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#C8001F',
}

// ── types ─────────────────────────────────────────────────────────────────────

export interface InfraCategory {
  key: LayerCategory
  label: string
  color: string
}

interface Props {
  // DC layer state
  activeLayer: LayerKey | 'all'
  setActiveLayer: (k: LayerKey | 'all') => void
  showHeatmap: boolean
  setShowHeatmap: (v: boolean) => void
  countryFilter: CountryFilter
  setCountryFilter: (v: CountryFilter) => void
  showStalled: boolean
  setShowStalled: (v: boolean) => void
  counts: MapCounts | null

  // Infra state
  infraCategories: InfraCategory[]
  infraEnabled: Record<LayerCategory, boolean>
  setInfraEnabled: React.Dispatch<React.SetStateAction<Record<LayerCategory, boolean>>>
  infraLayersByCategory: Record<LayerCategory, LayerManifestEntry[]>
  infraManifest: { version: number; generatedAt: string; layers: LayerManifestEntry[] } | null

  /** Insight text per category — shown when category is on but data is sparse. */
  categoryInsights?: Partial<Record<LayerCategory, string>>
}

// ── collapsible section ───────────────────────────────────────────────────────

function SectionHeader({
  label,
  expanded,
  onToggle,
  count,
}: {
  label: string
  expanded: boolean
  onToggle: () => void
  count?: number
}) {
  return (
    <button
      onClick={onToggle}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0 6px',
        gap: 6,
      }}
    >
      <span style={{
        fontFamily: '"Barlow Condensed", sans-serif',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: '#C8001F',
      }}>
        {label}
        {count !== undefined && (
          <span style={{ color: 'rgba(17,17,17,0.36)', fontWeight: 400, marginLeft: 6 }}>({count})</span>
        )}
      </span>
      <span style={{ color: 'rgba(17,17,17,0.40)', fontSize: 10 }}>{expanded ? '▾' : '▸'}</span>
    </button>
  )
}

// ── layer row (for infra categories) ─────────────────────────────────────────

function InfraRow({
  cat,
  layers,
  enabled,
  onToggle,
  insight,
}: {
  cat: InfraCategory
  layers: LayerManifestEntry[]
  enabled: boolean
  onToggle: () => void
  insight?: string
}) {
  const [tooltipOpen, setTooltipOpen] = useState<string | null>(null)
  const disabled = layers.length === 0

  return (
    <div>
      {/* Category header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '5px 0',
          borderRadius: 3,
          background: enabled ? `${cat.color}14` : 'transparent',
          border: enabled ? `1px solid ${cat.color}40` : '1px solid transparent',
          paddingLeft: 6,
          paddingRight: 6,
          marginBottom: 2,
          transition: 'background 0.15s, border 0.15s',
        }}
      >
        {/* Color swatch */}
        <span style={{
          width: 10,
          height: 10,
          borderRadius: 2,
          background: cat.color,
          flexShrink: 0,
          opacity: disabled ? 0.25 : 1,
        }} />

        {/* Label */}
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          color: disabled ? 'rgba(17,17,17,0.25)' : enabled ? '#111111' : 'rgba(17,17,17,0.66)',
          flex: 1,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}>
          {cat.label}
        </span>

        {/* Count badge */}
        <span style={{
          fontFamily: 'Inter, sans-serif',
          fontSize: 10,
          color: 'rgba(17,17,17,0.34)',
          flexShrink: 0,
        }}>
          {layers.length}
        </span>

        {/* Eye toggle */}
        <button
          disabled={disabled}
          onClick={onToggle}
          style={{
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: 2,
            color: enabled ? cat.color : 'rgba(17,17,17,0.34)',
            fontSize: 13,
            lineHeight: 1,
            flexShrink: 0,
          }}
          title={enabled ? 'Hide layer' : 'Show layer'}
        >
          {enabled ? '◉' : '○'}
        </button>
      </div>

      {/* Empty-state insight — shown when layer is on but data is sparse */}
      {enabled && insight && (
        <div style={{
          margin: '3px 0 5px 0',
          padding: '7px 10px',
          background: 'rgba(224,123,57,0.08)',
          border: '1px solid rgba(224,123,57,0.25)',
          borderLeft: `3px solid #C8001F`,
        }}>
          <div style={{
            fontSize: 9,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: '#C8001F',
            marginBottom: 4,
          }}>
            Data Insight
          </div>
          <div style={{
            fontSize: 10,
            fontFamily: 'Inter, sans-serif',
            color: 'rgba(17,17,17,0.64)',
            lineHeight: 1.5,
          }}>
            {insight}
          </div>
        </div>
      )}

      {/* Sub-layers (when category is enabled) */}
      {enabled && layers.map(layer => (
        <div
          key={layer.id}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6,
            padding: '3px 4px 3px 20px',
            borderLeft: `2px solid ${cat.color}30`,
            marginLeft: 8,
            marginBottom: 3,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              color: 'rgba(17,17,17,0.58)',
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {layer.title}
            </div>
            <div style={{ fontSize: 9, color: 'rgba(17,17,17,0.34)', marginTop: 1, letterSpacing: '0.04em' }}>
              {layer.attribution}
            </div>
          </div>

          {/* Info icon */}
          <button
            onClick={() => setTooltipOpen(tooltipOpen === layer.id ? null : layer.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(17,17,17,0.34)',
              fontSize: 11,
              padding: 2,
              lineHeight: 1,
              flexShrink: 0,
            }}
            title="Layer info"
          >
            ⓘ
          </button>

          {/* Tooltip */}
          {tooltipOpen === layer.id && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              zIndex: 50,
              background: 'rgba(255,255,255,0.98)',
              border: '1px solid rgba(17,24,39,0.14)',
              padding: '10px 12px',
              width: 230,
              boxShadow: '0 12px 28px rgba(17,24,39,0.14)',
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#111111', marginBottom: 4 }}>{layer.title}</div>
              <div style={{ fontSize: 10, color: 'rgba(17,17,17,0.52)', marginBottom: 6, lineHeight: 1.5 }}>
                {layer.attribution} · {layer.license}
              </div>
              <a
                href={layer.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 10, color: '#C8001F', textDecoration: 'none', display: 'inline-block' }}
              >
                Source data →
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── DC layer row ──────────────────────────────────────────────────────────────

function DcLayerRow({
  layerKey,
  label,
  color,
  count,
  active,
  onClick,
}: {
  layerKey: LayerKey | 'all'
  label: string
  color: string
  count: number
  active: boolean
  onClick: () => void
}) {
  const disabled = count === 0 && layerKey !== 'all'
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        background: active ? `${color}20` : 'transparent',
        border: active ? `1px solid ${color}60` : '1px solid transparent',
        cursor: disabled ? 'not-allowed' : 'pointer',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '5px 6px',
        borderRadius: 3,
        marginBottom: 2,
        transition: 'background 0.15s, border 0.15s',
      }}
      onMouseEnter={e => {
        if (!active && !disabled) {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(17,24,39,0.04)'
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }
      }}
    >
      {layerKey !== 'all' && (
        <span style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: color,
          flexShrink: 0,
          opacity: disabled ? 0.2 : 1,
        }} />
      )}
      {layerKey === 'all' && (
        <span style={{
          width: 8,
          height: 8,
          borderRadius: 2,
          background: color,
          flexShrink: 0,
        }} />
      )}
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        color: disabled ? 'rgba(17,17,17,0.24)' : active ? '#111111' : 'rgba(17,17,17,0.66)',
        flex: 1,
        textAlign: 'left',
      }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 10,
        color: disabled ? 'rgba(17,17,17,0.18)' : 'rgba(17,17,17,0.38)',
        flexShrink: 0,
      }}>
        {count.toLocaleString()}
      </span>
    </button>
  )
}

// ── main panel ────────────────────────────────────────────────────────────────

export default function LayerControlPanel({
  activeLayer,
  setActiveLayer,
  showHeatmap,
  setShowHeatmap,
  countryFilter,
  setCountryFilter,
  showStalled,
  setShowStalled,
  counts,
  infraCategories,
  infraEnabled,
  setInfraEnabled,
  infraLayersByCategory,
  infraManifest,
  categoryInsights = {},
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const [dcExpanded, setDcExpanded] = useState(true)
  const [infraExpanded, setInfraExpanded] = useState(true)

  const layerCount = (k: LayerKey | 'all') =>
    k === 'all' ? (counts?.total ?? 0) : (counts?.[k] ?? 0)

  const hasInfra = (infraManifest?.layers.length ?? 0) > 0

  if (collapsed) {
    return (
      <div style={{
        position: 'absolute',
        zIndex: 10,
        top: 16,
        left: 16,
        width: 40,
        background: PANEL_BG,
        border: PANEL_BORDER,
        backdropFilter: BLUR,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        gap: 6,
      }}>
        <button
          onClick={() => setCollapsed(false)}
          title="Expand layer panel"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#C8001F',
            fontSize: 16,
            padding: 4,
            lineHeight: 1,
          }}
        >
          ⊞
        </button>
        <div style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 9,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'rgba(17,17,17,0.38)',
          marginTop: 4,
        }}>
          Layers
        </div>
      </div>
    )
  }

  return (
    <div
      onWheel={e => e.stopPropagation()}
      style={{
      position: 'absolute',
      zIndex: 10,
      top: 16,
      left: 16,
      width: 280,
      maxHeight: 'calc(100% - 48px)',
      background: PANEL_BG,
      border: PANEL_BORDER,
      backdropFilter: BLUR,
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px 8px',
        borderBottom: '1px solid rgba(17,24,39,0.10)',
        flexShrink: 0,
      }}>
        <div>
          <div style={labelStyle}>Layer Control</div>
          <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontSize: 14,
            fontWeight: 700,
            color: '#111111',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginTop: 2,
          }}>
            Konative GIS
          </div>
        </div>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse panel"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(17,17,17,0.42)',
            fontSize: 16,
            padding: 4,
            lineHeight: 1,
          }}
        >
          ◀
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px 12px' }}>

        {/* ── DATA CENTERS ────────────────────────────────── */}
        <div style={{ borderBottom: '1px solid rgba(17,24,39,0.08)', paddingBottom: 8 }}>
          <SectionHeader
            label="Data Centers"
            expanded={dcExpanded}
            onToggle={() => setDcExpanded(v => !v)}
          />

          {dcExpanded && (
            <div style={{ paddingTop: 2 }}>
              {/* Heatmap toggle */}
              <button
                onClick={() => setShowHeatmap(!showHeatmap)}
                style={{
                  background: showHeatmap ? 'rgba(34,211,238,0.15)' : 'transparent',
                  border: showHeatmap ? '1px solid rgba(34,211,238,0.5)' : '1px solid transparent',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 6px',
                  borderRadius: 3,
                  marginBottom: 2,
                }}
              >
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: '#22d3ee',
                  flexShrink: 0,
                  opacity: showHeatmap ? 1 : 0.5,
                }} />
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  color: showHeatmap ? '#111111' : 'rgba(17,17,17,0.58)',
                  flex: 1,
                  textAlign: 'left',
                }}>
                  DC Heatmap
                </span>
                <span style={{ fontSize: 10, color: showHeatmap ? '#0891b2' : 'rgba(17,17,17,0.32)' }}>
                  {showHeatmap ? 'ON' : 'OFF'}
                </span>
              </button>

              <div style={{ display: 'flex', gap: 4, marginBottom: 8, flexWrap: 'wrap' }}>
                {(['all', 'CA', 'US'] as CountryFilter[]).map((code) => (
                  <button
                    key={code}
                    onClick={() => setCountryFilter(code)}
                    style={{
                      flex: 1,
                      minWidth: 52,
                      padding: '4px 6px',
                      borderRadius: 3,
                      border: countryFilter === code ? '1px solid rgba(200,0,31,0.44)' : '1px solid rgba(17,24,39,0.12)',
                      background: countryFilter === code ? 'rgba(200,0,31,0.08)' : 'transparent',
                      color: countryFilter === code ? '#111111' : 'rgba(17,17,17,0.56)',
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      cursor: 'pointer',
                    }}
                  >
                    {code === 'all' ? 'ALL' : code}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowStalled(!showStalled)}
                style={{
                  background: showStalled ? 'rgba(245,158,11,0.15)' : 'transparent',
                  border: showStalled ? '1px solid rgba(245,158,11,0.5)' : '1px solid transparent',
                  cursor: 'pointer',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '5px 6px',
                  borderRadius: 3,
                  marginBottom: 6,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: 2, background: '#f59e0b', flexShrink: 0, opacity: showStalled ? 1 : 0.5 }} />
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: showStalled ? '#111111' : 'rgba(17,17,17,0.58)', flex: 1, textAlign: 'left' }}>
                  Pipeline Issues (CA)
                </span>
                <span style={{ fontSize: 10, color: showStalled ? '#d97706' : 'rgba(17,17,17,0.32)' }}>
                  {(counts?.projects_stalled ?? 0).toLocaleString()}
                </span>
              </button>

              <DcLayerRow layerKey="all" label="All Layers" color="#C8001F" count={layerCount('all')} active={activeLayer === 'all'} onClick={() => setActiveLayer('all')} />
              {(['projects', 'facilities', 'network', 'power'] as LayerKey[]).map(k => (
                <DcLayerRow
                  key={k}
                  layerKey={k}
                  label={LAYER_LABELS[k]}
                  color={LAYER_COLORS[k]}
                  count={layerCount(k)}
                  active={activeLayer === k}
                  onClick={() => setActiveLayer(k)}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── INFRASTRUCTURE ──────────────────────────────── */}
        {hasInfra && (
          <div style={{ borderBottom: '1px solid rgba(17,24,39,0.08)', paddingBottom: 8 }}>
            <SectionHeader
              label="Overlay Layers"
              expanded={infraExpanded}
              onToggle={() => setInfraExpanded(v => !v)}
              count={infraCategories.filter(c => infraLayersByCategory[c.key].length > 0).length}
            />

            {infraExpanded && (
              <div style={{ paddingTop: 2 }}>
                {infraCategories.map(cat => (
                  <InfraRow
                    key={cat.key}
                    cat={cat}
                    layers={infraLayersByCategory[cat.key]}
                    enabled={infraEnabled[cat.key]}
                    onToggle={() => setInfraEnabled(prev => ({ ...prev, [cat.key]: !prev[cat.key] }))}
                    insight={categoryInsights[cat.key]}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── HOT CORRIDORS (placeholder) ──────────────────── */}
        <div style={{ paddingTop: 6 }}>
          <div style={{
            fontFamily: '"Barlow Condensed", sans-serif',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#C8001F',
            marginBottom: 6,
          }}>
            Hot Corridors
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 8px',
            background: 'rgba(17,24,39,0.03)',
            border: '1px solid rgba(17,24,39,0.08)',
            borderRadius: 3,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: '#C8001F', opacity: 0.3, flexShrink: 0 }} />
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 11,
              color: 'rgba(17,17,17,0.36)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}>
              Coming soon
            </span>
            <span style={{ fontSize: 9, color: 'rgba(17,17,17,0.24)', marginLeft: 'auto', letterSpacing: '0.1em' }}>
              WAVE 2
            </span>
          </div>
        </div>
      </div>

      {/* Footer brand line */}
      <div style={{
        borderTop: '1px solid rgba(17,24,39,0.08)',
        padding: '7px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#C8001F',
          opacity: 0.8,
        }}>
          Konative
        </span>
        <span style={{ color: 'rgba(17,17,17,0.22)', fontSize: 10 }}>·</span>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 9, color: 'rgba(17,17,17,0.38)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          GIS Platform
        </span>
      </div>
    </div>
  )
}
