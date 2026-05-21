import type {
  GetProjectMetaQuery,
  GetProjectQuery,
  GetProjectRelatedPostsCountQuery,
} from '__generated__/operations/content.generated'
import {
  V1ProjectBySlugDetailResponseSchema,
  V1ProjectBySlugMetaResponseSchema,
  V1ProjectRelatedPostsCountResponseSchema,
} from '@kids-reporter/api-types'

import {
  ContentApiRequestError,
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

export async function getProjectMetaContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: Headers | Record<string, string | undefined>
}): Promise<GetProjectMetaQuery['project'] | undefined> {
  try {
    const response = await sendContentApiRequest({
      path: `/v1/projects/${encodeURIComponent(slug)}/meta`,
      method: 'GET',
      traceHeaders,
    })
    const parsed = V1ProjectBySlugMetaResponseSchema.safeParse(response)
    if (!parsed.success) {
      throw contentApiResponseParseError(
        'content-api schema mismatch project meta',
        parsed.error
      )
    }
    const m = parsed.data
    return {
      publishedDate: m.publishedDate,
      ogDescription: m.ogDescription ?? undefined,
      ogTitle: m.ogTitle,
      ogImage: m.ogImage ?? undefined,
    } as GetProjectMetaQuery['project']
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

export async function getProjectDetailContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: Headers | Record<string, string | undefined>
}): Promise<GetProjectQuery['project'] | undefined> {
  try {
    const response = await sendContentApiRequest({
      path: `/v1/projects/${encodeURIComponent(slug)}`,
      method: 'GET',
      traceHeaders,
    })
    const parsed = V1ProjectBySlugDetailResponseSchema.safeParse(response)
    if (!parsed.success) {
      throw contentApiResponseParseError(
        'content-api schema mismatch project detail',
        parsed.error
      )
    }
    return parsed.data as GetProjectQuery['project']
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

export async function getProjectRelatedPostsCountContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: Headers | Record<string, string | undefined>
}): Promise<GetProjectRelatedPostsCountQuery['project'] | undefined> {
  try {
    const response = await sendContentApiRequest({
      path: `/v1/projects/${encodeURIComponent(slug)}/related-posts-count`,
      method: 'GET',
      traceHeaders,
    })
    const parsed = V1ProjectRelatedPostsCountResponseSchema.safeParse(response)
    if (!parsed.success) {
      throw contentApiResponseParseError(
        'content-api schema mismatch project related-posts-count',
        parsed.error
      )
    }
    return {
      relatedPostsCount: parsed.data.relatedPostsCount,
    } as GetProjectRelatedPostsCountQuery['project']
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}
