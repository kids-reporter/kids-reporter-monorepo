import { V1HotTopicsResponseSchema } from '@kids-reporter/api-types'

import {
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

export async function getHotTopicsContentApi({
  traceHeaders,
}: {
  traceHeaders?: Record<string, string>
} = {}) {
  const response = await sendContentApiRequest({
    path: '/v1/hot-topics',
    method: 'GET',
    traceHeaders,
  })
  const parsed = V1HotTopicsResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for /v1/hot-topics',
      parsed.error
    )
  }
  return parsed.data
}
