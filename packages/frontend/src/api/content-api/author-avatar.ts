import { V1AuthorAvatarResponseSchema } from '@kids-reporter/api-types'

import type { TraceHeaders } from '@/types/trace-headers'
import {
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

export async function getAuthorAvatarBySlugContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}) {
  const encoded = encodeURIComponent(slug)
  const response = await sendContentApiRequest({
    path: `/v1/authors/${encoded}/avatar`,
    method: 'GET',
    traceHeaders,
  })
  const parsed = V1AuthorAvatarResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for /v1/authors/:slug/avatar',
      parsed.error
    )
  }
  return parsed.data.tiny
}
