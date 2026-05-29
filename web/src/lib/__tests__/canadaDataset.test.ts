import { describe, it, expect } from 'vitest'
import { normalizeProvinceCode, provinceCodeToName } from '../canadaProvinces'
import { isDuplicateProject } from '../dedupeProjects'
import { isLikelyDataCenterLoad, mapQueuePhaseToStatus } from '../queueToProject'

describe('normalizeProvinceCode', () => {
  it('maps full names and abbreviations', () => {
    expect(normalizeProvinceCode('Ontario')).toBe('ON')
    expect(normalizeProvinceCode('ON')).toBe('ON')
    expect(normalizeProvinceCode('British Columbia')).toBe('BC')
    expect(normalizeProvinceCode('Québec')).toBe('QC')
  })

  it('returns null for unknown', () => {
    expect(normalizeProvinceCode('Virginia')).toBeNull()
  })
})

describe('provinceCodeToName', () => {
  it('returns full province name', () => {
    expect(provinceCodeToName('AB')).toBe('Alberta')
  })
})

describe('isDuplicateProject', () => {
  it('matches same operator within 500m', () => {
    const a = { name: 'Cologix TOR1', operator: 'Cologix', lat: 43.74, lng: -79.29 }
    const b = { name: 'TOR1', operator: 'Cologix', lat: 43.7405, lng: -79.2905 }
    expect(isDuplicateProject(a, b)).toBe(true)
  })

  it('does not match far apart facilities', () => {
    const a = { name: 'Cologix TOR1', operator: 'Cologix', lat: 43.74, lng: -79.29 }
    const b = { name: 'Cologix MTL1', operator: 'Cologix', lat: 45.5, lng: -73.57 }
    expect(isDuplicateProject(a, b)).toBe(false)
  })
})

describe('queueToProject', () => {
  it('detects likely DC loads', () => {
    expect(
      isLikelyDataCenterLoad({
        project_name: 'AI Data Center Campus',
        resource_type: 'load',
        capacity_mw: 100,
      }),
    ).toBe(true)
  })

  it('maps withdrawn queue rows to canceled', () => {
    expect(mapQueuePhaseToStatus('withdrawn')).toBe('canceled')
  })
})
