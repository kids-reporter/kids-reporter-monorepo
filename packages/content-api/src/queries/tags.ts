import {
  V1TagBySlugMetaResponseSchema,
  V1TagBySlugPostsResponseSchema,
} from '@kids-reporter/api-types'
import { prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import {
  buildPublicPostWhere,
  buildResizedSmall,
  mapPostCard,
  postCardSelect,
} from '../utils/v1-helpers.js'

type V1TagBySlugMetaResponse = z.infer<typeof V1TagBySlugMetaResponseSchema>
type V1TagBySlugPostsResponse = z.infer<typeof V1TagBySlugPostsResponseSchema>

const PUBLISHED_FEED_ORDER = { publishedDate: 'desc' } as const

/** `GET /v1/tags/by-slug/:slug/meta` (404 when tag missing). */
export async function fetchTagMeta(
  slug: string
): Promise<V1TagBySlugMetaResponse | null> {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: {
      ogTitle: true,
      ogDescription: true,
      ogImage: {
        select: { imageFile_id: true, imageFile_extension: true },
      },
    },
  })
  if (!tag) return null
  const result = {
    ogTitle: tag.ogTitle,
    ogDescription: tag.ogDescription,
    ogImage: tag.ogImage
      ? { resized: { small: buildResizedSmall(tag.ogImage) } }
      : null,
  }
  return result
}

/** `GET /v1/tags/by-slug/:slug/posts` (404 when tag missing). */
export async function fetchTagFeedPosts(
  slug: string,
  opts: { take: number; skip: number },
  now: Date
): Promise<V1TagBySlugPostsResponse | null> {
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: { id: true, name: true },
  })
  if (!tag) return null

  const where = {
    AND: [buildPublicPostWhere(now), { tags: { some: { id: tag.id } } }],
  }
  const [posts, postsCount] = await Promise.all([
    prisma.post.findMany({
      take: opts.take,
      skip: opts.skip,
      where,
      orderBy: PUBLISHED_FEED_ORDER,
      select: postCardSelect,
    }),
    prisma.post.count({ where }),
  ])
  const result = {
    posts: posts.map(mapPostCard),
    postsCount,
    name: tag.name,
  }
  return result
}
