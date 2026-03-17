import {
  CreateMemberAvatarMutation,
  DeleteMemberAvatarMutation,
} from '__generated__/operations/members.generated'
import axios, { AxiosResponse } from 'axios'

import { REST_GQL_ENDPOINT } from '@/constants'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'
import { buildTraceHeaders } from '@/utils/trace-context'

export const uploadMemberAvatar = async (
  file: File,
  accessToken: string,
  fileName?: string
) => {
  // Use REST GQL upload endpoint; gateway rebuilds GraphQL multipart payload.
  const formData = new FormData()
  const uploadFileName = fileName || file.name || 'memberAvatar'
  formData.append('file', file, uploadFileName)

  // Route to the REST handler that proxies multipart uploads to GraphQL.
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
