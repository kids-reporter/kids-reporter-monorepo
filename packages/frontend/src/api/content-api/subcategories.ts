import { V1SubcategoriesResponseSchema } from '@kids-reporter/api-types'

import type { TraceHeaders } from '@/types/trace-headers'
import {
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

export async function getSubcategoriesContentApi({
  traceHeaders,
}: {
  traceHeaders?: TraceHeaders
} = {}) {
  const response = await sendContentApiRequest({
    path: '/v1/subcategories',
    method: 'GET',
    traceHeaders,
  })
  const parsed = V1SubcategoriesResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for /v1/subcategories',
      parsed.error
    )
  }
  return parsed.data.map((s) => ({
    ...s,
    id: String(s.id),
  }))
}
