import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  getCloudflareContext: vi.fn(),
  sanityFetch: vi.fn(),
  supabaseFrom: vi.fn(),
}))

vi.mock('@opennextjs/cloudflare', () => ({
  getCloudflareContext: mocks.getCloudflareContext,
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
    mocks.getCloudflareContext.mockReset()
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
    mocks.getCloudflareContext.mockReturnValue({ env: {} })
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const response = await (await loadGet())()

    expect(response.status).toBe(503)
    await expect(response.json()).resolves.toEqual({
      error: 'D1 dependency unavailable',
      dependency: 'D1',
    })
    expect(errorSpy).toHaveBeenCalledWith(
      'Konative Cloudflare binding unavailable',
      expect.objectContaining({ binding: 'DB', operation: 'getD1' }),
    )
    errorSpy.mockRestore()
  })

  it('returns 200 and preserves zero counts when D1 is reachable but empty', async () => {
    mocks.getCloudflareContext.mockReturnValue({ env: { DB: d1WithCount(0) } })

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
