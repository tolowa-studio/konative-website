import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  let body: {
    event_type?: string
    entity_type?: string
    entity_id?: string
    metadata?: Record<string, unknown>
  }
  try {
    body = await request.json()
  } catch {
    return new NextResponse(null, { status: 400 })
  }

  const { event_type, entity_type, entity_id, metadata } = body

  if (!event_type || !entity_type || !entity_id) {
    return new NextResponse(null, { status: 400 })
  }

  // Insert analytics event
  const { error: insertError } = await supabase.from('analytics_events').insert({
    event_type,
    entity_type,
    entity_id,
    metadata: metadata || {},
    created_at: new Date().toISOString(),
  })

  if (insertError) {
    console.error('[analytics/track] analytics_events insert failed:', insertError)
    return new NextResponse(null, { status: 500 })
  }

  // Update sponsor placement counts
  if (
    entity_type === 'sponsorship_placement' &&
    (event_type === 'sponsor_impression' || event_type === 'sponsor_click')
  ) {
    const field = event_type === 'sponsor_impression' ? 'impressions' : 'clicks'
    const ok = await incrementSponsorshipCounter(entity_id, field)
    if (!ok) {
      console.error(
        `[analytics/track] failed to increment ${field} for sponsorship_placement ${entity_id} after retries`,
      )
      return new NextResponse(null, { status: 500 })
    }
  }

  return new NextResponse(null, { status: 204 })
}

/**
 * Optimistic-concurrency increment: read the current value, then UPDATE only
 * if it hasn't changed since the read (WHERE id=… AND field=currentVal).
 * Under concurrent writers, a losing UPDATE matches zero rows and the caller
 * retries with a fresh read — no lost updates, no new stored procedure
 * needed. sponsorship_placements lives in the Supabase project pending
 * TOL-324 (Supabase→D1 migration); an RPC-based atomic increment belongs on
 * whichever datastore is canonical once that lands, not added here.
 */
async function incrementSponsorshipCounter(
  entityId: string,
  field: 'impressions' | 'clicks',
  maxAttempts = 12,
): Promise<boolean> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (attempt > 0) {
      // Small jittered backoff so a burst of concurrent writers doesn't keep
      // colliding on the same retry cadence.
      await new Promise(resolve => setTimeout(resolve, Math.random() * 15));
    }
    const { data, error: selectError } = await supabase
      .from('sponsorship_placements')
      .select(field)
      .eq('id', entityId)
      .single()

    if (selectError || !data) {
      console.error(`[analytics/track] sponsorship_placements select failed for ${entityId}:`, selectError)
      return false
    }

    const currentVal = (data as Record<string, number>)[field] || 0
    const { data: updated, error: updateError } = await supabase
      .from('sponsorship_placements')
      .update({ [field]: currentVal + 1 })
      .eq('id', entityId)
      .eq(field, currentVal)
      .select('id')

    if (updateError) {
      console.error(`[analytics/track] sponsorship_placements update failed for ${entityId}:`, updateError)
      return false
    }
    if (updated && updated.length > 0) {
      return true
    }
    // Row changed between select and update (concurrent writer) — retry.
  }
  return false
}
