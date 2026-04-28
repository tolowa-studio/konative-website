'use client'

import { useEffect, useMemo, useState, useCallback } from 'react'
import { Map, Source, Layer, Popup, type MapLayerMouseEvent } from 'react-map-gl/maplibre'
import maplibregl, { type CircleLayerSpecification } from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import type { FeatureCollection, Feature, Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { LayerCategory, LayerManifest, LayerManifestEntry } from '@/types/map-layers'
import type { QueueRadiusResponse, QueueAuthority, QueueResourceType } from '@/types/queue'
import type { CASResult } from '@/lib/availability-score'
import LayerCredits from './LayerCredits'
import AvailabilityScorePanel from './AvailabilityScorePanel'

// ── types ─────────────────────────────────────────────────────────────────────

type Status = 'operational' | 'construction' | 'announced'
export type LayerKey = 'projects' | 'facilities' | 'network' | 'power'

export const STATUS_COLORS: Record<Status, string> = {
  operational: '#22d3ee',
  construction: '#E07B39',
  announced: '#a78bfa',
}

export const LAYER_COLORS: Record<LayerKey, string> = {
  projects:   '#22d3ee',  // cyan  — status-driven but default
  facilities: '#3b82f6',  // blue  — IM3 verified facilities
  network:    '#a855f7',  // purple — PeeringDB colocation
  power:      '#eab308',  // yellow — EIA planned generation
}

export const LAYER_LABELS: Record<LayerKey, string> = {
  projects:   'DC Projects',
  facilities: 'Facilities (IM3)',
  network:    'Network (PeeringDB)',
  power:      'Power Pipeline (EIA)',
}

// Infrastructure (CA · beta) — populated from tiles/v1/manifest.json (Stream A).
const INFRA_CATEGORIES: { key: LayerCategory; label: string; color: string }[] = [
  { key: 'power',   label: 'Power',   color: '#eab308' },
  { key: 'gas',     label: 'Gas',     color: '#f97316' },
  { key: 'fiber',   label: 'Fiber',   color: '#a855f7' },
  { key: 'water',   label: 'Water',   color: '#38bdf8' },
  { key: 'land',    label: 'Land',    color: '#84cc16' },
  { key: 'climate', label: 'Climate', color: '#94a3b8' },
]

export interface MapCounts {
  projects: number
  facilities: number
  network: number
  power: number
  total: number
}

export interface MapStats {
  total: number
  operational: number
  construction: number
  announced: number
  totalMw: number
}

interface LayerData {
  projects: FeatureCollection
  facilities: FeatureCollection
  network: FeatureCollection
  power: FeatureCollection
}

interface Props {
  layerData?: LayerData
  counts?: MapCounts
  backgroundMode?: boolean
}

const SOURCE_LABELS: Record<string, string> = {
  osm: 'OpenStreetMap', wikidata: 'Wikidata',
  news_extraction: 'News', ieso_queue: 'IESO', manual: 'Manual',
  im3: 'IM3 Atlas', peeringdb: 'PeeringDB', eia_860m: 'EIA-860M',
}

// ── helpers ───────────────────────────────────────────────────────────────────

// Assign a colour to every feature based on its layer + status
function colourFeature(f: Feature): Feature {
  const layer = f.properties?.layer as LayerKey | undefined
  const status = f.properties?.status as Status | undefined

  let color: string
  if (layer === 'projects' && status && STATUS_COLORS[status]) {
    color = STATUS_COLORS[status]
  } else {
    color = LAYER_COLORS[layer ?? 'facilities']
  }
  return { ...f, properties: { ...f.properties, _color: color } }
}

// ── component ─────────────────────────────────────────────────────────────────

// Register the pmtiles:// protocol once for the page lifetime.
let _pmtilesProtocolRegistered = false
function ensurePMTilesProtocol() {
  if (_pmtilesProtocolRegistered) return
  const protocol = new Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)
  _pmtilesProtocolRegistered = true
}

export default function DataCenterMap({ layerData: propData, counts: propCounts, backgroundMode }: Props) {
  const [layerData, setLayerData] = useState<LayerData | null>(propData ?? null)
  const [counts, setCounts]       = useState<MapCounts | null>(propCounts ?? null)
  const [activeLayer, setActiveLayer] = useState<LayerKey | 'all'>('all')
  const [hover, setHover] = useState<{ lng: number; lat: number; props: Record<string, unknown> } | null>(null)

  // Phase 2 queue panel state
  const [queuePanel, setQueuePanel] = useState<{
    lat: number; lng: number;
    status: 'loading' | 'done' | 'error';
    data: QueueRadiusResponse | null;
  } | null>(null)

  // Phase 4 — Canadian Availability Score™
  const [casPanel, setCasPanel] = useState<{
    status: 'loading' | 'done' | 'error';
    result: CASResult | null;
  } | null>(null)

  // Phase 3 computed layer toggles
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Infrastructure (CA · beta) state
  const [infraManifest, setInfraManifest] = useState<LayerManifest | null>(null)
  const [infraEnabled, setInfraEnabled] = useState<Record<LayerCategory, boolean>>({
    power: false, gas: false, fiber: false, water: false, land: false, climate: false,
  })

  useEffect(() => { ensurePMTilesProtocol() }, [])

  useEffect(() => {
    fetch('/api/v1/layer-manifest')
      .then(r => r.json())
      .then((m: LayerManifest) => setInfraManifest(m))
      .catch(() => setInfraManifest({ version: 1, generatedAt: new Date(0).toISOString(), layers: [] }))
  }, [])

  const infraLayersByCategory = useMemo(() => {
    const map: Record<LayerCategory, LayerManifestEntry[]> = {
      power: [], gas: [], fiber: [], water: [], land: [], climate: [],
    }
    for (const layer of infraManifest?.layers ?? []) {
      if (layer.country !== 'CA' && layer.country !== 'GLOBAL') continue
      map[layer.category]?.push(layer)
    }
    return map
  }, [infraManifest])

  // Fetch from new endpoint if no data was passed as props
  useEffect(() => {
    if (propData) return
    fetch('/api/v1/map-data')
      .then(r => r.json())
      .then(d => {
        setLayerData(d.layers)
        setCounts(d.counts)
      })
      .catch(() => {
        // Fallback to old projects-only endpoint
        fetch('/api/v1/projects')
          .then(r => r.json())
          .then(d => {
            setLayerData({ projects: d, facilities: { type: 'FeatureCollection', features: [] }, network: { type: 'FeatureCollection', features: [] }, power: { type: 'FeatureCollection', features: [] } })
            setCounts({ projects: d.stats?.total ?? 0, facilities: 0, network: 0, power: 0, total: d.stats?.total ?? 0 })
          })
          .catch(() => {})
      })
  }, [propData])

  // Merge all active layers into one coloured FeatureCollection
  const combined = useMemo<FeatureCollection>(() => {
    if (!layerData) return { type: 'FeatureCollection', features: [] }
    const layers: LayerKey[] = ['projects', 'facilities', 'network', 'power']
    const active = activeLayer === 'all' ? layers : [activeLayer]
    const features = active.flatMap(k => (layerData[k]?.features ?? []).map(colourFeature))
    return { type: 'FeatureCollection', features }
  }, [layerData, activeLayer])


  const circleLayer: CircleLayerSpecification = {
    id: 'dc-bubbles',
    type: 'circle',
    source: 'dc',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['coalesce', ['get', 'mw'], 0],
        0, 6, 50, 10, 250, 16, 1000, 26, 5000, 42,
      ],
      'circle-color': ['get', '_color'],
      'circle-opacity': 0.75,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': 'rgba(12,32,70,0.8)',
    },
  }

  const onMove = useCallback((e: MapLayerMouseEvent) => {
    const f = e.features?.[0]
    if (!f) return setHover(null)
    const [lng, lat] = (f.geometry as Point).coordinates
    setHover({ lng, lat, props: f.properties as Record<string, unknown> })
  }, [])

  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    // Only open panels when clicking empty map space (not a DC bubble)
    if (e.features && e.features.length > 0) return
    const { lat, lng } = e.lngLat

    // Queue panel (Phase 2)
    setQueuePanel({ lat, lng, status: 'loading', data: null })
    fetch(`/api/v1/queue?lat=${lat}&lng=${lng}&radius_km=50`)
      .then(r => r.json())
      .then((data: QueueRadiusResponse) => setQueuePanel(prev => prev ? { ...prev, status: 'done', data } : null))
      .catch(() => setQueuePanel(prev => prev ? { ...prev, status: 'error', data: null } : null))

    // CAS panel (Phase 4) — only for Canadian coordinates
    if (lat >= 41 && lat <= 84 && lng >= -141 && lng <= -52) {
      setCasPanel({ status: 'loading', result: null })
      fetch(`/api/v1/availability-score?lat=${lat}&lng=${lng}`)
        .then(r => r.json())
        .then((result: CASResult) => setCasPanel({ status: 'done', result }))
        .catch(() => setCasPanel({ status: 'error', result: null }))
    }
  }, [])

  const layerCount = (k: LayerKey | 'all') =>
    k === 'all' ? (counts?.total ?? 0) : (counts?.[k] ?? 0)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: backgroundMode ? 'none' : undefined }}>
      <Map
        initialViewState={{ longitude: -96, latitude: 45, zoom: 3.2 }}
        mapStyle="https://tiles.openfreemap.org/styles/dark"
        interactiveLayerIds={backgroundMode ? [] : ['dc-bubbles']}
        onMouseMove={backgroundMode ? undefined : onMove}
        onMouseLeave={backgroundMode ? undefined : () => setHover(null)}
        onClick={backgroundMode ? undefined : onMapClick}
        cursor={backgroundMode ? 'default' : hover ? 'pointer' : 'default'}
        attributionControl={backgroundMode ? false : { compact: true }}
      >
        <Source id="dc" type="geojson" data={combined}>
          {showHeatmap && (
            <Layer
              id="dc-heat"
              type="heatmap"
              maxzoom={9}
              paint={{
                'heatmap-weight': ['interpolate', ['linear'], ['coalesce', ['get', 'mw'], 1], 0, 0, 1000, 1],
                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
                'heatmap-color': ['interpolate', ['linear'], ['heatmap-density'],
                  0, 'rgba(0,0,0,0)',
                  0.2, '#0C2046',
                  0.4, '#22d3ee',
                  0.6, '#E07B39',
                  0.8, '#fff',
                  1, '#fff',
                ],
                'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 20, 9, 40],
                'heatmap-opacity': 0.7,
              }}
            />
          )}
          <Layer {...circleLayer} />
        </Source>


        {/* Infrastructure (CA · beta) PMTiles sources + layers */}
        {INFRA_CATEGORIES.flatMap(cat =>
          infraEnabled[cat.key]
            ? infraLayersByCategory[cat.key].map(layer => (
                <Source
                  key={layer.id}
                  id={`infra-${layer.id}`}
                  type="vector"
                  url={`pmtiles://${layer.tilesUrl}`}
                  attribution={layer.attribution}
                >
                  <Layer
                    id={`infra-${layer.id}-line`}
                    type="line"
                    source-layer={layer.sourceLayer}
                    minzoom={layer.minZoom}
                    maxzoom={layer.maxZoom}
                    paint={{ 'line-color': cat.color, 'line-width': 1.2, 'line-opacity': 0.8 }}
                  />
                  <Layer
                    id={`infra-${layer.id}-point`}
                    type="circle"
                    source-layer={layer.sourceLayer}
                    minzoom={layer.minZoom}
                    maxzoom={layer.maxZoom}
                    paint={{ 'circle-color': cat.color, 'circle-radius': 3, 'circle-opacity': 0.85, 'circle-stroke-width': 0.5, 'circle-stroke-color': 'rgba(8,20,45,0.6)' }}
                  />
                </Source>
              ))
            : []
        )}

        {hover && (
          <Popup longitude={hover.lng} latitude={hover.lat} closeButton={false} offset={14} anchor="top">
            <HoverCard props={hover.props} />
          </Popup>
        )}
      </Map>

      {!backgroundMode && <>
      {/* Layer toggle chips — two rows, all controls in one place */}
      <div style={{ position: 'absolute', zIndex: 10, top: 16, left: 16, display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 'calc(100% - 380px)' }}>
        {/* Row 1: view modes + data layers */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {/* DC Heatmap toggle */}
          <button
            onClick={() => setShowHeatmap(v => !v)}
            style={{
              padding: '6px 12px',
              background: showHeatmap ? '#22d3ee' : 'rgba(8,20,45,0.88)',
              color: showHeatmap ? '#fff' : 'rgba(255,255,255,0.8)',
              border: `1px solid ${showHeatmap ? '#22d3ee' : 'rgba(255,255,255,0.2)'}`,
              fontFamily: 'Inter, sans-serif', fontWeight: 600,
              fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5,
              backdropFilter: 'blur(8px)',
            }}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: showHeatmap ? '#fff' : '#22d3ee', flexShrink: 0 }} />
            DC Heatmap
          </button>
          {(['all', 'projects', 'facilities', 'network', 'power'] as const).map(k => {
            const count = layerCount(k)
            const active = activeLayer === k
            const color = k === 'all' ? '#E07B39' : LAYER_COLORS[k]
            const label = k === 'all' ? 'All Layers' : LAYER_LABELS[k]
            return (
              <button
                key={k}
                onClick={() => setActiveLayer(k)}
                disabled={count === 0 && k !== 'all'}
                style={{
                  padding: '6px 12px',
                  background: active ? color : 'rgba(8,20,45,0.88)',
                  color: active ? '#fff' : count === 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.8)',
                  border: `1px solid ${active ? color : count > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                  fontFamily: 'Inter, sans-serif', fontWeight: 600,
                  fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
                  cursor: count === 0 && k !== 'all' ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 5,
                  backdropFilter: 'blur(8px)',
                }}
              >
                {k !== 'all' && (
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: active ? '#fff' : color, flexShrink: 0, opacity: count === 0 ? 0.25 : 1 }} />
                )}
                {label}
                <span style={{ opacity: 0.65, fontWeight: 400 }}>({count.toLocaleString()})</span>
              </button>
            )
          })}
        </div>

        {/* Row 2: CA Infrastructure toggles (only when manifest has layers) */}
        {(infraManifest?.layers.length ?? 0) > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{
              fontFamily: 'Inter, sans-serif', fontSize: 9, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)',
              paddingRight: 4, alignSelf: 'center',
            }}>
              CA Infra
            </span>
            {INFRA_CATEGORIES.map(cat => {
              const count = infraLayersByCategory[cat.key].length
              const disabled = count === 0
              const active = infraEnabled[cat.key]
              return (
                <button
                  key={cat.key}
                  disabled={disabled}
                  onClick={() => setInfraEnabled(prev => ({ ...prev, [cat.key]: !prev[cat.key] }))}
                  style={{
                    padding: '5px 10px',
                    background: active ? cat.color : 'rgba(8,20,45,0.88)',
                    color: active ? '#fff' : disabled ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)',
                    border: `1px solid ${active ? cat.color : disabled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.15)'}`,
                    fontFamily: 'Inter, sans-serif', fontWeight: 600,
                    fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, flexShrink: 0, opacity: disabled ? 0.25 : 1 }} />
                  {cat.label}
                  <span style={{ opacity: 0.55, fontWeight: 400 }}>({count})</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Empty state */}
      {layerData && combined.features.length === 0 && (
        <div style={{
          position: 'absolute', zIndex: 10, top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(8,20,45,0.9)', border: '1px solid rgba(255,255,255,0.1)',
          padding: '20px 28px', textAlign: 'center', backdropFilter: 'blur(8px)',
        }}>
          <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontSize: 18, fontWeight: 700, color: '#fff', textTransform: 'uppercase', marginBottom: 6 }}>
            No data for this layer yet
          </div>
          <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
            Run the ingestion scripts to populate this layer
          </div>
        </div>
      )}

      <LayerCredits layers={infraManifest?.layers ?? []} />

      {/* Phase 4 — Canadian Availability Score™ Panel */}
      {/* Positioned left of the queue panel (which is at right:16, width:340) */}
      {casPanel && casPanel.status === 'done' && casPanel.result && (
        <div style={{ position: 'absolute', right: queuePanel ? 372 : 16, top: 16, bottom: 32, zIndex: 20, width: 320 }}>
          <AvailabilityScorePanel
            result={casPanel.result}
            onClose={() => { setCasPanel(null); setQueuePanel(null) }}
          />
        </div>
      )}
      {casPanel && casPanel.status === 'loading' && (
        <div style={{
          position: 'absolute', right: queuePanel ? 372 : 16, top: 16, zIndex: 20,
          background: 'rgba(8,20,45,0.88)', border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(8px)', padding: '12px 16px', width: 320,
          fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 16 }}>⟳</span>
          Computing Availability Score…
        </div>
      )}

      {/* Phase 2 — Interconnection Queue Radius Panel */}
      {queuePanel && (
        <QueuePanel
          panel={queuePanel}
          onClose={() => { setQueuePanel(null); setCasPanel(null) }}
        />
      )}

      {/* Stats overlay */}
      {counts && counts.total > 0 && (
        <div style={{
          position: 'absolute', zIndex: 10, bottom: 32, right: 16,
          background: 'rgba(8,20,45,0.88)', padding: '14px 18px',
          border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)',
          fontFamily: 'Inter, sans-serif',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E07B39', marginBottom: 10 }}>
            Data Layers · US + CA
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
            {(['projects', 'facilities', 'network', 'power'] as LayerKey[]).map(k => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: LAYER_COLORS[k], display: 'inline-block', opacity: counts[k] > 0 ? 0.9 : 0.2 }} />
                <span style={{ color: counts[k] > 0 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)' }}>
                  <strong style={{ color: counts[k] > 0 ? '#fff' : 'inherit' }}>{counts[k].toLocaleString()}</strong>
                  {' '}{LAYER_LABELS[k]}
                </span>
              </div>
            ))}
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6 }}>
              {counts.total.toLocaleString()} total records
            </div>
          </div>
        </div>
      )}
      </>}
    </div>
  )
}

// ── queue panel ───────────────────────────────────────────────────────────────

const AUTHORITY_COLORS: Partial<Record<QueueAuthority, string>> = {
  IESO: '#22d3ee',
  AESO: '#f97316',
  HQ:   '#a855f7',
  BCH:  '#38bdf8',
}

const RESOURCE_ICONS: Partial<Record<QueueResourceType, string>> = {
  wind:    '🌬',
  solar:   '☀',
  hydro:   '💧',
  battery: '⚡',
  gas:     '🔥',
  nuclear: '⚛',
}

function QueuePanel({
  panel,
  onClose,
}: {
  panel: { lat: number; lng: number; status: 'loading' | 'done' | 'error'; data: QueueRadiusResponse | null }
  onClose: () => void
}) {
  const panelStyle: React.CSSProperties = {
    position: 'absolute', right: 16, top: 16, bottom: 32, zIndex: 10, width: 340,
    overflowY: 'auto',
    background: 'rgba(8,20,45,0.88)',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    fontFamily: 'Inter, sans-serif',
    display: 'flex', flexDirection: 'column',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#E07B39',
  }

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div>
          <div style={labelStyle}>Queue Radius · 50 km</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
            {panel.lat.toFixed(3)}, {panel.lng.toFixed(3)}
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

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
        {panel.status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, gap: 10, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block', fontSize: 18 }}>⟳</span>
            Loading…
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {panel.status === 'error' && (
          <div style={{ color: 'rgba(255,100,100,0.8)', fontSize: 12, marginTop: 16 }}>
            Failed to load queue data.
          </div>
        )}

        {panel.status === 'done' && panel.data && (() => {
          const { totalMw, countByAuthority, medianYearsToCod, rows } = panel.data
          const sorted = [...rows].sort((a, b) => {
            // distance is not pre-computed in the response; sort by id as proxy if no distanceKm field
            const da = (a as { distanceKm?: number }).distanceKm ?? 0
            const db = (b as { distanceKm?: number }).distanceKm ?? 0
            return da - db
          })
          return (
            <>
              {rows.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 16 }}>
                  No queue projects within 50 km.
                </div>
              ) : (
                <>
                  {/* Summary stats */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 10px' }}>
                      <div style={labelStyle}>Total MW</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 2 }}>{totalMw.toLocaleString()}</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 10px' }}>
                      <div style={labelStyle}>Projects</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 2 }}>{rows.length}</div>
                    </div>
                    {medianYearsToCod !== null && (
                      <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '8px 10px' }}>
                        <div style={labelStyle}>Median COD</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 2 }}>{medianYearsToCod.toFixed(1)}y</div>
                      </div>
                    )}
                  </div>

                  {/* By authority */}
                  {Object.keys(countByAuthority).length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ ...labelStyle, marginBottom: 6 }}>By Authority</div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {(Object.entries(countByAuthority) as [QueueAuthority, number][]).map(([auth, cnt]) => (
                          <span key={auth} style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
                            padding: '3px 8px',
                            background: `${AUTHORITY_COLORS[auth] ?? '#6b7280'}22`,
                            border: `1px solid ${AUTHORITY_COLORS[auth] ?? '#6b7280'}`,
                            color: AUTHORITY_COLORS[auth] ?? '#9ca3af',
                          }}>
                            {auth} · {cnt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Project rows */}
                  <div style={labelStyle as React.CSSProperties}>Projects · Closest First</div>
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {sorted.map(row => {
                      const authColor = AUTHORITY_COLORS[row.authority] ?? '#6b7280'
                      const icon = RESOURCE_ICONS[row.resourceType] ?? '●'
                      const distKm = (row as { distanceKm?: number }).distanceKm
                      return (
                        <div key={row.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '8px 10px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#fff', lineHeight: 1.3, flex: 1 }}>{row.projectName}</div>
                            <span style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
                              padding: '2px 6px', flexShrink: 0,
                              background: `${authColor}22`,
                              border: `1px solid ${authColor}`,
                              color: authColor,
                            }}>{row.authority}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>{row.capacityMw.toLocaleString()} MW</span>
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>{icon} {row.resourceType}</span>
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.studyPhase.replace(/_/g, ' ')}</span>
                            {distKm !== undefined && (
                              <span style={{ fontSize: 10, color: '#E07B39', marginLeft: 'auto' }}>{distKm.toFixed(0)} km</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </>
          )
        })()}
      </div>
    </div>
  )
}

// ── hover popup ───────────────────────────────────────────────────────────────

function HoverCard({ props: p }: { props: Record<string, unknown> }) {
  const str = (v: unknown) => String(v ?? '')
  const num = (v: unknown) => Number(v ?? 0)
  const layer = p.layer as LayerKey
  const color = LAYER_COLORS[layer] ?? '#888'

  return (
    <div style={{ fontSize: 12, color: '#0C2046', minWidth: 200, maxWidth: 280 }}>
      <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 15, textTransform: 'uppercase', marginBottom: 2, lineHeight: 1.2 }}>
        {str(p.name) || 'Unknown'}
      </div>

      {layer === 'projects' && (
        <>
          {p.operator && <div style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>{str(p.operator)}</div>}
          {(p.city || p.state) && <div style={{ color: '#777', fontSize: 11, marginBottom: 6 }}>{[str(p.city), str(p.state)].filter(Boolean).join(', ')}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {num(p.mw) > 0 && <span style={{ fontWeight: 700 }}>{num(p.mw).toLocaleString()} MW</span>}
            {!!p.status && <span style={{ color: STATUS_COLORS[p.status as Status] ?? color, textTransform: 'uppercase', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }}>{str(p.status)}</span>}
            <span style={{ color: '#999', fontSize: 10 }}>{SOURCE_LABELS[str(p.source)] ?? str(p.source)}</span>
          </div>
        </>
      )}

      {layer === 'facilities' && (
        <>
          {p.operator && <div style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>{str(p.operator)}</div>}
          {(p.city || p.state) && <div style={{ color: '#777', fontSize: 11, marginBottom: 6 }}>{[str(p.city), str(p.state)].filter(Boolean).join(', ')}</div>}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ color, textTransform: 'uppercase', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }}>IM3 Atlas</span>
            {!!p.sqft && <span style={{ color: '#777', fontSize: 10 }}>{num(p.sqft).toLocaleString()} sqft</span>}
          </div>
        </>
      )}

      {layer === 'network' && (
        <>
          {p.org_name && <div style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>{str(p.org_name)}</div>}
          {(p.city || p.state) && <div style={{ color: '#777', fontSize: 11, marginBottom: 6 }}>{[str(p.city), str(p.state)].filter(Boolean).join(', ')}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {num(p.net_count) > 0 && <span style={{ fontWeight: 600, fontSize: 11 }}>{num(p.net_count)} networks</span>}
            {num(p.ix_count) > 0 && <span style={{ color: '#777', fontSize: 10 }}>{num(p.ix_count)} IXPs</span>}
            <span style={{ color, textTransform: 'uppercase', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }}>PeeringDB</span>
          </div>
        </>
      )}

      {layer === 'power' && (
        <>
          {p.utilityName && <div style={{ color: '#555', fontSize: 11, marginBottom: 4 }}>{str(p.utilityName)}</div>}
          {(p.county || p.state) && <div style={{ color: '#777', fontSize: 11, marginBottom: 6 }}>{[str(p.county), str(p.state)].filter(Boolean).join(', ')}</div>}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {num(p.mw) > 0 && <span style={{ fontWeight: 700 }}>{num(p.mw).toLocaleString()} MW</span>}
            {!!p.technology && <span style={{ color: '#777', fontSize: 10 }}>{str(p.technology)}</span>}
            {!!p.plannedYear && <span style={{ color, fontWeight: 600, fontSize: 10 }}>Est. {str(p.plannedYear)}</span>}
          </div>
        </>
      )}
    </div>
  )
}
