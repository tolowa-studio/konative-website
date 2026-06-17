'use client'

import { useMemo } from 'react'

// ── scale computation ─────────────────────────────────────────────────────────
// Standard MapLibre/Mapbox scale formula:
//   meters_per_pixel = (Earth_circumference_m * cos(lat_rad)) / (256 * 2^zoom)
// We then pick a nice round distance and compute how many pixels it spans.

const EARTH_CIRCUMFERENCE_M = 40_075_016.686

function computeScale(zoom: number, lat: number): { km: number; px: number } {
  const latRad = (lat * Math.PI) / 180
  const metersPerPixel =
    (EARTH_CIRCUMFERENCE_M * Math.cos(latRad)) / (256 * Math.pow(2, zoom))

  // Choose a "nice" scale distance
  const targetPx = 100
  const targetMeters = metersPerPixel * targetPx

  // Round to a nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(targetMeters)))
  const candidates = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000].map(c => c * magnitude)
  const niceMeterDist = candidates.reduce((prev, cur) =>
    Math.abs(cur - targetMeters) < Math.abs(prev - targetMeters) ? cur : prev
  )

  const px = niceMeterDist / metersPerPixel
  return { km: niceMeterDist / 1000, px: Math.round(px) }
}

// ── coordinate formatter ──────────────────────────────────────────────────────

function formatCoord(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S'
  const lngDir = lng >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`
}

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  lat: number
  lng: number
  zoom: number
}

export default function MapReadout({ lat, lng, zoom }: Props) {
  const scale = useMemo(() => computeScale(zoom, lat), [zoom, lat])
  const coordStr = formatCoord(lat, lng)
  const scaleLabel = scale.km < 1 ? `${Math.round(scale.km * 1000)} m` : `${scale.km % 1 === 0 ? scale.km : scale.km.toFixed(1)} km`
  const scaleLabelMi = scale.km < 1.6
    ? `${(scale.km * 0.621371).toFixed(2)} mi`
    : `${Math.round(scale.km * 0.621371)} mi`

  return (
    <div style={{
      position: 'absolute',
      zIndex: 10,
      bottom: 40,
      left: 304,
      background: 'rgba(255,255,255,0.92)',
      border: '1px solid rgba(17,24,39,0.12)',
      backdropFilter: 'blur(8px)',
      padding: '8px 12px',
      fontFamily: 'Inter, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      minWidth: 200,
      boxShadow: '0 12px 32px rgba(17,24,39,0.10)',
    }}>
      {/* Row 1: Coordinate */}
      <div style={{
        fontFamily: '"Roboto Mono", "Courier New", monospace',
        fontSize: 11,
        fontWeight: 400,
        color: 'rgba(17,17,17,0.64)',
        letterSpacing: '0.04em',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}>
        {lat === 0 && lng === 0
          ? <span style={{ color: 'rgba(17,17,17,0.34)' }}>Move cursor on map</span>
          : coordStr
        }
      </div>

      {/* Row 2: Zoom + scale bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          fontFamily: '"Barlow Condensed", sans-serif',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: '#C8001F',
          flexShrink: 0,
        }}>
          Z {zoom.toFixed(1)}
        </span>

        {/* Scale bar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ position: 'relative', height: 6 }}>
            {/* Track */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 3,
              height: 1,
              width: '100%',
              background: 'rgba(17,24,39,0.16)',
            }} />
            {/* Filled bar */}
            <div style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: `${Math.min(scale.px, 120)}px`,
              maxWidth: '100%',
              height: 5,
              background: 'rgba(17,24,39,0.52)',
              borderLeft: '2px solid rgba(17,24,39,0.62)',
              borderRight: '2px solid rgba(17,24,39,0.62)',
              borderTop: 'none',
              borderBottom: 'none',
            }} />
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 9,
            color: 'rgba(17,17,17,0.44)',
            letterSpacing: '0.06em',
            display: 'flex',
            gap: 6,
          }}>
            <span>{scaleLabel}</span>
            <span style={{ color: 'rgba(17,17,17,0.24)' }}>·</span>
            <span>{scaleLabelMi}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
