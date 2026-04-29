'use client'

import { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Map, Source, Layer, Popup, type MapLayerMouseEvent, type MapRef } from 'react-map-gl/maplibre'
import maplibregl, { type CircleLayerSpecification } from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import type { FeatureCollection, Feature, Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { LayerCategory, LayerManifest, LayerManifestEntry } from '@/types/map-layers'
import type { QueueRadiusResponse, QueueAuthority, QueueResourceType } from '@/types/queue'
import type { CASResult } from '@/lib/availability-score'
import LayerCredits from './LayerCredits'
import AvailabilityScorePanel from './AvailabilityScorePanel'
import SiteProfilePanel, { type SiteProfilePanelState } from './SiteProfilePanel'
import LayerControlPanel from './LayerControlPanel'
import MapSearchBar from './MapSearchBar'
import MapReadout from './MapReadout'
import DemoViews from './DemoViews'

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
  { key: 'indigenous',  label: 'Indigenous Lands',  color: '#2d7a4f' },
  { key: 'exclusions',  label: 'Exclusion Zones',   color: '#dc2626' },
  { key: 'land-use',    label: 'Industrial Land Use', color: '#b45309' },
  { key: 'power',       label: 'Power',              color: '#eab308' },
  { key: 'gas',         label: 'Gas',                color: '#f97316' },
  { key: 'fiber',       label: 'Fiber',              color: '#a855f7' },
  { key: 'water',       label: 'Water',              color: '#38bdf8' },
  { key: 'climate',     label: 'Climate',            color: '#94a3b8' },
  { key: 'rail',        label: 'Rail',               color: '#a16207' },
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
  const mapRef = useRef<MapRef | null>(null)
  const [layerData, setLayerData] = useState<LayerData | null>(propData ?? null)
  const [counts, setCounts]       = useState<MapCounts | null>(propCounts ?? null)
  const [activeLayer, setActiveLayer] = useState<LayerKey | 'all'>('all')
  const [hover, setHover] = useState<{ lng: number; lat: number; props: Record<string, unknown>; layerId?: string } | null>(null)
  // Cursor coordinates for MapReadout (separate from hover popup which only fires on DC dots)
  const [cursorCoord, setCursorCoord] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 })

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

  // Site Profile Panel state (replaces old queue/cas panels for click handling)
  const [profilePanel, setProfilePanel] = useState<SiteProfilePanelState | null>(null)

  // Phase 3 computed layer toggles
  const [showHeatmap, setShowHeatmap] = useState(false)

  // Track map zoom to detect when infra layers need zoom-in
  const [mapZoom, setMapZoom] = useState(3.2)

  // Infrastructure (CA · beta) state
  const [infraManifest, setInfraManifest] = useState<LayerManifest | null>(null)
  const [infraEnabled, setInfraEnabled] = useState<Record<LayerCategory, boolean>>({
    indigenous: true, exclusions: false, 'land-use': false, power: false, gas: false, fiber: false, water: false, climate: false, rail: false,
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
      indigenous: [], exclusions: [], 'land-use': [], power: [], gas: [], fiber: [], water: [], climate: [], rail: [],
    }
    for (const layer of infraManifest?.layers ?? []) {
      // Indigenous layers are shown for all countries; other layers are CA/GLOBAL only
      if (layer.category !== 'indigenous' && layer.country !== 'CA' && layer.country !== 'GLOBAL') continue
      map[layer.category]?.push(layer)
    }
    return map
  }, [infraManifest])

  // Minimum zoom required for any currently-enabled infra layer
  const infraMinZoomNeeded = useMemo(() => {
    let min = 0
    for (const cat of INFRA_CATEGORIES) {
      if (!infraEnabled[cat.key]) continue
      for (const layer of infraLayersByCategory[cat.key]) {
        if (layer.minZoom > min) min = layer.minZoom
      }
    }
    return min
  }, [infraEnabled, infraLayersByCategory])

  const needsZoomIn = infraMinZoomNeeded > 0 && mapZoom < infraMinZoomNeeded

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
    // Always update cursor coordinate for MapReadout
    setCursorCoord({ lat: e.lngLat.lat, lng: e.lngLat.lng })
    const f = e.features?.[0]
    if (!f) return setHover(null)
    const layerId = (f as { layer?: { id?: string } }).layer?.id
    // For polygon features (indigenous lands etc.), anchor popup at cursor
    if (f.geometry.type !== 'Point') {
      setHover({ lng: e.lngLat.lng, lat: e.lngLat.lat, props: f.properties as Record<string, unknown>, layerId })
      return
    }
    const [lng, lat] = (f.geometry as Point).coordinates
    setHover({ lng, lat, props: f.properties as Record<string, unknown>, layerId })
  }, [])

  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    const { lat, lng } = e.lngLat

    if (e.features && e.features.length > 0) {
      // Clicked a DC dot — open Site Profile Panel
      const feature = e.features[0]
      const props = (feature.properties ?? {}) as Record<string, unknown>
      // Extract lat/lng from the feature geometry
      const geom = feature.geometry as { type: string; coordinates: number[] }
      const fLng = geom.type === 'Point' ? geom.coordinates[0] : lng
      const fLat = geom.type === 'Point' ? geom.coordinates[1] : lat
      setProfilePanel({ mode: 'site', properties: props, lat: fLat, lng: fLng })
      // Clear old panels
      setQueuePanel(null)
      setCasPanel(null)
      return
    }

    // Clicked empty space — open Identify panel
    setProfilePanel({ mode: 'identify', lat, lng })
    setQueuePanel(null)
    setCasPanel(null)
  }, [])

  const layerCount = (k: LayerKey | 'all') =>
    k === 'all' ? (counts?.total ?? 0) : (counts?.[k] ?? 0)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', pointerEvents: backgroundMode ? 'none' : undefined }}>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -96, latitude: 45, zoom: 3.2 }}
        mapStyle="https://tiles.openfreemap.org/styles/dark"
        interactiveLayerIds={backgroundMode ? [] : [
          'dc-bubbles',
          ...((['indigenous', 'exclusions', 'land-use'] as LayerCategory[]).flatMap(cat =>
            infraLayersByCategory[cat]
              .filter(() => infraEnabled[cat])
              .map(l => `infra-${l.id}-fill`)
          )),
        ]}
        onMouseMove={backgroundMode ? undefined : onMove}
        onMouseLeave={backgroundMode ? undefined : () => { setHover(null) }}
        onClick={backgroundMode ? undefined : onMapClick}
        onZoom={backgroundMode ? undefined : e => setMapZoom(e.viewState.zoom)}
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
            ? infraLayersByCategory[cat.key].map(layer => {
                const hint = layer.geometryHint ?? 'mixed'
                const showFill   = hint === 'polygon' || hint === 'mixed'
                const showLine   = hint === 'line'    || hint === 'polygon' || hint === 'mixed'
                const showCircle = hint === 'point'   || hint === 'mixed'
                const fillOpacity = cat.key === 'indigenous' ? 0.35
                  : cat.key === 'exclusions' ? 0.28
                  : cat.key === 'land-use'   ? 0.22
                  : 0.18
                return (
                  <Source
                    key={layer.id}
                    id={`infra-${layer.id}`}
                    type="vector"
                    url={`pmtiles://${window.location.origin}${layer.tilesUrl}`}
                    attribution={layer.attribution}
                  >
                    {/* Fill — polygon/multipolygon (water risk, fire zones, protected areas, land use) */}
                    {showFill && (
                      <Layer
                        id={`infra-${layer.id}-fill`}
                        type="fill"
                        source-layer={layer.sourceLayer}
                        minzoom={layer.minZoom}

                        paint={{ 'fill-color': cat.color, 'fill-opacity': fillOpacity }}
                      />
                    )}
                    {/* Line casing — dark underline for path readability */}
                    {showLine && hint === 'line' && (
                      <Layer
                        id={`infra-${layer.id}-line-casing`}
                        type="line"
                        source-layer={layer.sourceLayer}
                        minzoom={layer.minZoom}

                        paint={{
                          'line-color': 'rgba(8,20,45,0.85)',
                          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 3.5, 8, 5, 12, 7],
                          'line-opacity': 0.7,
                        }}
                      />
                    )}
                    {/* Line — linestrings (transmission lines, pipelines, rail) + polygon outlines */}
                    {showLine && (
                      <Layer
                        id={`infra-${layer.id}-line`}
                        type="line"
                        source-layer={layer.sourceLayer}
                        minzoom={layer.minZoom}

                        paint={hint === 'line' ? {
                          'line-color': cat.color,
                          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 1.5, 8, 2.5, 12, 4],
                          'line-opacity': 0.9,
                        } : {
                          'line-color': cat.color,
                          'line-width': 1.5,
                          'line-opacity': 0.6,
                        }}
                      />
                    )}
                    {/* Circle — discrete point geometries (substations, power plants) */}
                    {showCircle && (
                      <Layer
                        id={`infra-${layer.id}-point`}
                        type="circle"
                        source-layer={layer.sourceLayer}
                        minzoom={layer.minZoom}

                        paint={{ 'circle-color': cat.color, 'circle-radius': 6, 'circle-opacity': 0.9, 'circle-stroke-width': 1.5, 'circle-stroke-color': 'rgba(8,20,45,0.7)' }}
                      />
                    )}
                  </Source>
                )
              })
            : []
        )}

        {hover && (
          <Popup longitude={hover.lng} latitude={hover.lat} closeButton={false} offset={14} anchor="top">
            <HoverCard props={hover.props} layerId={hover.layerId} />
          </Popup>
        )}
      </Map>

      {!backgroundMode && <>
      {/* ── GIS Layer Control Panel (left side) ── */}
      <LayerControlPanel
        activeLayer={activeLayer}
        setActiveLayer={setActiveLayer}
        showHeatmap={showHeatmap}
        setShowHeatmap={setShowHeatmap}
        counts={counts}
        infraCategories={INFRA_CATEGORIES}
        infraEnabled={infraEnabled}
        setInfraEnabled={setInfraEnabled}
        infraLayersByCategory={infraLayersByCategory}
        infraManifest={infraManifest}
      />

      {/* ── Search Bar (top center) ── */}
      <MapSearchBar mapRef={mapRef} />

      {/* ── Demo Views (top right) ── */}
      <DemoViews
        mapRef={mapRef}
        onApply={(cfg) => setInfraEnabled(cfg)}
      />

      {/* ── Coordinate / Scale Readout (bottom left) ── */}
      <MapReadout
        lat={cursorCoord.lat}
        lng={cursorCoord.lng}
        zoom={mapZoom}
      />

      {/* Zoom-in hint when infra layers need higher zoom */}
      {needsZoomIn && (
        <div style={{
          position: 'absolute', zIndex: 10, bottom: 80, left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(8,20,45,0.97)', border: '1px solid rgba(224,123,57,0.5)',
          padding: '12px 20px', backdropFilter: 'blur(10px)',
          fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 16,
          boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
        }}>
          <span style={{ color: '#E07B39', fontSize: 20, lineHeight: 1 }}>↑</span>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#E07B39', marginBottom: 4 }}>
              Zoom in to see this layer
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.45)', lineHeight: 1, fontFamily: '"Barlow Condensed", sans-serif' }}>
                  {mapZoom.toFixed(1)}
                </div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Current</div>
              </div>
              <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>→</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#E07B39', lineHeight: 1, fontFamily: '"Barlow Condensed", sans-serif' }}>
                  {infraMinZoomNeeded}+
                </div>
                <div style={{ fontSize: 9, color: 'rgba(224,123,57,0.7)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>Required</div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Site Profile Panel — handles both site clicks and identify (empty space) clicks */}
      {profilePanel && (
        <SiteProfilePanel
          state={profilePanel}
          onClose={() => setProfilePanel(null)}
        />
      )}

      {/* Legacy Phase 4 — Canadian Availability Score™ Panel (shown only if old panels are active without profilePanel) */}
      {!profilePanel && casPanel && casPanel.status === 'done' && casPanel.result && (
        <div style={{ position: 'absolute', right: queuePanel ? 372 : 16, top: 16, bottom: 32, zIndex: 20, width: 320 }}>
          <AvailabilityScorePanel
            result={casPanel.result}
            onClose={() => { setCasPanel(null); setQueuePanel(null) }}
          />
        </div>
      )}
      {!profilePanel && casPanel && casPanel.status === 'loading' && (
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

      {/* Legacy Phase 2 — Interconnection Queue Radius Panel */}
      {!profilePanel && queuePanel && (
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

function HoverCard({ props: p, layerId }: { props: Record<string, unknown>; layerId?: string }) {
  const str = (v: unknown) => String(v ?? '')
  const num = (v: unknown) => Number(v ?? 0)
  const layer = p.layer as LayerKey
  const color = LAYER_COLORS[layer] ?? '#888'

  if (layerId?.includes('indigenous') || layerId?.includes('aiannh')) {
    const name = str(p.NAMELSAD || p.BAND_NAME || p.NAME || p.name || 'Unknown Territory')
    const areaDisplay = p.ALAND
      ? `${(num(p.ALAND) / 1_000_000).toFixed(1)} km²`
      : p.AREA_SQ_KM
        ? `${num(p.AREA_SQ_KM).toFixed(1)} km²`
        : null
    const source = layerId.includes('aiannh') ? 'US Census TIGER/Line' : 'CIRNAC Canada'
    return (
      <div style={{ fontSize: 12, color: '#0C2046', minWidth: 180, maxWidth: 260 }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', lineHeight: 1.2, marginBottom: 4 }}>
          {name}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#2d7a4f', textTransform: 'uppercase', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }}>Indigenous Lands</span>
          {areaDisplay && <span style={{ color: '#777', fontSize: 10 }}>{areaDisplay}</span>}
        </div>
        <div style={{ fontSize: 10, color: '#999', marginTop: 3 }}>{source}</div>
      </div>
    )
  }

  if (layerId?.includes('cpcad') || layerId?.includes('protected')) {
    const name = str(p.NAME || p.NAME_E || p.AICHI_TARGETS || 'Protected Area')
    const desig = str(p.DESIG || p.DESIG_E || p.TYPE || '')
    return (
      <div style={{ fontSize: 12, color: '#0C2046', minWidth: 180, maxWidth: 260 }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', lineHeight: 1.2, marginBottom: 4 }}>
          {name}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#dc2626', textTransform: 'uppercase', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }}>⊘ Exclusion Zone</span>
          {desig && <span style={{ color: '#777', fontSize: 10 }}>{desig}</span>}
        </div>
        <div style={{ fontSize: 10, color: '#999', marginTop: 3 }}>CPCAD · Environment Canada</div>
      </div>
    )
  }

  if (layerId?.includes('industrial')) {
    const name = str(p.name || p.NAME || 'Industrial Zone')
    return (
      <div style={{ fontSize: 12, color: '#0C2046', minWidth: 180, maxWidth: 260 }}>
        <div style={{ fontFamily: '"Barlow Condensed", sans-serif', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', lineHeight: 1.2, marginBottom: 4 }}>
          {name !== 'Industrial Zone' ? name : 'Industrial Land Use'}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ color: '#b45309', textTransform: 'uppercase', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em' }}>Industrial Zoning</span>
        </div>
        <div style={{ fontSize: 10, color: '#999', marginTop: 3 }}>OpenStreetMap · not authoritative zoning</div>
      </div>
    )
  }

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
