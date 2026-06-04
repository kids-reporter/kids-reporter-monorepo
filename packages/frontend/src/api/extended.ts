import {
  getMemberEssayAnswersHasLikedContentApi,
  getMemberPostsWithAnswersContentApi,
} from '@/api/content-api/member-activity'
import type {
  MemberEssayAnswersHasLikedResponse,
  MemberPostsWithAnswersPayload,
  V1MemberPostsWithAnswersQuery,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'

export type { MemberPostsWithAnswersPayload }

export const getMemberPostsWithAnswers = async (
  variables: V1MemberPostsWithAnswersQuery & { accessToken: string },
  traceHeaders?: TraceHeaders
): Promise<MemberPostsWithAnswersPayload | undefined> => {
  const { accessToken, take, cursor } = variables
  return getMemberPostsWithAnswersContentApi({
    accessToken,
    take: take ?? undefined,
    cursor: cursor ?? undefined,
    traceHeaders,
  })
}

export const getMemberEssayAnswersHasLiked = async (
  variables: {
    accessToken: string
    essayAnswerIds?: string[] | string | null
  },
  traceHeaders?: TraceHeaders
): Promise<MemberEssayAnswersHasLikedResponse | undefined> => {
  const { accessToken, essayAnswerIds: rawIds } = variables
  const essayAnswerIds = Array.isArray(rawIds)
    ? rawIds
    : rawIds != null && rawIds !== ''
      ? String(rawIds)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
  return getMemberEssayAnswersHasLikedContentApi({
    accessToken,
    essayAnswerIds,
    traceHeaders,
  })
}
