import {
  getTagMetaContentApi,
  getTagPostsContentApi,
} from '@/api/content-api/tag-collection'
import type {
  TagMetaResponse,
  TagPostsResponse,
  V1TagPostsRequest,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'

export async function getTagMetaBySlug({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}): Promise<TagMetaResponse | undefined> {
  return getTagMetaContentApi({ slug, traceHeaders })
}

export async function getTagPostsBySlugPaged(
  variables: V1TagPostsRequest,
  traceHeaders?: TraceHeaders
): Promise<TagPostsResponse | undefined> {
  const { slug, take, skip, orderBy } = variables
  if (!slug) return undefined
  return getTagPostsContentApi({
    slug,
    take: take ?? undefined,
    skip: skip ?? undefined,
    orderBy: orderBy ?? 'publishedDate:desc',
    traceHeaders,
  })
}
