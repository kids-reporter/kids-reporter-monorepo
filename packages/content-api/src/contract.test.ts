import {
  RestErrorBodySchema,
  V1CallBaodaozaiIntroResponseSchema,
  V1CategoryBySlugCategoryPostsResponseSchema,
  V1CategoryBySlugMetadataResponseSchema,
  V1EditorPicksSettingsResponseSchema,
  V1PopularKeywordsResponseSchema,
  V1PostsEssayAnswersWithLikesResponseSchema,
  V1PostsResponseSchema,
  V1ProjectsResponseSchema,
  V1SitemapPostsResponseSchema,
  V1SitemapProjectsResponseSchema,
  V1SubcategoriesResponseSchema,
} from '@kids-reporter/api-types'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import type { z } from 'zod'

import { createApp } from './app.js'

const describeWithDb = process.env.DATABASE_URL ? describe : describe.skip
const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })

async function expectRouteMatchesSchema(
  path: string,
  schema: z.ZodTypeAny,
  expectedStatus = 200
) {
  const res = await request(app).get(path)
  expect(res.status).toBe(expectedStatus)
  const parsed = schema.safeParse(res.body)
  expect(
    parsed.success,
    parsed.success ? '' : JSON.stringify(parsed.error.format())
  ).toBe(true)
}

describe('content-api response contracts', () => {
  it('requires DATABASE_URL in CI when running DB-backed contract checks', () => {
    if (process.env.CI) {
      expect(process.env.DATABASE_URL).toBeTruthy()
    }
  })

  it('POST /auth/access-token without Origin/Referer returns { error }', async () => {
    const res = await request(app).post('/auth/access-token')
    expect(res.status).toBe(403)
    expect(res.body?.error?.code).toBe('forbidden')
    expect(typeof res.body?.error?.message).toBe('string')
  })

  it('POST /auth/access-token missing id_token cookie returns { error }', async () => {
    const res = await request(app)
      .post('/auth/access-token')
      .set('Origin', 'https://kids.twreporter.org')
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  it('GET /v1/posts invalid query returns { error } with invalid_request', async () => {
    const res = await request(app).get('/v1/posts?take=abc')
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  it('GET /v1/posts/x rejects decimal take query param', async () => {
    const res = await request(app).get('/v1/posts/x?take=1.5')
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  it('GET /v1/posts/essay-answers-with-likes rejects decimal take', async () => {
    const res = await request(app).get(
      '/v1/posts/essay-answers-with-likes?take=2.2&answerTake=1'
    )
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  it('GET /v1/posts/essay-answers-with-likes rejects invalid orderBy enum', async () => {
    const res = await request(app).get(
      '/v1/posts/essay-answers-with-likes?orderBy=foo'
    )
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  it('GET /v1/post-essay-answers rejects invalid orderBy enum', async () => {
    const res = await request(app).get('/v1/post-essay-answers?orderBy=foo')
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  it('GET /v1/post-essay-questions/:id rejects invalid answerOrderBy enum', async () => {
    const res = await request(app).get(
      '/v1/post-essay-questions/1?answerTake=10&answerOrderBy=bad'
    )
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  it('GET /v1/post-essay-questions/:questionId rejects decimal questionId', async () => {
    const res = await request(app).get(
      '/v1/post-essay-questions/1.5?answerTake=10'
    )
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  it('GET /v1/post-essay-questions/:questionId rejects non-positive questionId', async () => {
    const res = await request(app).get(
      '/v1/post-essay-questions/0?answerTake=10'
    )
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  describeWithDb('metadata query normalization (requires DB)', () => {
    it('GET /v1/categories/x/metadata uses first subcategorySlug when repeated', async () => {
      const res = await request(app).get(
        '/v1/categories/x/metadata?subcategorySlug=a&subcategorySlug=b'
      )
      expect([200, 404]).toContain(res.status)
      if (res.status === 200) {
        expect(
          V1CategoryBySlugMetadataResponseSchema.safeParse(res.body).success
        ).toBe(true)
      } else {
        expect(RestErrorBodySchema.safeParse(res.body).success).toBe(true)
        expect(res.body?.error?.code).toBe('not_found')
      }
    })
  })

  it('GET /v1/call-baodaozai-intros/:page rejects invalid page enum', async () => {
    const res = await request(app).get('/v1/call-baodaozai-intros/not-a-page')
    expect(res.status).toBe(400)
    expect(res.body?.error?.code).toBe('invalid_request')
  })

  describeWithDb('with DATABASE_URL (response shape vs api-types)', () => {
    it('GET /v1/posts success body matches V1PostsResponseSchema', async () => {
      await expectRouteMatchesSchema('/v1/posts', V1PostsResponseSchema)
    })

    it('GET /v1/post-essay-answers sets Cache-Control when 200', async () => {
      const res = await request(app).get('/v1/post-essay-answers')
      if (res.status === 200) {
        expect(res.headers['cache-control']).toBe('public, max-age=60')
      }
    })

    it('GET /v1/posts/essay-answers-with-likes with no query returns 200 and array body', async () => {
      const res = await request(app).get('/v1/posts/essay-answers-with-likes')
      expect(res.status).toBe(200)
      expect(
        V1PostsEssayAnswersWithLikesResponseSchema.safeParse(res.body).success
      ).toBe(true)
    })

    it('GET /v1/subcategories success body matches V1SubcategoriesResponseSchema', async () => {
      await expectRouteMatchesSchema(
        '/v1/subcategories',
        V1SubcategoriesResponseSchema
      )
    })

    it('GET /v1/popular-keywords success body matches V1PopularKeywordsResponseSchema', async () => {
      await expectRouteMatchesSchema(
        '/v1/popular-keywords',
        V1PopularKeywordsResponseSchema
      )
    })

    it('GET /v1/editor-picks-settings success body matches V1EditorPicksSettingsResponseSchema', async () => {
      await expectRouteMatchesSchema(
        '/v1/editor-picks-settings',
        V1EditorPicksSettingsResponseSchema
      )
    })

    it('GET /v1/projects with no query string matches V1ProjectsResponseSchema', async () => {
      await expectRouteMatchesSchema('/v1/projects', V1ProjectsResponseSchema)
    })

    it('GET /v1/projects matches V1ProjectsResponseSchema (default pagination)', async () => {
      await expectRouteMatchesSchema(
        '/v1/projects?take=12&orderBy=publishedDate:desc',
        V1ProjectsResponseSchema
      )
    })

    it('GET /v1/projects with skip matches V1ProjectsResponseSchema', async () => {
      await expectRouteMatchesSchema(
        '/v1/projects?skip=0',
        V1ProjectsResponseSchema
      )
    })

    it('GET /v1/projects with includeRelatedPosts matches V1ProjectsResponseSchema', async () => {
      await expectRouteMatchesSchema(
        '/v1/projects?take=2&skip=0&includeRelatedPosts=true',
        V1ProjectsResponseSchema
      )
    })

    it('GET /v1/post-essay-questions/:id missing question returns 404', async () => {
      const res = await request(app).get(
        '/v1/post-essay-questions/999999999?answerTake=10'
      )
      expect(res.status).toBe(404)
      expect(RestErrorBodySchema.safeParse(res.body).success).toBe(true)
      expect(res.body?.error?.code).toBe('not_found')
    })

    it('GET /v1/categories/unknown-feed-slug/posts success body matches category posts schema', async () => {
      await expectRouteMatchesSchema(
        '/v1/categories/unknown-feed-slug/posts',
        V1CategoryBySlugCategoryPostsResponseSchema
      )
    })

    it('GET /v1/sitemaps/posts matches V1SitemapPostsResponseSchema', async () => {
      await expectRouteMatchesSchema(
        '/v1/sitemaps/posts?sinceDays=60',
        V1SitemapPostsResponseSchema
      )
    })

    it('GET /v1/sitemaps/projects matches V1SitemapProjectsResponseSchema', async () => {
      await expectRouteMatchesSchema(
        '/v1/sitemaps/projects',
        V1SitemapProjectsResponseSchema
      )
    })

    it('GET /v1/projects/unknown-topic-slug-xyz/meta returns 404', async () => {
      const res = await request(app).get(
        '/v1/projects/unknown-topic-slug-xyz/meta'
      )
      expect(res.status).toBe(404)
      expect(RestErrorBodySchema.safeParse(res.body).success).toBe(true)
    })

    it('GET /v1/projects/unknown-topic-slug-xyz/related-posts-count returns 404', async () => {
      const res = await request(app).get(
        '/v1/projects/unknown-topic-slug-xyz/related-posts-count'
      )
      expect(res.status).toBe(404)
      expect(RestErrorBodySchema.safeParse(res.body).success).toBe(true)
    })

    it('GET /v1/authors/unknown-author-slug-xyz/posts-count returns 404', async () => {
      const res = await request(app).get(
        '/v1/authors/unknown-author-slug-xyz/posts-count'
      )
      expect(res.status).toBe(404)
      expect(RestErrorBodySchema.safeParse(res.body).success).toBe(true)
    })

    it('GET /v1/posts/unknown-post-slug-xyz returns 404', async () => {
      const res = await request(app).get('/v1/posts/unknown-post-slug-xyz')
      expect(res.status).toBe(404)
      expect(RestErrorBodySchema.safeParse(res.body).success).toBe(true)
    })

    it('GET /v1/posts/unknown-post-slug-xyz/meta returns 404', async () => {
      const res = await request(app).get('/v1/posts/unknown-post-slug-xyz/meta')
      expect(res.status).toBe(404)
      expect(RestErrorBodySchema.safeParse(res.body).success).toBe(true)
    })

    it('GET /v1/posts/unknown-post-slug-xyz/essay-questions returns 404', async () => {
      const res = await request(app).get(
        '/v1/posts/unknown-post-slug-xyz/essay-questions'
      )
      expect(res.status).toBe(404)
      expect(RestErrorBodySchema.safeParse(res.body).success).toBe(true)
    })

    it('GET /v1/call-baodaozai-intros/home 200 or 404 with matching body shape', async () => {
      const app = createApp({ corsAllowOrigin: '*' })
      const res = await request(app).get('/v1/call-baodaozai-intros/home')
      if (res.status === 200) {
        expect(
          V1CallBaodaozaiIntroResponseSchema.safeParse(res.body).success
        ).toBe(true)
      } else {
        expect(res.status).toBe(404)
      }
    })
  })
})
