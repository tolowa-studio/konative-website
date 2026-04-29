'use client'

import { useState, useRef, useEffect } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'
import type { LayerCategory } from '@/types/map-layers'

// ── types ─────────────────────────────────────────────────────────────────────

export interface DemoViewLayers {
  dc: boolean
  transmission: boolean
  pipelines: boolean
  rail: boolean
  industrial: boolean
  exclusions: boolean
  hotCorridors: boolean
}

interface DemoViewPreset {
  name: string
  description: string
  center: [number, number]
  zoom: number
  layers: DemoViewLayers
}

// ── presets ───────────────────────────────────────────────────────────────────

const PRESETS: DemoViewPreset[] = [
  // ── British Columbia ──────────────────────────────────────────────────────
  {
    name: 'BC — Province Overview',
    description: 'Full-province view — transmission, protected areas, industrial land, indigenous territories',
    center: [-124.5, 54.0],
    zoom: 5.2,
    layers: { dc: true, transmission: true, pipelines: true, rail: true, industrial: true, exclusions: true, hotCorridors: false },
  },
  {
    name: 'BC — Lower Mainland',
    description: 'Metro Vancouver & Fraser Valley — fiber hubs, BC Hydro grid, CN/CP rail, industrial zones',
    center: [-122.4, 49.15],
    zoom: 8.5,
    layers: { dc: true, transmission: true, pipelines: false, rail: true, industrial: true, exclusions: true, hotCorridors: false },
  },
  {
    name: 'BC — Interior Corridor',
    description: 'Cache Creek → Kamloops → Prince George — large parcels, BC Hydro, CN mainline, cool climate',
    center: [-121.5, 51.8],
    zoom: 6.5,
    layers: { dc: false, transmission: true, pipelines: false, rail: true, industrial: true, exclusions: true, hotCorridors: false },
  },
  {
    name: 'BC — Peace River / NE',
    description: 'Fort St John & Site C — NGTL pipelines, clean power surplus, large flat land',
    center: [-120.8, 56.25],
    zoom: 7,
    layers: { dc: false, transmission: true, pipelines: true, rail: true, industrial: true, exclusions: false, hotCorridors: false },
  },
  // ── Alberta ───────────────────────────────────────────────────────────────
  {
    name: 'Alberta Industrial Heartland',
    description: 'Dense energy corridor NE of Edmonton — power, pipelines, industrial',
    center: [-113.2, 53.5],
    zoom: 6.5,
    layers: { dc: true, transmission: true, pipelines: true, rail: true, industrial: true, exclusions: true, hotCorridors: false },
  },
  // ── Ontario / Quebec ──────────────────────────────────────────────────────
  {
    name: 'GTA / Greater Toronto',
    description: 'Ontario grid node — full infra overlay for site selection',
    center: [-79.4, 43.7],
    zoom: 7.5,
    layers: { dc: true, transmission: true, pipelines: true, rail: true, industrial: true, exclusions: true, hotCorridors: false },
  },
  {
    name: 'Quebec Hydro Corridor',
    description: 'Hydro-Québec backbone — power + rail from Montréal to Trois-Rivières',
    center: [-72.5, 46.8],
    zoom: 6,
    layers: { dc: true, transmission: true, pipelines: false, rail: true, industrial: false, exclusions: false, hotCorridors: false },
  },
]

// Map DemoViewLayers → infraEnabled Record<LayerCategory, boolean>
function toInfraEnabled(v: DemoViewLayers): Record<LayerCategory, boolean> {
  return {
    indigenous: true,
    exclusions: v.exclusions,
    'land-use': v.industrial,
    power:      v.transmission,
    gas:        v.pipelines,
    fiber:      v.transmission,
    water:      false,
    climate:    false,
    rail:       v.rail,
  }
}

// ── preset row ────────────────────────────────────────────────────────────────

function PresetRow({ preset, index, isActive, onSelect }: {
  preset: DemoViewPreset
  index: number
  isActive: boolean
  onSelect: (p: DemoViewPreset) => void
}) {
  return (
    <button
      onClick={() => onSelect(preset)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 3,
        width: '100%',
        background: isActive ? 'rgba(224,123,57,0.10)' : 'none',
        border: 'none',
        borderTop: index > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
        cursor: 'pointer',
        padding: '10px 14px',
        textAlign: 'left',
        transition: 'background 0.12s',
      }}
      onMouseEnter={e => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)'
      }}
      onMouseLeave={e => {
        if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'none'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <span style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 13,
          fontWeight: 700,
          color: isActive ? '#E07B39' : '#fff',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          flex: 1,
        }}>
          {preset.name}
        </span>
        {isActive && <span style={{ color: '#E07B39', fontSize: 10, flexShrink: 0 }}>●</span>}
      </div>
      <div style={{
        fontFamily: 'Inter, sans-serif',
        fontSize: 10,
        color: 'rgba(255,255,255,0.4)',
        lineHeight: 1.4,
        letterSpacing: '0.02em',
      }}>
        {preset.description}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
        {Object.entries(preset.layers)
          .filter(([, v]) => v)
          .map(([k]) => (
            <span key={k} style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 8,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#E07B39',
              background: 'rgba(224,123,57,0.12)',
              border: '1px solid rgba(224,123,57,0.25)',
              padding: '1px 5px',
            }}>
              {k}
            </span>
          ))}
      </div>
    </button>
  )
}

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  mapRef: React.RefObject<MapRef | null>
  onApply: (infraEnabled: Record<LayerCategory, boolean>) => void
}

export default function DemoViews({ mapRef, onApply }: Props) {
  const [open, setOpen] = useState(false)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleSelect = (preset: DemoViewPreset) => {
    mapRef.current?.flyTo({
      center: preset.center,
      zoom: preset.zoom,
      duration: 1800,
    })
    onApply(toInfraEnabled(preset.layers))
    setActivePreset(preset.name)
    setOpen(false)
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        zIndex: 10,
        top: 16,
        right: 16,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: open ? 'rgba(224,123,57,0.15)' : 'rgba(8,20,45,0.92)',
          border: `1px solid ${open ? 'rgba(224,123,57,0.5)' : 'rgba(255,255,255,0.12)'}`,
          backdropFilter: 'blur(8px)',
          cursor: 'pointer',
          padding: '8px 14px',
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          transition: 'background 0.15s, border 0.15s',
        }}
      >
        {activePreset ? (
          <span style={{ color: '#E07B39' }}>◉</span>
        ) : (
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>◈</span>
        )}
        Demo Views
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>
          {open ? '▲' : '▾'}
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          background: 'rgba(8,20,45,0.98)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(8px)',
          width: 300,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          maxHeight: 520,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 14px 8px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{
              fontSize: 9,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#E07B39',
              fontFamily: 'Inter, sans-serif',
              marginBottom: 1,
            }}>
              Bookmark Views
            </div>
            <div style={{
              fontFamily: '"Barlow Condensed", sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Pre-set GIS Perspectives
            </div>
          </div>

          {/* Preset list */}
          {PRESETS.map((preset, i) => (
            <PresetRow
              key={preset.name}
              preset={preset}
              index={i}
              isActive={activePreset === preset.name}
              onSelect={handleSelect}
            />
          ))}

          {/* Footer */}
          <div style={{
            padding: '8px 14px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexShrink: 0,
            marginTop: 'auto',
          }}>
            <span style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 9,
              color: 'rgba(255,255,255,0.2)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              Flies map + enables layers
            </span>
            <a
              href="/land/submit"
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                color: '#E07B39',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Submit Land →
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
