import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 3600;

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Data Center Projects | Konative',
  description: 'Browse data center facilities scored by power, water, and fiber infrastructure proximity. Konative tracks active and planned data centers across all major US markets.',
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const STATUS_COLORS: Record<string, string> = {
  operational: '#22c55e',
  construction: '#f59e0b',
  announced: '#3b82f6',
  planned: '#8b5cf6',
  decommissioned: '#6b7280',
}

type ScoreRow = {
  id: number
  name: string
  state: string | null
  status: string | null
  availability_score: number
  power_score: number
  water_score: number
  fiber_score: number
}

export default async function ProjectsPage() {
  const { data, error } = await supabase
    .from('dc_availability_scores')
    .select('id,name,state,status,availability_score,power_score,water_score,fiber_score')
    .order('availability_score', { ascending: false })
    .limit(500)

  const rows: ScoreRow[] = (error || !data) ? [] : data as ScoreRow[]

  // group by state
  const byState: Record<string, ScoreRow[]> = {}
  for (const r of rows) {
    const key = r.state ?? 'Other'
    if (!byState[key]) byState[key] = []
    byState[key].push(r)
  }
  const states = Object.keys(byState).sort()

  return (
    <div style={{ background: '#0b1020', minHeight: '100vh', color: '#f6f7fb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero */}
      <div style={{ borderBottom: '1px solid #1e293b', padding: '3rem 2rem 2rem' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#64748b', marginBottom: '0.5rem' }}>
            Infrastructure Intelligence
          </p>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 800, margin: '0 0 0.75rem', letterSpacing: '-0.01em' }}>
            DATA CENTER PROJECTS
          </h1>
          <p style={{ color: '#94a3b8', maxWidth: 560, lineHeight: 1.6, margin: 0 }}>
            {rows.length} facilities tracked across {states.length} states. Scored by proximity to power transmission, water monitoring sites, and fiber exchange points.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem' }}>
        {states.map(state => (
          <div key={state} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#64748b', margin: '0 0 0.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
              {state}
            </h2>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {byState[state].map(r => {
                const scorePct = Math.round((r.availability_score / 96) * 100)
                const statusColor = STATUS_COLORS[r.status ?? ''] ?? '#6b7280'
                return (
                  <Link
                    key={r.id}
                    href={`/projects/${r.id}`}
                    style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', gap: '1rem', background: '#0f1728', border: '1px solid #1e293b', borderRadius: 6, padding: '0.75rem 1rem', textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s' }}
                  >
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{r.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusColor, display: 'inline-block' }} />
                        {r.status ?? 'unknown'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span title="Power" style={{ fontSize: '0.7rem', color: '#f59e0b' }}>⚡{r.power_score}</span>
                      <span title="Water" style={{ fontSize: '0.7rem', color: '#3b82f6' }}>💧{r.water_score}</span>
                      <span title="Fiber" style={{ fontSize: '0.7rem', color: '#8b5cf6' }}>🔗{r.fiber_score}</span>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: 52 }}>
                      <div style={{ fontSize: '1.25rem', fontFamily: 'Barlow Condensed, sans-serif', fontWeight: 700, color: scorePct >= 80 ? '#22c55e' : scorePct >= 60 ? '#f59e0b' : '#94a3b8' }}>
                        {r.availability_score}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#475569' }}>score</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '3rem' }}>No facilities found. Run the IM3 Atlas seed script to populate this view.</p>
        )}
      </div>
    </div>
  )
}
