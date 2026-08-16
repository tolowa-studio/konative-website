import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getKonativeDataRuntime: vi.fn(),
  getWorkerD1: vi.fn(),
  sanityFetch: vi.fn(),
  supabaseFrom: vi.fn(),
}))

vi.mock('@/lib/db/runtime', () => ({
  getKonativeDataRuntime: mocks.getKonativeDataRuntime,
  isCloudRunRuntime: vi.fn(() => false),
}))

vi.mock('@/lib/db/worker-bindings', () => ({
  getWorkerD1: mocks.getWorkerD1,
}))

vi.mock('@sanity/client', () => ({
  createClient: () => ({ fetch: mocks.sanityFetch }),
}))

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({ from: mocks.supabaseFrom }),
}))

function d1WithCount(count: number) {
  return {
    prepare: () => ({
      first: vi.fn().mockResolvedValue({ count }),
    }),
  }
}

async function loadGet() {
  vi.resetModules()
  const { GET } = await import('../route')
  return GET
}

describe('GET /api/v1/health', () => {
  beforeEach(() => {
    mocks.getKonativeDataRuntime.mockReset()
    mocks.getWorkerD1.mockReset()
    mocks.sanityFetch.mockReset().mockResolvedValue({
      articleCount: 4,
      feedCount: 2,
      dealCount: 1,
    })
    mocks.supabaseFrom.mockReset().mockReturnValue({
      select: vi.fn().mockResolvedValue({ count: 3 }),
    })
  })

  it('returns 503 with an explicit D1 error when the binding is absent', async () => {
    mocks.getKonativeDataRuntime.mockReturnValue('cloudflare-workers')
    mocks.getWorkerD1.mockImplementation(() => {
      throw new Error('D1 binding is not configured')
    })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await (await loadGet())()

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'D1 dependency unavailable',
      dependency: 'D1',
    })
    expect(errorSpy).toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('returns 200 and preserves zero counts when D1 is reachable but empty', async () => {
    mocks.getKonativeDataRuntime.mockReturnValue('cloudflare-workers')
    mocks.getWorkerD1.mockReturnValue(d1WithCount(0))

    const response = await (await loadGet())()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      articleCount: 4,
      feedCount: 2,
      dealCount: 1,
      facilitiesScored: 0,
      generatorsTracked: 0,
      waterSitesIndexed: 3,
      networkNodesIndexed: 0,
    })
  })
})
