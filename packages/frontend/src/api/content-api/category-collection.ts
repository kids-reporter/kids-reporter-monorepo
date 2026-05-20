import {
  V1CategoryBySlugCategoryPostsResponseSchema,
  V1CategoryBySlugMetadataResponseSchema,
  V1CategoryBySlugSubcategoriesThemeResponseSchema,
} from '@kids-reporter/api-types'

import type { TraceHeaders } from '@/types/trace-headers'
import {
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

import { normalizePostCardsForGql } from './normalize-post-for-gql'

export async function getCategoryPostsContentApi({
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
  const enc = encodeURIComponent(slug)
  const response = await sendContentApiRequest({
    path: `/v1/categories/by-slug/${enc}/posts`,
    query: { take, skip },
    traceHeaders,
  })
  const parsed = V1CategoryBySlugCategoryPostsResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api schema mismatch category posts',
      parsed.error
    )
  }
  const b = parsed.data
  return {
    ...b,
    relatedPosts: normalizePostCardsForGql(b.relatedPosts),
  }
}

export async function getCategoryMetadataContentApi({
  slug,
  subcategorySlug,
  traceHeaders,
}: {
  slug: string
  subcategorySlug?: string
  traceHeaders?: TraceHeaders
}) {
  const enc = encodeURIComponent(slug)
  const response = await sendContentApiRequest({
    path: `/v1/categories/by-slug/${enc}/metadata`,
    query: subcategorySlug ? { subcategorySlug } : undefined,
    traceHeaders,
  })
  const parsed = V1CategoryBySlugMetadataResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api schema mismatch category metadata',
      parsed.error
    )
  }
  const c = parsed.data
  return {
    ...c,
    ogImage: c.ogImage ?? undefined,
    subcategories: c.subcategories.map((s) => ({
      ...s,
      ogImage: s.ogImage ?? undefined,
    })),
  }
}

export async function getCategorySubcategoriesThemeContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}) {
  const enc = encodeURIComponent(slug)
  const response = await sendContentApiRequest({
    path: `/v1/categories/by-slug/${enc}/subcategories-theme`,
    traceHeaders,
  })
  const parsed =
    V1CategoryBySlugSubcategoriesThemeResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api schema mismatch category theme',
      parsed.error
    )
  }
  return parsed.data
}
