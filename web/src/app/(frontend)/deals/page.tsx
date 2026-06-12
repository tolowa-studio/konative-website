'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Deal {
  id: string
  name: string
  entity: string
  type: string
  size: string
  status: 'ACTIVE' | 'ANNOUNCED' | 'CLOSED'
  geography: string
  description?: string
}


// API response shape from /api/v1/deals (Supabase rows)
interface ApiDeal {
  id: string
  entity_name: string | null
  deal_type: string | null
  deal_value_usd: number | null
  status: string | null
  partner_companies: string[] | null
  us_locations: string[] | null
  summary: string | null
  category: string | null
  power_capacity_mw: number | null
}

function formatUsd(v: number | null): string {
  if (!v) return '—'
  if (v >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1)}B`
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(0)}M`
  return `$${v.toLocaleString()}`
}

function mapApiDealToUi(d: ApiDeal): Deal {
  const statusRaw = (d.status || 'ACTIVE').toUpperCase()
  const status: Deal['status'] =
    statusRaw === 'ANNOUNCED' ? 'ANNOUNCED'
    : statusRaw === 'CLOSED' ? 'CLOSED'
    : 'ACTIVE'

  const partners = d.partner_companies?.join(' / ') ?? ''
  const locations = d.us_locations?.join(', ') ?? 'North America'

  return {
    id: d.id,
    name: d.entity_name || 'Unnamed deal',
    entity: partners || d.entity_name || '—',
    type: (d.deal_type || d.category || 'Development').replace(/_/g, ' '),
    size: formatUsd(d.deal_value_usd),
    status,
    geography: locations,
    description: d.summary ?? undefined,
  }
}
const statusColor = (s: string) =>
  s === 'ACTIVE' ? '#22c55e' : s === 'ANNOUNCED' ? '#D97706' : '#888888'

const PLACEHOLDER_DEALS: Deal[] = [
  {
    id: '1',
    name: 'Project Northstar',
    entity: 'CPPIB / Digital Bridge',
    type: 'Sovereign Wealth',
    size: '$3.4B',
    status: 'ACTIVE',
    geography: 'Ontario, Canada',
    description:
      'Multi-site data center development across three Ontario municipalities. Powered land acquisition with 230kV substation access and confirmed interconnection queue position.',
  },
  {
    id: '2',
    name: 'Cascade Power Build',
    entity: 'Blackstone Infrastructure',
    type: 'Infrastructure',
    size: '$780M',
    status: 'ANNOUNCED',
    geography: 'Pacific Northwest, USA',
    description:
      'Hyperscale-adjacent powered land targeting CAISO interconnection queue positions. Ground lease structure with 500kV transmission access.',
  },
  {
    id: '3',
    name: 'Mesa Verde AI Park',
    entity: 'Undisclosed SWF',
    type: 'Sovereign Wealth',
    size: '$1.2B',
    status: 'ACTIVE',
    geography: 'Texas, USA',
    description:
      'AI-focused data center campus adjacent to ERCOT substation. 1,200-acre parcel with confirmed 400MW capacity and water rights secured.',
  },
  {
    id: '4',
    name: 'Ridgeline Series A',
    entity: 'Emerging Markets Dev Corp',
    type: 'Development',
    size: '$120M',
    status: 'ANNOUNCED',
    geography: 'Alberta, Canada',
    description:
      'Data center land development with provincial economic development mandate. Transmission-ready parcel with confirmed fiber path and zoning certainty.',
  },
  {
    id: '5',
    name: 'Atlantic Gateway',
    entity: 'Macquarie Asset Mgmt',
    type: 'Infrastructure',
    size: '$2.1B',
    status: 'ACTIVE',
    geography: 'Eastern Seaboard, USA',
    description:
      'Multi-region powered land portfolio targeting ISONE and PJM interconnection queue positions across the Eastern Seaboard.',
  },
]

const TABS = ['ALL', 'SOVEREIGN WEALTH', 'INFRASTRUCTURE', 'DEVELOPMENT', 'HYPERSCALE']

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('ALL')
  const [openDeal, setOpenDeal] = useState<string | null>(null)
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [hoveredCta, setHoveredCta] = useState(false)

  useEffect(() => {
    fetch('/api/v1/deals')
      .then(r => r.json())
      .then(d => {
        const rows: ApiDeal[] = d.deals || d.data || d || []
        setDeals(rows.map(mapApiDealToUi))
        setLoading(false)
      })
      .catch(() => {
        setDeals(PLACEHOLDER_DEALS)
        setLoading(false)
      })
  }, [])

  const displayDeals = deals.length > 0 ? deals : PLACEHOLDER_DEALS
  const filtered =
    activeTab === 'ALL'
      ? displayDeals
      : displayDeals.filter(d =>
          d.type
            .toUpperCase()
            .replace(/\s+/g, ' ')
            .includes(activeTab.replace(/\s+/g, ' ')),
        )

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#FFFFFF', minHeight: '100vh' }}>
      {/* Page Header */}
      <div style={{ background: '#0C2046', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 500,
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              color: '#C8001F',
              marginBottom: 16,
              margin: '0 0 16px',
            }}
          >
            DEAL FLOW
          </p>
          <h1
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(48px, 7vw, 88px)',
              lineHeight: 0.92,
              textTransform: 'uppercase',
              color: '#FFFFFF',
              letterSpacing: '0.01em',
              margin: '0 0 0',
            }}
          >
            TRACK THE{' '}
            <span style={{ color: '#C8001F' }}>CAPITAL</span>
            <br />
            MOVING INTO NORTH AMERICAN DATA CENTER.
          </h1>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: 24,
              flexWrap: 'wrap',
              marginTop: 16,
            }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 16,
                color: 'rgba(255,255,255,0.55)',
                maxWidth: 560,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Live deal flow tracking across sovereign wealth, infrastructure, and development
              capital entering the North American data center land market.
            </p>
            <p
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 700,
                fontSize: 18,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.4)',
                margin: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {displayDeals.length} Active Deals · $7.6B+ Tracked
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs + Table Section */}
      <div style={{ background: '#F2F0EB', paddingBottom: 120 }}>
        {/* Filter Tabs Bar */}
        <div
          style={{
            background: '#fff',
            borderBottom: '1px solid #E0DDD8',
            padding: '0 32px',
          }}
        >
          <div
            style={{
              maxWidth: 1280,
              margin: '0 auto',
              display: 'flex',
              flexDirection: 'row',
            }}
          >
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  padding: '14px 20px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  marginBottom: -1,
                  color: activeTab === tab ? '#C8001F' : '#555',
                  borderBottom:
                    activeTab === tab ? '2px solid #C8001F' : '2px solid transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 32px' }}>
          {loading ? (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 15,
                color: '#888',
                padding: '40px 0',
                textAlign: 'center',
              }}
            >
              Loading deals...
            </p>
          ) : (
            <>
              {/* Table */}
              <div
                style={{
                  background: 'white',
                  border: '1px solid #E0DDD8',
                  borderTop: 'none',
                }}
              >
                {/* Table Header */}
                <div
                  style={{
                    background: '#F2F0EB',
                    borderBottom: '1px solid #E0DDD8',
                    padding: '12px 24px',
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
                    gap: 0,
                  }}
                >
                  {['Deal / Entity', 'Type', 'Size', 'Geography', 'Status', ''].map(col => (
                    <div
                      key={col}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 600,
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.15em',
                        color: '#666',
                      }}
                    >
                      {col}
                    </div>
                  ))}
                </div>

                {/* Data Rows */}
                {filtered.map((deal, i) => (
                  <div key={deal.id}>
                    <div
                      onClick={() => setOpenDeal(openDeal === deal.id ? null : deal.id)}
                      onMouseEnter={() => setHoveredRow(deal.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 80px',
                        padding: '20px 24px',
                        borderBottom: '1px solid #E0DDD8',
                        cursor: 'pointer',
                        background:
                          hoveredRow === deal.id || openDeal === deal.id
                            ? '#FAFAF8'
                            : i % 2 === 0
                              ? '#fff'
                              : '#FDFCFA',
                      }}
                    >
                      {/* Deal Name + Entity */}
                      <div>
                        <span
                          style={{
                            fontFamily: "'Barlow Condensed', sans-serif",
                            fontWeight: 700,
                            fontSize: 18,
                            textTransform: 'uppercase',
                            color: '#111',
                            letterSpacing: '0.02em',
                            display: 'block',
                          }}
                        >
                          {deal.name}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12,
                            color: '#888',
                            marginTop: 2,
                            display: 'block',
                          }}
                        >
                          {deal.entity}
                        </span>
                      </div>

                      {/* Type */}
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          color: '#555',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {deal.type}
                      </div>

                      {/* Size */}
                      <div
                        style={{
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: 700,
                          fontSize: 20,
                          color: '#111',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {deal.size}
                      </div>

                      {/* Geography */}
                      <div
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          color: '#555',
                          display: 'flex',
                          alignItems: 'center',
                        }}
                      >
                        {deal.geography}
                      </div>

                      {/* Status */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div
                          style={{
                            width: 6,
                            height: 6,
                            background: statusColor(deal.status),
                            borderRadius: '50%',
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontWeight: 600,
                            fontSize: 11,
                            letterSpacing: '0.08em',
                            color: statusColor(deal.status),
                          }}
                        >
                          {deal.status}
                        </span>
                      </div>

                      {/* Expand Indicator */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12,
                            color: '#aaa',
                            display: 'inline-block',
                            transform: openDeal === deal.id ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s',
                          }}
                        >
                          ▾
                        </span>
                      </div>
                    </div>

                    {/* Accordion Panel */}
                    {openDeal === deal.id && (
                      <div
                        style={{
                          padding: '24px 24px 32px',
                          background: '#F2F0EB',
                          borderBottom: '1px solid #E0DDD8',
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 14,
                            lineHeight: 1.7,
                            color: '#444',
                            maxWidth: 640,
                            margin: 0,
                          }}
                        >
                          {deal.description || 'No additional details available.'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Table Summary Row */}
              <div
                style={{
                  padding: '16px 24px',
                  background: '#F2F0EB',
                  border: '1px solid #E0DDD8',
                  borderTop: 'none',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: '#888',
                  }}
                >
                  Showing {filtered.length} of {displayDeals.length} deals
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{ background: '#0C2046', padding: '64px 32px' }}>
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
          }}
        >
          {[
            { number: '$7.6B+', label: 'Total Capital Tracked' },
            { number: '5', label: 'Active Deals' },
            { number: '3', label: 'Deal Types Monitored' },
          ].map((stat, i) => (
            <div
              key={stat.label}
              style={{
                textAlign: 'center',
                padding: 32,
                borderRight:
                  i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <div
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontWeight: 800,
                  fontSize: 52,
                  color: '#FFFFFF',
                  lineHeight: 1,
                }}
              >
                {stat.number}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 500,
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.15em',
                  color: 'rgba(255,255,255,0.5)',
                  marginTop: 8,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div
        style={{
          background: '#fff',
          padding: '80px 32px',
          borderTop: '1px solid #E0DDD8',
        }}
      >
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(40px, 5vw, 64px)',
              textTransform: 'uppercase',
              color: '#111',
              lineHeight: 0.92,
              marginBottom: 20,
              margin: '0 0 20px',
            }}
          >
            TRACK DEALS BEFORE
            <br />
            THEY&apos;RE{' '}
            <span style={{ color: '#C8001F' }}>PUBLIC KNOWLEDGE.</span>
          </h2>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 15,
              lineHeight: 1.7,
              color: '#555',
              maxWidth: 560,
              margin: '0 auto 32px',
            }}
          >
            Konative tracks sovereign wealth, infrastructure, and development capital moving
            into North American powered land and data center development — before it hits the trade press.
          </p>
          <Link
            href="/contact"
            onMouseEnter={() => setHoveredCta(true)}
            onMouseLeave={() => setHoveredCta(false)}
            style={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: 13,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              background: hoveredCta ? '#c96a28' : '#C8001F',
              color: '#FFFFFF',
              padding: '20px 48px',
              textDecoration: 'none',
              display: 'inline-block',
              transition: 'background 0.15s',
            }}
          >
            REQUEST DEAL INTELLIGENCE ACCESS
          </Link>
        </div>
      </div>
    </div>
  )
}
