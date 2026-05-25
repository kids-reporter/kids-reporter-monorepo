import { V1PostsResponseSchema } from '@kids-reporter/api-types'
import { prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import {
  buildPublicPostWhere,
  mapPostCard,
  postCardSelect,
} from '../utils/v1-helpers.js'

type V1PostsResponse = z.infer<typeof V1PostsResponseSchema>

/** Server-side default ordering; `orderBy` query param is currently fixed to `publishedDate:desc`. */
const POSTS_LIST_ORDER = { publishedDate: 'desc' } as const

export type FetchPostsListOpts = {
  take: number
  skip: number
}

/** `GET /v1/posts` */
export async function fetchPostsList(
  opts: FetchPostsListOpts,
  now: Date
): Promise<V1PostsResponse> {
  const posts = await prisma.post.findMany({
    take: opts.take,
    skip: opts.skip,
    where: buildPublicPostWhere(now),
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
