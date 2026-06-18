'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { MapRef } from 'react-map-gl/maplibre'

// ── types ─────────────────────────────────────────────────────────────────────

interface NominatimResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
  address: {
    state?: string
    country?: string
    country_code?: string
  }
}

interface ProjectResult {
  id: string
  name: string
  operator?: string
  city?: string
  state?: string
  lat: number
  lng: number
}

interface SearchResult {
  type: 'place' | 'project'
  id: string
  name: string
  subtitle: string
  lat: number
  lng: number
}

// ── helpers ───────────────────────────────────────────────────────────────────

async function searchNominatim(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return []
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=ca,us&limit=5`
    const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    if (!res.ok) return []
    const data: NominatimResult[] = await res.json()
    return data.map(r => ({
      type: 'place',
      id: `nom-${r.place_id}`,
      name: r.display_name.split(',')[0],
      subtitle: r.display_name.split(',').slice(1, 3).join(',').trim(),
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    }))
  } catch {
    return []
  }
}

async function searchProjects(q: string): Promise<SearchResult[]> {
  if (!q.trim()) return []
  try {
    const res = await fetch('/api/v1/projects')
    if (!res.ok) return []
    const data = await res.json()
    const features: { properties: Record<string, unknown>; geometry: { coordinates: number[] } }[] =
      data?.features ?? []
    const lower = q.toLowerCase()
    return features
      .filter(f => {
        const name = String(f.properties?.name ?? '').toLowerCase()
        const op = String(f.properties?.operator ?? '').toLowerCase()
        return name.includes(lower) || op.includes(lower)
      })
      .slice(0, 5)
      .map(f => {
        const p = f.properties
        const coords = f.geometry.coordinates
        return {
          type: 'project' as const,
          id: `proj-${p.id ?? Math.random()}`,
          name: String(p.name ?? 'Unknown'),
          subtitle: [p.operator, p.city, p.state].filter(Boolean).join(' · '),
          lat: coords[1],
          lng: coords[0],
        }
      })
  } catch {
    return []
  }
}

// ── component ─────────────────────────────────────────────────────────────────

interface Props {
  mapRef: React.RefObject<MapRef | null>
}

export default function MapSearchBar({ mapRef }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([])
      setOpen(false)
      return
    }
    setLoading(true)
    const [places, projects] = await Promise.all([
      searchNominatim(q),
      searchProjects(q),
    ])
    const merged = [...projects, ...places].slice(0, 8)
    setResults(merged)
    setOpen(merged.length > 0)
    setLoading(false)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => runSearch(val), 320)
  }

  const handleSelect = (r: SearchResult) => {
    mapRef.current?.flyTo({ center: [r.lng, r.lat], zoom: 10, duration: 1200 })
    setQuery(r.name)
    setOpen(false)
    setResults([])
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        zIndex: 10,
        top: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: 480,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.94)',
        border: '1px solid rgba(17,24,39,0.12)',
        backdropFilter: 'blur(8px)',
        padding: '0 12px',
        gap: 8,
        boxShadow: '0 12px 32px rgba(17,24,39,0.10)',
      }}>
        <span style={{ color: 'rgba(17,17,17,0.42)', fontSize: 14, flexShrink: 0 }}>⌕</span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search places or projects…"
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: '#111111',
            fontFamily: 'Inter, sans-serif',
            fontSize: 13,
            fontWeight: 400,
            flex: 1,
            padding: '10px 0',
            letterSpacing: '0.02em',
          }}
        />
        {loading && (
          <span style={{ color: '#C8001F', fontSize: 12, flexShrink: 0 }}>●</span>
        )}
        {query && !loading && (
          <button
            onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(17,17,17,0.42)',
              fontSize: 16,
              padding: 2,
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && results.length > 0 && (
        <div style={{
          background: 'rgba(255,255,255,0.98)',
          border: '1px solid rgba(17,24,39,0.12)',
          borderTop: 'none',
          backdropFilter: 'blur(8px)',
          maxHeight: 320,
          overflowY: 'auto',
        }}>
          {results.map((r, i) => (
            <button
              key={r.id}
              onClick={() => handleSelect(r)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                background: 'none',
                border: 'none',
                borderTop: i > 0 ? '1px solid rgba(17,24,39,0.08)' : 'none',
                cursor: 'pointer',
                padding: '9px 14px',
                textAlign: 'left',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,0,31,0.06)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ fontSize: 14, flexShrink: 0, width: 20, textAlign: 'center' }}>
                {r.type === 'project' ? '🏢' : '📍'}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#111111',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {r.name}
                </div>
                {r.subtitle && (
                  <div style={{
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    color: 'rgba(17,17,17,0.48)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {r.subtitle}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 9,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: r.type === 'project' ? '#0ea5e9' : 'rgba(17,17,17,0.36)',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {r.type === 'project' ? 'DC' : 'Place'}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
