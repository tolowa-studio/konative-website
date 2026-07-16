'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Map, Source, Layer, type MapLayerMouseEvent, type MapRef } from 'react-map-gl/maplibre'
import type { CircleLayerSpecification, SymbolLayerSpecification } from 'maplibre-gl'
import type { Feature, FeatureCollection, Point } from 'geojson'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/dark'

// ── Camera presets ────────────────────────────────────────────────────────────

type UsStateCode =
  | 'AL' | 'AK' | 'AZ' | 'AR' | 'CA' | 'CO' | 'CT' | 'DE' | 'FL' | 'GA'
  | 'HI' | 'ID' | 'IL' | 'IN' | 'IA' | 'KS' | 'KY' | 'LA' | 'ME' | 'MD'
  | 'MA' | 'MI' | 'MN' | 'MS' | 'MO' | 'MT' | 'NE' | 'NV' | 'NH' | 'NJ'
  | 'NM' | 'NY' | 'NC' | 'ND' | 'OH' | 'OK' | 'OR' | 'PA' | 'RI' | 'SC'
  | 'SD' | 'TN' | 'TX' | 'UT' | 'VT' | 'VA' | 'WA' | 'WV' | 'WI' | 'WY'

type StateCode = 'ALL' | UsStateCode
type Scope = 'governors' | 'tribal-us' | 'tribal-ca' | 'continent'

interface ScopeView {
  code: Scope
  label: string
  longitude: number
  latitude: number
  zoom: number
}

const SCOPES: ScopeView[] = [
  { code: 'governors', label: 'Governors (US)', longitude: -96, latitude: 38, zoom: 3.4 },
  { code: 'tribal-us', label: 'US tribal', longitude: -100, latitude: 40, zoom: 3.4 },
  { code: 'tribal-ca', label: 'Canada First Nations', longitude: -113, latitude: 55, zoom: 3.6 },
  { code: 'continent', label: 'All (continent)', longitude: -100, latitude: 45, zoom: 2.9 },
]

interface StateView {
  code: StateCode
  label: string
  longitude: number
  latitude: number
  zoom: number
}

const STATE_VIEWS: StateView[] = [
  { code: 'ALL', label: 'All states', longitude: -96, latitude: 38, zoom: 3.4 },
  { code: 'AL', label: 'Alabama', longitude: -86.9, latitude: 32.8, zoom: 6 },
  { code: 'AK', label: 'Alaska', longitude: -153, latitude: 64, zoom: 3.5 },
  { code: 'AZ', label: 'Arizona', longitude: -111.7, latitude: 34.2, zoom: 5.5 },
  { code: 'AR', label: 'Arkansas', longitude: -92.4, latitude: 34.8, zoom: 6 },
  { code: 'CA', label: 'California', longitude: -119.4, latitude: 37.2, zoom: 5 },
  { code: 'CO', label: 'Colorado', longitude: -105.5, latitude: 39, zoom: 5.5 },
  { code: 'CT', label: 'Connecticut', longitude: -72.7, latitude: 41.6, zoom: 7.5 },
  { code: 'DE', label: 'Delaware', longitude: -75.5, latitude: 39, zoom: 7.5 },
  { code: 'FL', label: 'Florida', longitude: -82.5, latitude: 28, zoom: 5.8 },
  { code: 'GA', label: 'Georgia', longitude: -83.4, latitude: 32.7, zoom: 6 },
  { code: 'HI', label: 'Hawaii', longitude: -157, latitude: 20.8, zoom: 6 },
  { code: 'ID', label: 'Idaho', longitude: -114.7, latitude: 44.4, zoom: 5.5 },
  { code: 'IL', label: 'Illinois', longitude: -89.4, latitude: 40, zoom: 5.5 },
  { code: 'IN', label: 'Indiana', longitude: -86.1, latitude: 39.8, zoom: 6 },
  { code: 'IA', label: 'Iowa', longitude: -93.2, latitude: 42, zoom: 6 },
  { code: 'KS', label: 'Kansas', longitude: -98.5, latitude: 38.5, zoom: 6 },
  { code: 'KY', label: 'Kentucky', longitude: -84.8, latitude: 37.5, zoom: 6 },
  { code: 'LA', label: 'Louisiana', longitude: -92, latitude: 31, zoom: 6 },
  { code: 'ME', label: 'Maine', longitude: -69, latitude: 45.5, zoom: 6 },
  { code: 'MD', label: 'Maryland', longitude: -76.8, latitude: 39.1, zoom: 7 },
  { code: 'MA', label: 'Massachusetts', longitude: -71.8, latitude: 42.3, zoom: 7 },
  { code: 'MI', label: 'Michigan', longitude: -85, latitude: 44.5, zoom: 5.5 },
  { code: 'MN', label: 'Minnesota', longitude: -94.2, latitude: 46.3, zoom: 5.5 },
  { code: 'MS', label: 'Mississippi', longitude: -89.6, latitude: 32.7, zoom: 6 },
  { code: 'MO', label: 'Missouri', longitude: -92.5, latitude: 38.5, zoom: 6 },
  { code: 'MT', label: 'Montana', longitude: -109.6, latitude: 47, zoom: 5 },
  { code: 'NE', label: 'Nebraska', longitude: -99.8, latitude: 41.5, zoom: 6 },
  { code: 'NV', label: 'Nevada', longitude: -117, latitude: 39, zoom: 5.7 },
  { code: 'NH', label: 'New Hampshire', longitude: -71.5, latitude: 43.7, zoom: 6.5 },
  { code: 'NJ', label: 'New Jersey', longitude: -74.5, latitude: 40.1, zoom: 7 },
  { code: 'NM', label: 'New Mexico', longitude: -106, latitude: 34.4, zoom: 5.5 },
  { code: 'NY', label: 'New York', longitude: -75, latitude: 43, zoom: 5.5 },
  { code: 'NC', label: 'North Carolina', longitude: -79.5, latitude: 35.5, zoom: 6 },
  { code: 'ND', label: 'North Dakota', longitude: -100.5, latitude: 47.5, zoom: 5.5 },
  { code: 'OH', label: 'Ohio', longitude: -82.8, latitude: 40.4, zoom: 6 },
  { code: 'OK', label: 'Oklahoma', longitude: -97.5, latitude: 35.6, zoom: 6 },
  { code: 'OR', label: 'Oregon', longitude: -120.5, latitude: 44, zoom: 5.5 },
  { code: 'PA', label: 'Pennsylvania', longitude: -77.5, latitude: 41, zoom: 6 },
  { code: 'RI', label: 'Rhode Island', longitude: -71.5, latitude: 41.7, zoom: 8 },
  { code: 'SC', label: 'South Carolina', longitude: -80.9, latitude: 33.9, zoom: 6.5 },
  { code: 'SD', label: 'South Dakota', longitude: -100.2, latitude: 44.5, zoom: 6 },
  { code: 'TN', label: 'Tennessee', longitude: -86.3, latitude: 35.8, zoom: 6 },
  { code: 'TX', label: 'Texas', longitude: -99.5, latitude: 31.5, zoom: 5 },
  { code: 'UT', label: 'Utah', longitude: -111.5, latitude: 39.5, zoom: 5.5 },
  { code: 'VT', label: 'Vermont', longitude: -72.6, latitude: 44.1, zoom: 7 },
  { code: 'VA', label: 'Virginia', longitude: -78.5, latitude: 37.5, zoom: 6 },
  { code: 'WA', label: 'Washington', longitude: -120.5, latitude: 47.5, zoom: 6 },
  { code: 'WV', label: 'West Virginia', longitude: -80.5, latitude: 38.7, zoom: 6.5 },
  { code: 'WI', label: 'Wisconsin', longitude: -89.6, latitude: 44.6, zoom: 5.5 },
  { code: 'WY', label: 'Wyoming', longitude: -107.5, latitude: 43, zoom: 5.5 },
]

const STATE_VIEW_BY_CODE = Object.fromEntries(STATE_VIEWS.map((v) => [v.code, v])) as Record<StateCode, StateView>
const QUICK_PICK_STATES: UsStateCode[] = ['OK', 'NV', 'WV', 'FL']
const SELECTABLE_STATES = STATE_VIEWS.filter((v) => v.code !== 'ALL')

// ── Colors ────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  stalled: '#f59e0b',
  canceled: '#ef4444',
  paused: '#a78bfa',
  blocked: '#fb7185',
}

const LIVE_STATUS_COLORS: Record<string, string> = {
  operational: '#10b981',
  construction: '#3b82f6',
  announced: '#94a3b8',
}

const PROJECT_STATUS_COLORS: Record<string, string> = {
  ...LIVE_STATUS_COLORS,
  ...STATUS_COLORS,
}

const TRIBAL_STATUS_COLORS: Record<string, string> = {
  operating: '#10b981',       // green — running
  approved: '#3b82f6',        // blue — Canadian approved / under construction
  feasibility: '#06b6d4',     // teal — studying
  opposition: '#f59e0b',      // amber — pushback (no moratorium yet)
  moratorium: '#ef4444',      // red — blocked
  'stranded-coal': '#a855f7', // purple — opportunity (stranded infra)
}

const GOVERNOR_COLOR = '#22d3ee'

// ── Layer specs ───────────────────────────────────────────────────────────────

const liveLayer: CircleLayerSpecification = {
  id: 'live-projects',
  type: 'circle',
  source: 'live-projects',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['zoom'],
      3, 3,
      6, 6,
      9, 10,
    ],
    'circle-color': [
      'match',
      ['get', 'status'],
      'operational', LIVE_STATUS_COLORS.operational,
      'construction', LIVE_STATUS_COLORS.construction,
      'announced', LIVE_STATUS_COLORS.announced,
      '#9ca3af',
    ],
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#0b0f17',
    'circle-opacity': 0.9,
  },
}

const stalledLayer: CircleLayerSpecification = {
  id: 'stalled-projects',
  type: 'circle',
  source: 'stalled-projects',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['zoom'],
      3, 4,
      6, 7,
      9, 11,
    ],
    'circle-color': [
      'match',
      ['get', 'status'],
      'stalled', STATUS_COLORS.stalled,
      'canceled', STATUS_COLORS.canceled,
      'paused', STATUS_COLORS.paused,
      'blocked', STATUS_COLORS.blocked,
      '#9ca3af',
    ],
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#0b0f17',
    'circle-opacity': 0.95,
  },
}

const governorLayer: CircleLayerSpecification = {
  id: 'governors',
  type: 'circle',
  source: 'governors',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['zoom'],
      3, 8,
      6, 12,
      9, 16,
    ],
    'circle-color': GOVERNOR_COLOR,
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#0b0f17',
    'circle-opacity': 0.85,
  },
}

// Tribal markers as triangle SDF symbols so they're visually distinct from circles.
// Maplibre doesn't ship triangles in default styles, so we use a circle as a halo
// and overlay a smaller circle in the status color, then a maki-style "triangle-stroked"
// glyph through the symbol layer's text-field as a Unicode triangle ▲.
const tribalHaloLayer: CircleLayerSpecification = {
  id: 'tribal-projects-halo',
  type: 'circle',
  source: 'tribal-projects',
  paint: {
    'circle-radius': [
      'interpolate', ['linear'], ['zoom'],
      3, 7,
      6, 11,
      9, 15,
    ],
    'circle-color': [
      'match',
      ['get', 'tribalStatus'],
      'operating', TRIBAL_STATUS_COLORS.operating,
      'approved', TRIBAL_STATUS_COLORS.approved,
      'feasibility', TRIBAL_STATUS_COLORS.feasibility,
      'opposition', TRIBAL_STATUS_COLORS.opposition,
      'moratorium', TRIBAL_STATUS_COLORS.moratorium,
      'stranded-coal', TRIBAL_STATUS_COLORS['stranded-coal'],
      '#9ca3af',
    ],
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#0b0f17',
    'circle-opacity': 0.95,
  },
}

const tribalGlyphLayer: SymbolLayerSpecification = {
  id: 'tribal-projects-glyph',
  type: 'symbol',
  source: 'tribal-projects',
  layout: {
    'text-field': '▲',
    'text-size': [
      'interpolate', ['linear'], ['zoom'],
      3, 8,
      6, 11,
      9, 14,
    ],
    'text-allow-overlap': true,
    'text-ignore-placement': true,
  },
  paint: {
    'text-color': '#0b0f17',
    'text-halo-color': '#0b0f17',
    'text-halo-width': 0.5,
  },
}

// ── Component ─────────────────────────────────────────────────────────────────

interface GovernorProps {
  id: string
  state: string
  stateName: string
  name: string
  party: string
  termEnds: string
  capitalCity: string
  ngaRole: string
  ngaInitiative: string
  dcPolicyNotes: string
  sources: string[]
}

interface ProjectProps {
  id: string
  name: string
  operator: string
  city: string
  state: string
  status: string
  mw: number | null
  blockReason: string
  blockReasonDetail: string
  ownerFunder: string
  relatedSources: string[]
  stalledAt: string | null
}

interface TribalProps {
  id: string
  name: string
  tribe: string
  city: string
  state: string
  country: string
  tribalStatus: string
  partnerStructure: string
  landType: string
  opportunityClass: string
  mw: number | null
  partner: string
  summary: string
  voteOrDate: string
  sources: string[]
}

type Selected =
  | { kind: 'governor'; data: GovernorProps }
  | { kind: 'project'; data: ProjectProps }
  | { kind: 'tribal'; data: TribalProps }
  | null

const EMPTY_FC: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] }

export default function GovernorMapClient() {
  const mapRef = useRef<MapRef | null>(null)

  // Data
  const [governors, setGovernors] = useState<FeatureCollection<Point>>(EMPTY_FC)
  const [live, setLive] = useState<FeatureCollection<Point>>(EMPTY_FC)
  const [stalled, setStalled] = useState<FeatureCollection<Point>>(EMPTY_FC)
  const [tribal, setTribal] = useState<FeatureCollection<Point>>(EMPTY_FC)
  const [loading, setLoading] = useState(true)

  // Layer toggles
  const [showGovernors, setShowGovernors] = useState(true)
  const [showLive, setShowLive] = useState(true)
  const [showOperational, setShowOperational] = useState(false)
  const [showStalled, setShowStalled] = useState(true)
  const [showTribal, setShowTribal] = useState(true)

  // Filters
  const [scope, setScope] = useState<Scope>('continent')
  const [stateView, setStateView] = useState<StateCode>('ALL')

  // Selection
  const [selected, setSelected] = useState<Selected>(null)

  // Load governors / stalled / tribal once; live pipeline reloads when operational toggle flips.
  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/v1/governor-data?type=governors').then((r) => r.json()),
      fetch('/api/v1/governor-data?type=stalled-projects').then((r) => r.json()),
      fetch('/api/v1/governor-data?type=tribal-projects').then((r) => r.json()),
    ])
      .then(([g, s, t]) => {
        if (cancelled) return
        if (g?.type === 'FeatureCollection') setGovernors(g)
        if (s?.type === 'FeatureCollection') setStalled(s)
        if (t?.type === 'FeatureCollection') setTribal(t)
      })
      .catch((e) => console.error('governor-data load', e))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    const q = showOperational
      ? '/api/v1/governor-data?type=live-projects&includeOperational=1'
      : '/api/v1/governor-data?type=live-projects'
    fetch(q)
      .then((r) => r.json())
      .then((l) => {
        if (cancelled) return
        if (l?.type === 'FeatureCollection') setLive(l)
      })
      .catch((e) => console.error('live-projects load', e))
    return () => { cancelled = true }
  }, [showOperational])

  const filterProjectsByState = useCallback((
    collection: FeatureCollection<Point>,
    enabled: boolean,
  ): FeatureCollection<Point> => {
    if (!enabled) return EMPTY_FC
    if (stateView === 'ALL' || scope !== 'governors') return collection
    return {
      type: 'FeatureCollection',
      features: collection.features.filter((f) => f.properties?.state === stateView),
    }
  }, [stateView, scope])

  const filteredLive = useMemo(
    () => filterProjectsByState(live, showLive),
    [live, showLive, filterProjectsByState],
  )

  const filteredStalled = useMemo(
    () => filterProjectsByState(stalled, showStalled),
    [stalled, showStalled, filterProjectsByState],
  )

  const filteredGovernors = useMemo<FeatureCollection<Point>>(() => {
    if (!showGovernors) return EMPTY_FC
    if (stateView === 'ALL' || scope !== 'governors') return governors
    return {
      type: 'FeatureCollection',
      features: governors.features.filter((f) => f.properties?.state === stateView),
    }
  }, [governors, stateView, scope, showGovernors])

  const filteredTribal = useMemo<FeatureCollection<Point>>(() => {
    if (!showTribal) return EMPTY_FC
    if (scope === 'tribal-us') {
      return {
        type: 'FeatureCollection',
        features: tribal.features.filter((f) => f.properties?.country === 'US'),
      }
    }
    if (scope === 'tribal-ca') {
      return {
        type: 'FeatureCollection',
        features: tribal.features.filter((f) => f.properties?.country === 'CA'),
      }
    }
    return tribal
  }, [tribal, scope, showTribal])

  // Active governor for the side card when a state is selected (and on governors scope).
  const activeGovernor = useMemo<GovernorProps | null>(() => {
    if (scope !== 'governors' || stateView === 'ALL') return null
    const f = governors.features.find((f) => f.properties?.state === stateView) as
      | Feature<Point, GovernorProps>
      | undefined
    return f?.properties ?? null
  }, [governors, stateView, scope])

  // Camera flyTo on scope or state change.
  useEffect(() => {
    if (scope === 'governors') {
      const v = STATE_VIEW_BY_CODE[stateView] ?? STATE_VIEW_BY_CODE.ALL
      mapRef.current?.flyTo({
        center: [v.longitude, v.latitude],
        zoom: v.zoom,
        duration: 800,
      })
    } else {
      const v = SCOPES.find((s) => s.code === scope)!
      mapRef.current?.flyTo({
        center: [v.longitude, v.latitude],
        zoom: v.zoom,
        duration: 800,
      })
    }
  }, [stateView, scope])

  // Auto-enable tribal layer when switching to a tribal scope; auto-show all layers
  // on continent.
  useEffect(() => {
    if (scope === 'tribal-us' || scope === 'tribal-ca') {
      setShowTribal(true)
    }
    if (scope === 'continent') {
      setShowTribal(true)
      setShowLive(true)
      setShowStalled(true)
      setShowGovernors(true)
    }
  }, [scope])

  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0]
    if (!feature) {
      setSelected(null)
      return
    }
    const props = feature.properties as Record<string, unknown>
    if (props?.layer === 'governors') {
      setSelected({ kind: 'governor', data: hydrateGovernor(props) })
    } else if (props?.layer === 'live-projects' || props?.layer === 'stalled-projects') {
      setSelected({ kind: 'project', data: hydrateProject(props) })
    } else if (props?.layer === 'tribal-projects') {
      setSelected({ kind: 'tribal', data: hydrateTribal(props) })
    }
  }, [])

  // Build interactive layer ids dynamically (only enabled layers receive clicks).
  const interactiveLayerIds = useMemo<string[]>(() => {
    const ids: string[] = []
    if (showLive) ids.push('live-projects')
    if (showStalled) ids.push('stalled-projects')
    if (showGovernors) ids.push('governors')
    if (showTribal) ids.push('tribal-projects-halo')
    return ids
  }, [showLive, showStalled, showGovernors, showTribal])

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 56px)' }}>
      {/* Top toolbar */}
      <div className="gov-toolbar">
        <div className="gov-toolbar-title">
          <strong>Governor + Tribal Brief</strong>
          <span className="gov-subtitle">
            Live + stalled state DCs · Governors (US) · Tribal / First Nations (US + Canada)
          </span>
        </div>

        {/* Layer toggles */}
        <div className="gov-layer-toggles">
          <label className="gov-toggle">
            <input type="checkbox" checked={showGovernors} onChange={(e) => setShowGovernors(e.target.checked)} />
            <i className="dot" style={{ background: GOVERNOR_COLOR }} />
            Governors
          </label>
          <label className="gov-toggle">
            <input type="checkbox" checked={showLive} onChange={(e) => setShowLive(e.target.checked)} />
            <i className="dot" style={{ background: LIVE_STATUS_COLORS.construction }} />
            Live pipeline
          </label>
          <label className="gov-toggle" title="Adds ~1.4k operational sites — use when zoomed into a state">
            <input
              type="checkbox"
              checked={showOperational}
              onChange={(e) => {
                setShowOperational(e.target.checked)
                if (e.target.checked) setShowLive(true)
              }}
            />
            <i className="dot" style={{ background: LIVE_STATUS_COLORS.operational }} />
            Operational
          </label>
          <label className="gov-toggle">
            <input type="checkbox" checked={showStalled} onChange={(e) => setShowStalled(e.target.checked)} />
            <i className="dot" style={{ background: STATUS_COLORS.stalled }} />
            Stalled DC
          </label>
          <label className="gov-toggle">
            <input type="checkbox" checked={showTribal} onChange={(e) => setShowTribal(e.target.checked)} />
            <i className="tri" style={{ borderBottomColor: TRIBAL_STATUS_COLORS.approved }} />
            Tribal / FN
          </label>
        </div>
      </div>

      {/* Sub-toolbar: scope + state pills */}
      <div className="gov-subtoolbar">
        <div className="gov-scope-pills">
          {SCOPES.map((s) => (
            <button
              key={s.code}
              type="button"
              className={`gov-pill gov-pill-scope ${scope === s.code ? 'gov-pill-active' : ''}`}
              onClick={() => { setScope(s.code); setSelected(null); if (s.code !== 'governors') setStateView('ALL') }}
            >
              {s.label}
            </button>
          ))}
        </div>
        {scope === 'governors' && (
          <div className="gov-state-filter">
            <button
              type="button"
              className={`gov-pill ${stateView === 'ALL' ? 'gov-pill-active' : ''}`}
              onClick={() => { setStateView('ALL'); setSelected(null) }}
            >
              All
            </button>
            {QUICK_PICK_STATES.map((code) => (
              <button
                key={code}
                type="button"
                className={`gov-pill ${stateView === code ? 'gov-pill-active' : ''}`}
                onClick={() => { setStateView(code); setSelected(null) }}
              >
                {code}
              </button>
            ))}
            <select
              className="gov-state-select"
              value={stateView === 'ALL' ? '' : stateView}
              onChange={(e) => {
                const code = e.target.value as UsStateCode
                if (code) {
                  setStateView(code)
                  setSelected(null)
                }
              }}
              aria-label="Select US state"
            >
              <option value="">State…</option>
              {SELECTABLE_STATES.map((v) => (
                <option key={v.code} value={v.code}>{v.code} — {v.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <Map
        ref={(r) => { mapRef.current = r }}
        initialViewState={{ longitude: -100, latitude: 45, zoom: 2.9 }}
        mapStyle={MAP_STYLE}
        interactiveLayerIds={interactiveLayerIds}
        onClick={onMapClick}
        cursor="pointer"
        style={{ width: '100%', height: '100%' }}
      >
        <Source id="live-projects" type="geojson" data={filteredLive}>
          <Layer {...liveLayer} />
        </Source>
        <Source id="stalled-projects" type="geojson" data={filteredStalled}>
          <Layer {...stalledLayer} />
        </Source>
        <Source id="tribal-projects" type="geojson" data={filteredTribal}>
          <Layer {...tribalHaloLayer} />
          <Layer {...tribalGlyphLayer} />
        </Source>
        <Source id="governors" type="geojson" data={filteredGovernors}>
          <Layer {...governorLayer} />
        </Source>
      </Map>

      {/* Legend */}
      <div className="gov-legend">
        <span className="legend-group"><strong>Live DC</strong>
          {Object.entries(LIVE_STATUS_COLORS).map(([k, color]) => (
            <span key={k}><i className="dot" style={{ background: color }} />{k}</span>
          ))}
        </span>
        <span className="legend-group"><strong>Stalled DC</strong>
          {Object.entries(STATUS_COLORS).map(([k, color]) => (
            <span key={k}><i className="dot" style={{ background: color }} />{k}</span>
          ))}
        </span>
        <span className="legend-group"><strong>Tribal</strong>
          {Object.entries(TRIBAL_STATUS_COLORS).map(([k, color]) => (
            <span key={k}><i className="tri" style={{ borderBottomColor: color }} />{k.replace('-', ' ')}</span>
          ))}
        </span>
      </div>

      {/* Counts */}
      <div className="gov-counts">
        {loading ? 'Loading…' : (
          <>
            {filteredLive.features.length} live · {filteredStalled.features.length} stalled · {filteredGovernors.features.length} gov · {filteredTribal.features.length} tribal
          </>
        )}
      </div>

      {/* Governor card (when a single state is selected and nothing else clicked) */}
      {activeGovernor && !selected && (
        <aside className="gov-panel">
          <GovernorCard g={activeGovernor} />
        </aside>
      )}

      {/* Selection panel */}
      {selected && (
        <aside className="gov-panel">
          <button type="button" className="gov-close" onClick={() => setSelected(null)}>×</button>
          {selected.kind === 'governor' ? (
            <GovernorCard g={selected.data} />
          ) : selected.kind === 'project' ? (
            <ProjectCard p={selected.data} />
          ) : (
            <TribalCard t={selected.data} />
          )}
        </aside>
      )}

      <style jsx>{`
        .gov-toolbar {
          position: absolute; top: 12px; left: 12px; right: 12px; z-index: 10;
          display: flex; align-items: center; gap: 12px;
          background: rgba(11, 15, 23, 0.85); backdrop-filter: blur(8px);
          border: 1px solid #1f2937; border-radius: 8px;
          padding: 8px 12px; color: #e5e7eb;
        }
        .gov-toolbar-title { display: flex; flex-direction: column; min-width: 0; }
        .gov-toolbar-title strong { font-size: 14px; }
        .gov-subtitle { font-size: 11px; color: #9ca3af; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .gov-layer-toggles { margin-left: auto; display: flex; gap: 10px; align-items: center; }
        .gov-toggle {
          display: inline-flex; gap: 6px; align-items: center;
          font-size: 12px; color: #e5e7eb; cursor: pointer;
          padding: 4px 8px; border-radius: 6px; background: rgba(31,41,55,0.5);
        }
        .gov-toggle input { margin: 0; cursor: pointer; }
        .gov-toggle .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
        .gov-toggle .tri {
          display: inline-block; width: 0; height: 0;
          border-left: 6px solid transparent; border-right: 6px solid transparent;
          border-bottom: 10px solid #3b82f6;
        }
        .gov-subtoolbar {
          position: absolute; top: 64px; left: 12px; right: 12px; z-index: 10;
          display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
        }
        .gov-scope-pills, .gov-state-filter { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .gov-state-filter { margin-left: auto; }
        .gov-state-select {
          background: rgba(11, 15, 23, 0.85); backdrop-filter: blur(8px);
          border: 1px solid #374151; color: #e5e7eb;
          padding: 4px 8px; border-radius: 999px; font-size: 12px; cursor: pointer;
          max-width: 140px;
        }
        .gov-state-select:focus { outline: 1px solid #22d3ee; border-color: #22d3ee; }
        .gov-pill {
          background: rgba(11, 15, 23, 0.85); backdrop-filter: blur(8px);
          border: 1px solid #374151; color: #e5e7eb;
          padding: 4px 10px; border-radius: 999px; font-size: 12px; cursor: pointer;
        }
        .gov-pill-scope { font-size: 11px; }
        .gov-pill-active { background: #22d3ee; color: #0b0f17; border-color: #22d3ee; }
        .gov-legend {
          position: absolute; left: 12px; bottom: 12px; z-index: 10;
          display: flex; gap: 16px; align-items: center; flex-wrap: wrap;
          background: rgba(11, 15, 23, 0.85); backdrop-filter: blur(8px);
          border: 1px solid #1f2937; border-radius: 6px;
          padding: 6px 10px; color: #e5e7eb; font-size: 11px;
          max-width: calc(100vw - 24px);
        }
        .gov-legend .legend-group { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .gov-legend strong { font-size: 11px; color: #9ca3af; }
        .gov-legend .dot {
          display: inline-block; width: 10px; height: 10px; border-radius: 50%;
          margin-right: 4px; vertical-align: middle;
        }
        .gov-legend .tri {
          display: inline-block; width: 0; height: 0;
          border-left: 5px solid transparent; border-right: 5px solid transparent;
          border-bottom: 9px solid #3b82f6;
          margin-right: 4px; vertical-align: middle;
        }
        .gov-counts {
          position: absolute; right: 12px; bottom: 12px; z-index: 10;
          background: rgba(11, 15, 23, 0.85); backdrop-filter: blur(8px);
          border: 1px solid #1f2937; border-radius: 6px;
          padding: 6px 10px; color: #e5e7eb; font-size: 11px;
        }
        .gov-panel {
          position: absolute; right: 12px; top: 110px; bottom: 56px; z-index: 10;
          width: 380px; max-width: calc(100vw - 24px);
          background: rgba(11, 15, 23, 0.92); backdrop-filter: blur(8px);
          border: 1px solid #1f2937; border-radius: 8px;
          padding: 16px; color: #e5e7eb;
          overflow-y: auto;
        }
        .gov-close {
          position: absolute; top: 8px; right: 10px;
          background: none; border: none; color: #9ca3af; font-size: 22px; cursor: pointer;
          line-height: 1; padding: 2px 6px;
        }
        .gov-close:hover { color: #f3f4f6; }
      `}</style>
    </div>
  )
}

// ── Cards ─────────────────────────────────────────────────────────────────────

function GovernorCard({ g }: { g: GovernorProps }) {
  return (
    <>
      <header>
        <span className="gov-state-badge">{g.state}</span>
        <h3>{g.name}</h3>
        <p className="meta">
          {g.party}{g.termEnds ? ` · ${g.termEnds}` : ''}
        </p>
        {g.capitalCity && <p className="meta">Capital: {g.capitalCity}</p>}
      </header>
      {g.ngaRole && <div className="gov-pill-tag gov-pill-nga">NGA — {g.ngaRole}</div>}
      {g.ngaInitiative && <p className="gov-initiative">{g.ngaInitiative}</p>}
      {g.dcPolicyNotes && (
        <section>
          <h4>DC Policy</h4>
          <p>{g.dcPolicyNotes}</p>
        </section>
      )}
      {g.sources?.length > 0 && (
        <section>
          <h4>Sources</h4>
          <ul>
            {g.sources.map((s, i) => (
              <li key={i}><a href={s} target="_blank" rel="noreferrer">{shortHost(s)}</a></li>
            ))}
          </ul>
        </section>
      )}
      <CardStyles />
    </>
  )
}

function ProjectCard({ p }: { p: ProjectProps }) {
  const statusColor = PROJECT_STATUS_COLORS[p.status] ?? '#9ca3af'
  const isStalledStatus = p.status in STATUS_COLORS
  return (
    <>
      <header>
        <span className="status-pill" style={{ background: statusColor }}>{p.status.toUpperCase()}</span>
        <h3>{p.name}</h3>
        <p className="meta">
          {p.city ? `${p.city}, ${p.state}` : p.state}
          {p.mw ? ` · ${p.mw} MW` : ''}
        </p>
        {p.ownerFunder && <p className="meta">Owner / Funder: <strong>{p.ownerFunder}</strong></p>}
        {p.operator && p.operator !== p.ownerFunder && <p className="meta">Operator: {p.operator}</p>}
        {isStalledStatus && p.stalledAt && <p className="meta">Stalled: {p.stalledAt}</p>}
      </header>
      {isStalledStatus && p.blockReason && (
        <section>
          <h4>Reason: {p.blockReason}</h4>
          {p.blockReasonDetail && <p>{p.blockReasonDetail}</p>}
        </section>
      )}
      {p.relatedSources?.length > 0 && (
        <section>
          <h4>Sources</h4>
          <ul>
            {p.relatedSources.map((s, i) => (
              <li key={i}><a href={s} target="_blank" rel="noreferrer">{shortHost(s)}</a></li>
            ))}
          </ul>
        </section>
      )}
      <CardStyles />
    </>
  )
}

function TribalCard({ t }: { t: TribalProps }) {
  const color = TRIBAL_STATUS_COLORS[t.tribalStatus] ?? '#9ca3af'
  const opportunityLabel: Record<string, string> = {
    'class-1': 'Class 1 — Stranded infra',
    'class-2': 'Class 2 — Orphaned developer',
    'class-3': 'Class 3 — Canada approved',
    'context': 'Context',
  }
  return (
    <>
      <header>
        <span className="status-pill" style={{ background: color }}>{t.tribalStatus.toUpperCase().replace('-', ' ')}</span>
        <span className="country-pill">{t.country}</span>
        <h3>{t.name}</h3>
        <p className="meta tribe-line">{t.tribe}</p>
        <p className="meta">
          {t.city ? `${t.city}, ${t.state}` : t.state}
          {t.mw ? ` · ${t.mw} MW` : ''}
        </p>
        {t.partner && <p className="meta">Partner: <strong>{t.partner}</strong></p>}
        {t.partnerStructure && <p className="meta">{t.partnerStructure}</p>}
        {t.voteOrDate && <p className="meta">Decision: {t.voteOrDate}</p>}
      </header>
      {t.opportunityClass && (
        <div className="gov-pill-tag gov-pill-class">{opportunityLabel[t.opportunityClass] ?? t.opportunityClass}</div>
      )}
      {t.summary && (
        <section>
          <h4>Summary</h4>
          <p>{t.summary}</p>
        </section>
      )}
      {t.sources?.length > 0 && (
        <section>
          <h4>Sources</h4>
          <ul>
            {t.sources.map((s, i) => (
              <li key={i}><a href={s} target="_blank" rel="noreferrer">{shortHost(s)}</a></li>
            ))}
          </ul>
        </section>
      )}
      <CardStyles />
      <style jsx>{`
        .country-pill {
          display: inline-block; padding: 2px 8px; background: #1f2937; color: #9ca3af;
          border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
          margin-left: 6px; vertical-align: top;
        }
        .tribe-line { color: #d1d5db; font-weight: 600; }
      `}</style>
    </>
  )
}

function CardStyles() {
  return (
    <style jsx>{`
      header { margin-bottom: 12px; }
      h3 { margin: 4px 0 0; font-size: 18px; color: #f3f4f6; }
      h4 { font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin: 12px 0 4px; }
      p { font-size: 13px; line-height: 1.5; margin: 4px 0; color: #d1d5db; }
      .meta { font-size: 12px; color: #9ca3af; margin: 2px 0; }
      .gov-state-badge { display: inline-block; padding: 2px 8px; background: #22d3ee; color: #0b0f17; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 0.05em; }
      .status-pill { display: inline-block; padding: 2px 8px; color: #0b0f17; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.05em; }
      .gov-pill-tag { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; margin: 4px 0; }
      .gov-pill-nga { background: #fbbf24; color: #0b0f17; }
      .gov-pill-class { background: #a855f7; color: #fff; }
      .gov-initiative { padding: 10px 12px; background: rgba(251, 191, 36, 0.08); border-left: 3px solid #fbbf24; border-radius: 4px; font-size: 13px; line-height: 1.5; margin: 8px 0; }
      ul { padding-left: 16px; margin: 4px 0; }
      li { font-size: 12px; margin: 2px 0; }
      a { color: #67e8f9; }
      a:hover { text-decoration: underline; }
    `}</style>
  )
}

// ── Hydrators ─────────────────────────────────────────────────────────────────

function hydrateGovernor(p: Record<string, unknown>): GovernorProps {
  return {
    id: String(p.id ?? ''),
    state: String(p.state ?? ''),
    stateName: String(p.stateName ?? ''),
    name: String(p.name ?? ''),
    party: String(p.party ?? ''),
    termEnds: String(p.termEnds ?? ''),
    capitalCity: String(p.capitalCity ?? ''),
    ngaRole: String(p.ngaRole ?? ''),
    ngaInitiative: String(p.ngaInitiative ?? ''),
    dcPolicyNotes: String(p.dcPolicyNotes ?? ''),
    sources: parseStringArray(p.sources),
  }
}

function hydrateProject(p: Record<string, unknown>): ProjectProps {
  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? ''),
    operator: String(p.operator ?? ''),
    city: String(p.city ?? ''),
    state: String(p.state ?? ''),
    status: String(p.status ?? ''),
    mw: typeof p.mw === 'number' ? p.mw : null,
    blockReason: String(p.blockReason ?? ''),
    blockReasonDetail: String(p.blockReasonDetail ?? ''),
    ownerFunder: String(p.ownerFunder ?? ''),
    relatedSources: parseStringArray(p.relatedSources),
    stalledAt: typeof p.stalledAt === 'string' ? p.stalledAt : null,
  }
}

function hydrateTribal(p: Record<string, unknown>): TribalProps {
  return {
    id: String(p.id ?? ''),
    name: String(p.name ?? ''),
    tribe: String(p.tribe ?? ''),
    city: String(p.city ?? ''),
    state: String(p.state ?? ''),
    country: String(p.country ?? ''),
    tribalStatus: String(p.tribalStatus ?? ''),
    partnerStructure: String(p.partnerStructure ?? ''),
    landType: String(p.landType ?? ''),
    opportunityClass: String(p.opportunityClass ?? ''),
    mw: typeof p.mw === 'number' ? p.mw : null,
    partner: String(p.partner ?? ''),
    summary: String(p.summary ?? ''),
    voteOrDate: String(p.voteOrDate ?? ''),
    sources: parseStringArray(p.sources),
  }
}

function parseStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x))
  if (typeof v === 'string') {
    try {
      const parsed = JSON.parse(v)
      return Array.isArray(parsed) ? parsed.map((x) => String(x)) : []
    } catch {
      return []
    }
  }
  return []
}

function shortHost(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
