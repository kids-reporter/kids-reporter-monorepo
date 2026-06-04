import { getAuthorAvatarBySlugContentApi } from '@/api/content-api/author-avatar'
import {
  getAuthorMetaContentApi,
  getAuthorPostsContentApi,
} from '@/api/content-api/author-collection'
import { DEFAULT_AVATAR } from '@/constants'
import type {
  AuthorMetaResponse,
  AuthorPostsResponse,
  V1AuthorPostsRequest,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'

export async function getAuthorAvatarBySlug({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}): Promise<string> {
  const tiny = await getAuthorAvatarBySlugContentApi({ slug, traceHeaders })
  return tiny || DEFAULT_AVATAR
}

export async function getAuthorMetaBySlug({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}): Promise<AuthorMetaResponse | undefined> {
  return getAuthorMetaContentApi({ slug, traceHeaders })
}

export async function getAuthorPostsBySlugPaged(
  variables: V1AuthorPostsRequest,
  traceHeaders?: TraceHeaders
): Promise<AuthorPostsResponse | undefined> {
  const { slug, take, skip, orderBy } = variables
  if (!slug) return undefined
  return getAuthorPostsContentApi({
    slug,
    take: take ?? undefined,
    skip: skip ?? undefined,
    orderBy: orderBy ?? 'publishedDate:desc',
    traceHeaders,
  })
}
