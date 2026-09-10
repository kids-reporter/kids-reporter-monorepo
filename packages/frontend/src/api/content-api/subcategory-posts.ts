import { V1SubcategoryBySlugPostsResponseSchema } from '@kids-reporter/api-types'

import type { TraceHeaders } from '@/types/trace-headers'
import {
  contentApiResponseParseError,
  isContentApiNotFound,
  sendContentApiRequest,
} from '@/utils/send-content-api'

import { normalizePostCardsForGql } from './normalize-post-for-gql'

export async function getSubcategoryPostsContentApi({
  slug,
  take,
  skip,
  traceHeaders,
}: {
  slug: string
  take?: number
  skip?: number
  traceHeaders?: TraceHeaders
}) {
  try {
    const enc = encodeURIComponent(slug)
    const response = await sendContentApiRequest({
      path: `/v1/subcategories/${enc}/posts`,
      query: { take, skip },
      traceHeaders,
    })
    const parsed = V1SubcategoryBySlugPostsResponseSchema.safeParse(response)
    if (!parsed.success) {
      throw contentApiResponseParseError(
        'content-api schema mismatch subcategory posts',
        parsed.error
      )
    }
    const s = parsed.data
    return {
      ...s,
      relatedPosts: normalizePostCardsForGql(s.relatedPosts),
    }
  } catch (e) {
    if (isContentApiNotFound(e)) {
      return undefined
    }
    throw e
  }
}
