import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('buildPostBySlugVisibilityWhere', () => {
  const now = new Date('2026-01-01T00:00:00.000Z')

  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('matches buildPublicPostWhere when IS_PREVIEW_SERVER is unset', async () => {
    const { buildPostBySlugVisibilityWhere, buildPublicPostWhere } =
      await import('./v1-helpers.js')
    expect(buildPostBySlugVisibilityWhere(now)).toEqual(
      buildPublicPostWhere(now)
    )
  })

  it('matches buildPublicPostWhere when IS_PREVIEW_SERVER is false', async () => {
    vi.stubEnv('IS_PREVIEW_SERVER', 'false')
    const { buildPostBySlugVisibilityWhere, buildPublicPostWhere } =
      await import('./v1-helpers.js')
    expect(buildPostBySlugVisibilityWhere(now)).toEqual(
      buildPublicPostWhere(now)
    )
  })

  it('returns no status filter when IS_PREVIEW_SERVER is true', async () => {
    vi.stubEnv('IS_PREVIEW_SERVER', 'true')
    const { buildPostBySlugVisibilityWhere } = await import('./v1-helpers.js')
    expect(buildPostBySlugVisibilityWhere(now)).toEqual({})
  })
})
