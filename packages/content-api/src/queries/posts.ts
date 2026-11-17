import { V1PostsResponseSchema } from '@kids-reporter/api-types'
import { type Prisma, prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import {
  buildArticleListWhere,
  buildVideoListWhere,
  mapPostCard,
  postCardSelect,
} from '../utils/v1-helpers.js'

type V1PostsResponse = z.infer<typeof V1PostsResponseSchema>

/** Server-side default ordering; `orderBy` query param is currently fixed to `publishedDate:desc`. */
const POSTS_LIST_ORDER = { publishedDate: 'desc' } as const

export type FetchPostsListOpts = {
  take: number
  skip: number
  where?: Prisma.PostWhereInput
}

/** `GET /v1/posts`. Video lists use `fetchVideoPostsList`. */
export async function fetchPostsList(
  opts: FetchPostsListOpts,
  now: Date
): Promise<V1PostsResponse> {
  const posts = await prisma.post.findMany({
    take: opts.take,
    skip: opts.skip,
    where: opts.where ?? buildArticleListWhere(now),
    orderBy: POSTS_LIST_ORDER,
    select: postCardSelect,
  })

  const result = {
    posts: posts.map(mapPostCard),
    page: {
      take: opts.take,
      skip: opts.skip,
    },
  }
  return result
}

/** `GET /v1/posts/videos` — same cards as the article list, plus a total for pagination. */
export async function fetchVideoPostsList(
  opts: { take: number; skip: number },
  now: Date
) {
  const where = buildVideoListWhere(now)
  const [list, total] = await Promise.all([
    fetchPostsList({ ...opts, where }, now),
    prisma.post.count({ where }),
  ])
  return { ...list, total }
}
