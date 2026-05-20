import {
  V1MemberProfilePatchBodySchema,
  V1MemberProfileResponseSchema,
} from '@kids-reporter/api-types'
import type { z } from 'zod'

import {
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

export type MemberProfilePatchBody = z.infer<
  typeof V1MemberProfilePatchBodySchema
>

export async function getMemberProfileMeContentApi({
  accessToken,
  signal,
  traceHeaders,
}: {
  accessToken: string
  signal?: AbortSignal
  traceHeaders?: Record<string, string>
}) {
  const response = await sendContentApiRequest({
    path: '/v1/members/me',
    method: 'GET',
    authToken: accessToken,
    signal,
    traceHeaders,
  })
  const parsed = V1MemberProfileResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for GET /v1/members/me',
      parsed.error
    )
  }
  return parsed.data
}

export async function updateMemberProfileMeContentApi({
  accessToken,
  data,
  traceHeaders,
}: {
  accessToken: string
  data: MemberProfilePatchBody
  traceHeaders?: Record<string, string>
}) {
  const body = V1MemberProfilePatchBodySchema.parse(data)
  const response = await sendContentApiRequest({
    path: '/v1/members/me',
    method: 'PATCH',
    authToken: accessToken,
    body,
    traceHeaders,
  })
  const parsed = V1MemberProfileResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for PATCH /v1/members/me',
      parsed.error
    )
  }
  return parsed.data
}
