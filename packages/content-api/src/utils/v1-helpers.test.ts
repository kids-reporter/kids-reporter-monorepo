import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('mapPostCard', () => {
  it('passes external url, duration, and og fields through', async () => {
    const { mapPostCard } = await import('./v1-helpers.js')
    const card = mapPostCard({
      id: 1,
      title: 'Title',
      slug: 'slug',
      ogDescription: 'desc',
      ogTitle: 'OG title',
      externalUrl: 'https://example.com/watch',
      videoDuration: '00:01:30',
      publishedDate: null,
      heroImage: null,
      ogImage: { imageFile_id: 'og-file', imageFile_extension: 'jpg' },
      subSubcategories: [],
      subSubcategoriesOrderJson: [],
    })

    expect(card).toMatchObject({
      title: 'Title',
      slug: 'slug',
      externalUrl: 'https://example.com/watch',
      videoDuration: '00:01:30',
      ogTitle: 'OG title',
      ogDescription: 'desc',
      ogImage: {
        resized: { small: expect.stringContaining('og-file-800.webp') },
      },
    })
  })
})

describe('article and video list wheres', () => {
  const now = new Date('2026-01-01T00:00:00.000Z')

  it('article lists require an empty externalUrl', async () => {
    const { buildArticleListWhere, buildPublicPostWhere } = await import(
      './v1-helpers.js'
    )
    expect(buildArticleListWhere(now)).toEqual({
      AND: [buildPublicPostWhere(now), { externalUrl: '' }],
    })
  })

  it('video lists require a non-empty externalUrl', async () => {
    const { buildPublicPostWhere, buildVideoListWhere } = await import(
      './v1-helpers.js'
    )
    expect(buildVideoListWhere(now)).toEqual({
      AND: [buildPublicPostWhere(now), { NOT: { externalUrl: '' } }],
    })
  })
})

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

describe('buildProjectBySlugVisibilityWhere', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('matches buildPublicProjectWhere when IS_PREVIEW_SERVER is unset', async () => {
    const { buildProjectBySlugVisibilityWhere, buildPublicProjectWhere } =
      await import('./v1-helpers.js')
    expect(buildProjectBySlugVisibilityWhere()).toEqual(
      buildPublicProjectWhere()
    )
  })

  it('matches buildPublicProjectWhere when IS_PREVIEW_SERVER is false', async () => {
    vi.stubEnv('IS_PREVIEW_SERVER', 'false')
    const { buildProjectBySlugVisibilityWhere, buildPublicProjectWhere } =
      await import('./v1-helpers.js')
    expect(buildProjectBySlugVisibilityWhere()).toEqual(
      buildPublicProjectWhere()
    )
  })

  it('returns no status filter when IS_PREVIEW_SERVER is true', async () => {
    vi.stubEnv('IS_PREVIEW_SERVER', 'true')
    const { buildProjectBySlugVisibilityWhere } = await import(
      './v1-helpers.js'
    )
    expect(buildProjectBySlugVisibilityWhere()).toEqual({})
  })
})
