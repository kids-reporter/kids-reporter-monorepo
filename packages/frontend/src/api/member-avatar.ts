import {
  CreateMemberAvatarMutation,
  DeleteMemberAvatarMutation,
} from '__generated__/operations/members.generated'
import axios, { AxiosResponse } from 'axios'

import {
  CONTENT_API_ORIGIN,
  INTERNAL_CONTENT_API_ORIGIN,
  REST_GQL_ENDPOINT,
} from '@/constants'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendContentApiRequest } from '@/utils/send-content-api'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'
import { buildTraceHeaders } from '@/utils/trace-context'

const memberAvatarUploadUrl = () => {
  const base =
    typeof window === 'undefined'
      ? INTERNAL_CONTENT_API_ORIGIN
      : CONTENT_API_ORIGIN
  return `${base}/v1/members/me/avatar`
}

export const uploadMemberAvatar = async (
  file: File,
  accessToken: string,
  fileName?: string
) => {
  const formData = new FormData()
  const uploadFileName = fileName || file.name || 'memberAvatar'
  formData.append('file', file, uploadFileName)

  if (envVars.useContentApi) {
    try {
      const response = await axios.post<{ id: string; name: string }>(
        memberAvatarUploadUrl(),
        formData,
        {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...buildTraceHeaders(),
          },
          // content-api /v1/* routes are bearer-token auth, not cookie auth
          withCredentials: false,
          timeout: envVars.requestTimeoutMs,
        }
      )
      return response.data
    } catch (err) {
      logContentApiFallback('uploadMemberAvatar', err)
    }
  }

  const response: AxiosResponse<{
    status: string
    data: CreateMemberAvatarMutation
  }> = await axios.post(`${REST_GQL_ENDPOINT}/create-member-avatar`, formData, {
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      'apollo-require-preflight': 'true',
      ...buildTraceHeaders(),
    },
    withCredentials: true,
  })

  return response?.data?.data?.item
}

export const deleteMemberAvatar = async (
  avatarId: string,
  accessToken: string
) => {
  if (envVars.useContentApi) {
    void avatarId
    try {
      const body = await sendContentApiRequest<
        NonNullable<DeleteMemberAvatarMutation['deleteMemberAvatar']>
      >({
        path: '/v1/members/me/avatar',
        method: 'DELETE',
        authToken: accessToken,
      })
      return body
    } catch (err) {
      logContentApiFallback('deleteMemberAvatar', err)
    }
  }

  const response = await sendRestGqlRequest<DeleteMemberAvatarMutation>({
    operation: 'delete-member-avatar',
    method: 'POST',
    variables: {
      where: { id: avatarId },
    },
    authToken: accessToken,
  })

  return response?.data?.data?.deleteMemberAvatar
}
