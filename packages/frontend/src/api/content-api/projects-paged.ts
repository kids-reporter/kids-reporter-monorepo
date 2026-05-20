import { V1ProjectsResponseSchema } from '@kids-reporter/api-types'

import {
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

export async function getProjectsListContentApi({
  take,
  skip,
  includeRelatedPosts,
  traceHeaders,
}: {
  take?: number
  skip?: number
  includeRelatedPosts?: boolean
  traceHeaders?: Record<string, string>
}) {
  const response = await sendContentApiRequest({
    path: '/v1/projects',
    method: 'GET',
    query: {
      take,
      skip: skip ?? 0,
      ...(includeRelatedPosts !== undefined
        ? {
            includeRelatedPosts: includeRelatedPosts
              ? 'true'
              : ('false' as const),
          }
        : {}),
      orderBy: 'publishedDate:desc',
    },
    traceHeaders,
  })

  const parsed = V1ProjectsResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for /v1/projects',
      parsed.error
    )
  }
  return parsed.data
}
