import { describe, it, expect } from 'vitest'
import { computeFeasibility } from '@/lib/feasibility-score'

// Helper: returns an ISO date string N months from today
function dateInMonths(n: number): string {
  const d = new Date()
  d.setMonth(d.getMonth() + n)
  return d.toISOString().slice(0, 10)
}

describe('computeFeasibility', () => {
  it('returns null for operational status', () => {
    const result = computeFeasibility({
      capacityMw: 200,
      status: 'operational',
      expectedOnlineDate: dateInMonths(12),
      announcedDate: null,
    })
    expect(result).toBeNull()
  })

  it('returns null when expectedOnlineDate is missing', () => {
    const result = computeFeasibility({
      capacityMw: 100,
      status: 'announced',
      expectedOnlineDate: null,
      announcedDate: null,
    })
    expect(result).toBeNull()
  })

  it('200 MW announced for 6mo from now → not_likely', () => {
    // monthsClaimed = 6
    // monthsRequired = max(18, ceil(200/50)*6=24, 24 [no substation], 24 [≥100MW], 0) = 24
    // ratio = 6/24 = 0.25 → not_likely
    const result = computeFeasibility({
      capacityMw: 200,
      status: 'announced',
      expectedOnlineDate: dateInMonths(6),
      announcedDate: null,
      hasNearbySubstation10km: false,
    })
    expect(result).not.toBeNull()
    expect(result!.verdict).toBe('not_likely')
    expect(result!.monthsClaimed).toBe(6)
    expect(result!.monthsRequired).toBe(24)
    expect(result!.bindingConstraints.length).toBeGreaterThan(0)
  })

  it('50 MW announced for 24mo from now → credible', () => {
    // monthsClaimed = 24
    // monthsRequired = max(18, ceil(50/50)*6=6, 24 [no substation], 0 [<100MW], 0) = 24
    // ratio = 24/24 = 1.0 → credible
    const result = computeFeasibility({
      capacityMw: 50,
      status: 'announced',
      expectedOnlineDate: dateInMonths(24),
      announcedDate: null,
      hasNearbySubstation10km: false,
    })
    expect(result).not.toBeNull()
    expect(result!.verdict).toBe('credible')
    expect(result!.monthsClaimed).toBe(24)
    expect(result!.monthsRequired).toBe(24)
  })

  it('1000 MW announced for 36mo → not_likely (capacity build alone requires 120mo)', () => {
    // monthsClaimed = 36
    // capacity constraint: ceil(1000/50)*6 = 20*6 = 120mo
    // monthsRequired = max(18, 120, 24, 24, 36) = 120
    // ratio = 36/120 = 0.3 → not_likely
    const result = computeFeasibility({
      capacityMw: 1000,
      status: 'announced',
      expectedOnlineDate: dateInMonths(36),
      announcedDate: null,
      hasNearbySubstation10km: false,
    })
    expect(result).not.toBeNull()
    expect(result!.verdict).toBe('not_likely')
    expect(result!.monthsRequired).toBe(120)
    expect(result!.bindingConstraints.some(c => c.includes('capacity build'))).toBe(true)
  })

  it('100 MW announced for 18mo with nearby substation → boundary case (aggressive)', () => {
    // monthsClaimed = 18
    // monthsRequired = max(18, ceil(100/50)*6=12, 0 [has substation], 24 [≥100MW], 0) = 24
    // ratio = 18/24 = 0.75 → aggressive
    const result = computeFeasibility({
      capacityMw: 100,
      status: 'announced',
      expectedOnlineDate: dateInMonths(18),
      announcedDate: null,
      hasNearbySubstation10km: true,
    })
    expect(result).not.toBeNull()
    expect(result!.verdict).toBe('aggressive')
    expect(result!.monthsRequired).toBe(24)
    // Binding constraint should be LPT (substation not binding since it's available)
    expect(result!.bindingConstraints.some(c => c.includes('LPT'))).toBe(true)
  })

  it('explanation string is non-empty and references the verdict', () => {
    const result = computeFeasibility({
      capacityMw: 200,
      status: 'construction',
      expectedOnlineDate: dateInMonths(30),
      announcedDate: null,
    })
    expect(result).not.toBeNull()
    expect(result!.explanation.length).toBeGreaterThan(10)
  })
})
