/**
 * Reality Check — deterministic feasibility scoring for announced DC projects.
 * No ML, no external deps. Pure function from project record inputs to verdict.
 */

export type FeasibilityVerdict = 'credible' | 'aggressive' | 'not_likely'

export interface FeasibilityInput {
  capacityMw: number | null
  status: 'operational' | 'construction' | 'announced' | string
  expectedOnlineDate: string | null   // ISO date string
  announcedDate: string | null        // ISO date string (not used in scoring, carried through)
  hasNearbySubstation10km?: boolean   // default false
}

export interface FeasibilityResult {
  verdict: FeasibilityVerdict
  monthsClaimed: number
  monthsRequired: number
  bindingConstraints: string[]
  explanation: string
}

/** Number of full months between two dates (rounded up, minimum 0). */
function monthsBetween(fromDate: Date, toDate: Date): number {
  const yearDiff = toDate.getFullYear() - fromDate.getFullYear()
  const monthDiff = toDate.getMonth() - fromDate.getMonth()
  const dayDiff = toDate.getDate() - fromDate.getDate()
  const raw = yearDiff * 12 + monthDiff + (dayDiff > 0 ? 1 : 0)
  return Math.max(0, raw)
}

/**
 * Compute a feasibility verdict for an announced/construction-phase DC project.
 * Returns null if the project is already operational, or if no expectedOnlineDate
 * is provided (no claim to check).
 */
export function computeFeasibility(input: FeasibilityInput): FeasibilityResult | null {
  // No verdict for operational projects or missing target date
  if (input.status === 'operational') return null
  if (!input.expectedOnlineDate) return null

  const today = new Date()
  const onlineDate = new Date(input.expectedOnlineDate)

  const monthsClaimed = Math.max(0, monthsBetween(today, onlineDate))

  const mw = input.capacityMw ?? 0
  const hasSubstation = input.hasNearbySubstation10km ?? false

  // ── Compute candidate constraint durations with labels ──────────────────────

  const candidates: { months: number; label: string }[] = [
    { months: 18, label: 'baseline DC build 18mo' },
    { months: Math.ceil(mw / 50) * 6, label: `capacity build ${Math.ceil(mw / 50) * 6}mo (${mw}MW @ 6mo/50MW)` },
    { months: hasSubstation ? 0 : 24, label: 'GIS substation 24mo' },
    { months: mw >= 100 ? 24 : 0, label: 'LPT lead time 24mo (≥100MW)' },
    { months: mw >= 500 ? 36 : 0, label: 'GIS + LPT for 500MW+ 36mo' },
  ]

  // Find the maximum constraint value
  const maxMonths = Math.max(...candidates.map(c => c.months))
  const monthsRequired = maxMonths

  // Collect all binding constraints (those equal to the max and > 0)
  const bindingConstraints = candidates
    .filter(c => c.months === maxMonths && c.months > 0)
    .map(c => c.label)

  // ── Verdict ─────────────────────────────────────────────────────────────────

  const ratio = monthsRequired === 0 ? 1 : monthsClaimed / monthsRequired

  let verdict: FeasibilityVerdict
  if (ratio >= 1.0) {
    verdict = 'credible'
  } else if (ratio >= 0.6) {
    verdict = 'aggressive'
  } else {
    verdict = 'not_likely'
  }

  // ── Explanation ─────────────────────────────────────────────────────────────

  let explanation: string
  if (verdict === 'credible') {
    explanation = `Timeline of ${monthsClaimed} months meets the ${monthsRequired}-month minimum required for this ${mw > 0 ? mw + ' MW ' : ''}project.`
  } else if (verdict === 'aggressive') {
    explanation = `Claimed ${monthsClaimed} months is ${Math.round((1 - ratio) * 100)}% short of the ${monthsRequired}-month realistic minimum — delivery is aggressive but not impossible.`
  } else {
    explanation = `Claimed ${monthsClaimed} months is only ${Math.round(ratio * 100)}% of the ${monthsRequired}-month minimum required — timeline is not credible without significant pre-work.`
  }

  return { verdict, monthsClaimed, monthsRequired, bindingConstraints, explanation }
}
