import {
  V1SitemapPostsResponseSchema,
  V1SitemapProjectsResponseSchema,
} from '@kids-reporter/api-types'
import { prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import { buildPublicPostWhere } from '../utils/v1-helpers.js'

type V1SitemapPostsResponse = z.infer<typeof V1SitemapPostsResponseSchema>
type V1SitemapProjectsResponse = z.infer<typeof V1SitemapProjectsResponseSchema>

/** Start-of-day in server local time, `sinceDays` days before `now`. Matches sitemap window semantics. */
function sitemapPublishedSinceUtc(now: Date, sinceDays: number): Date {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return new Date(d.getTime() - sinceDays * 24 * 60 * 60 * 1000)
}

type SitemapEntry = { slug: string; publishedDate: string | null }

const toSitemapEntries = (
  rows: Array<{ slug: string; publishedDate: Date | null }>
): SitemapEntry[] =>
  rows.map((p) => ({
    slug: p.slug,
    publishedDate: p.publishedDate ? p.publishedDate.toISOString() : null,
  }))

/** `GET /v1/sitemaps/posts` */
export async function fetchPostsForSitemap(
  sinceDays: number,
  now: Date
): Promise<V1SitemapPostsResponse> {
  const gte = sitemapPublishedSinceUtc(now, sinceDays)
  const posts = await prisma.post.findMany({
    where: {
      AND: [buildPublicPostWhere(now), { publishedDate: { gte } }],
    },
    select: { slug: true, publishedDate: true },
  })
  return toSitemapEntries(posts)
}

/** `GET /v1/sitemaps/projects` */
export async function fetchProjectsForSitemap(
  sinceDays: number,
  now: Date
): Promise<V1SitemapProjectsResponse> {
  const gte = sitemapPublishedSinceUtc(now, sinceDays)
  const projects = await prisma.project.findMany({
    where: {
      status: 'published',
      publishedDate: { gte },
    },
    select: { slug: true, publishedDate: true },
  })
  return toSitemapEntries(projects)
}
