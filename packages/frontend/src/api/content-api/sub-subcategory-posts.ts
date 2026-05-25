import { V1SubSubcategoryBySlugPostsResponseSchema } from '@kids-reporter/api-types'

import type { TraceHeaders } from '@/types/trace-headers'
import {
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

import { normalizePostCardsForGql } from './normalize-post-for-gql'

export async function getSubSubcategoryPostsContentApi({
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
    path: `/v1/sub-subcategories/${enc}/posts`,
    query: { take, skip, orderBy: orderBy ?? 'publishedDate:desc' },
    traceHeaders,
  })
  const parsed = V1SubSubcategoryBySlugPostsResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api schema mismatch sub-subcategory posts',
      parsed.error
    )
  }
  const s = parsed.data
  return {
    ...s,
    relatedPosts: normalizePostCardsForGql(s.relatedPosts),
  }
}
