import { V1PopularKeywordsResponseSchema } from '@kids-reporter/api-types'

import {
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

export async function getPopularKeywordsContentApi({
  traceHeaders,
}: {
  traceHeaders?: Record<string, string>
} = {}) {
  const response = await sendContentApiRequest({
    path: '/v1/popular-keywords',
    method: 'GET',
    traceHeaders,
  })
  const parsed = V1PopularKeywordsResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for /v1/popular-keywords',
      parsed.error
    )
  }
  return parsed.data
}
