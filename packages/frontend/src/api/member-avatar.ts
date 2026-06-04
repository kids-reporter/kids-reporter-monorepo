import axios from 'axios'

import { CONTENT_API_ORIGIN, INTERNAL_CONTENT_API_ORIGIN } from '@/constants'
import envVars from '@/environment-variables'
import type { MemberAvatar } from '@/types/api'
import { sendContentApiRequest } from '@/utils/send-content-api'
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
): Promise<{ id: string; name: string } | undefined> => {
  const formData = new FormData()
  const uploadFileName = fileName || file.name || 'memberAvatar'
  formData.append('file', file, uploadFileName)

  const response = await axios.post<{ id: string; name: string }>(
    memberAvatarUploadUrl(),
    formData,
    {
      headers: {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...buildTraceHeaders(),
      },
      withCredentials: false,
      timeout: envVars.requestTimeoutMs,
    }
  )
  return response.data
}

export const deleteMemberAvatar = async (
  _avatarId: string,
  accessToken: string
): Promise<MemberAvatar | undefined> => {
  return sendContentApiRequest<MemberAvatar>({
    path: '/v1/members/me/avatar',
    method: 'DELETE',
    authToken: accessToken,
  })
}
