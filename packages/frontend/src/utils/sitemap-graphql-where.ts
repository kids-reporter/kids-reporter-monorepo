import type { PostWhereInput, ProjectWhereInput } from '__generated__/types'

/**
 * Mirrors `buildPublicPostWhere` in content-api (`packages/content-api/src/v1-helpers.ts`)
 * so sitemap fallback GraphQL matches `/v1/sitemaps/posts` visibility rules.
 */
export function buildPublicPostWhereForRestGql(
  now: Date
): Pick<PostWhereInput, 'OR'> {
  return {
    OR: [
      { status: { equals: 'published' } },
      {
        AND: [
          { status: { equals: 'scheduled' } },
          { publishedDate: { lt: now.toISOString() } },
        ],
      },
    ],
  }
}

/** Combined filter for GraphQL posts sitemap (parity with `/v1/sitemaps/posts`). */
export function buildSitemapPostsWhereInput(opts: {
  publishedDateGte: Date
  now: Date
}): PostWhereInput {
  return {
    AND: [
      {
        publishedDate: { gte: opts.publishedDateGte.toISOString() },
      },
      buildPublicPostWhereForRestGql(opts.now),
    ],
  }
}

/** Combined filter for GraphQL projects sitemap (parity with `/v1/sitemaps/projects`). */
export function buildSitemapProjectsWhereInput(
  publishedDateGte: Date
): ProjectWhereInput {
  return {
    AND: [
      { publishedDate: { gte: publishedDateGte.toISOString() } },
      { status: { equals: 'published' } },
    ],
  }
}
