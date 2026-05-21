import type { GetAuthorPostsCountQuery } from '__generated__/operations/content.generated'
import {
  V1AuthorBySlugMetaResponseSchema,
  V1AuthorBySlugPostsResponseSchema,
  V1AuthorPostsCountResponseSchema,
} from '@kids-reporter/api-types'

import type { TraceHeaders } from '@/types/trace-headers'
import {
  ContentApiRequestError,
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

import { normalizePostCardsForGql } from './normalize-post-for-gql'

export async function getAuthorMetaContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}) {
  const enc = encodeURIComponent(slug)
  const response = await sendContentApiRequest({
    path: `/v1/authors/${enc}/meta`,
    traceHeaders,
  })
  const parsed = V1AuthorBySlugMetaResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api schema mismatch author meta',
      parsed.error
    )
  }
  const a = parsed.data
  return {
    ...a,
    bio: a.bio ?? undefined,
    image: a.image ?? undefined,
  }
}

export async function getAuthorPostsCountContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}): Promise<GetAuthorPostsCountQuery['author'] | undefined> {
  try {
    const enc = encodeURIComponent(slug)
    const response = await sendContentApiRequest({
      path: `/v1/authors/${enc}/posts-count`,
      traceHeaders,
    })
    const parsed = V1AuthorPostsCountResponseSchema.safeParse(response)
    if (!parsed.success) {
      throw contentApiResponseParseError(
        'content-api schema mismatch author posts-count',
        parsed.error
      )
    }
    return {
      postsCount: parsed.data.postsCount,
    } as GetAuthorPostsCountQuery['author']
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

export async function getAuthorPostsContentApi({
  slug,
  take,
  skip,
  orderBy,
  traceHeaders,
}: {
  slug: string
  take?: number
  skip?: number
  orderBy?: string
  traceHeaders?: TraceHeaders
}) {
  const enc = encodeURIComponent(slug)
  const response = await sendContentApiRequest({
    path: `/v1/authors/${enc}/posts`,
    query: { take, skip, orderBy: orderBy ?? 'publishedDate:desc' },
    traceHeaders,
  })
  const parsed = V1AuthorBySlugPostsResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api schema mismatch author posts',
      parsed.error
    )
  }
  const a = parsed.data
  return {
    ...a,
    bio: a.bio ?? undefined,
    email: a.email ?? undefined,
    avatar: a.avatar ?? undefined,
    posts: normalizePostCardsForGql(a.posts),
  }
}
