import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import {
  getMemberEssayAnswersHasLiked,
  getMemberPostsWithAnswers,
} from '@/api/extended'
import type { V1MemberPostsWithAnswersQuery } from '@/types/api'

const MEMBER_POSTS_WITH_ANSWERS_QUERY_KEY = 'member-posts-with-answers'

export function useMemberPostsWithAnswersInfinityQuery({
  accessToken,
  memberId,
  take = 5,
}: V1MemberPostsWithAnswersQuery & {
  accessToken: string
  memberId: string
}) {
  return useInfiniteQuery({
    queryKey: useMemberPostsWithAnswersInfinityQuery.getQueryKey({
      memberId,
      take,
    }),
    queryFn: ({ pageParam }) =>
      getMemberPostsWithAnswers({
        take,
        cursor: pageParam ?? undefined,
        accessToken,
      }),
    enabled: !!memberId && !!accessToken,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage?.nextCursor ?? undefined,
  })
}

useMemberPostsWithAnswersInfinityQuery.getQueryKey = ({
  memberId,
  take,
}: {
  memberId: string
  take: number
}) => [MEMBER_POSTS_WITH_ANSWERS_QUERY_KEY, memberId, take]

const MEMBER_ESSAY_ANSWERS_HAS_LIKED_QUERY_KEY =
  'member-essay-answers-has-liked'

export function useGetMemberEssayAnswersHasLikedQuery({
  memberId,
  essayAnswerIds,
  accessToken,
}: {
  memberId: string
  essayAnswerIds: string[]
  accessToken: string
}) {
  return useQuery({
    queryKey: useGetMemberEssayAnswersHasLikedQuery.getQueryKey({
      memberId,
      essayAnswerIds,
    }),
    queryFn: () =>
      getMemberEssayAnswersHasLiked({
        essayAnswerIds,
        accessToken,
      }),
    enabled: !!memberId && !!accessToken && essayAnswerIds.length > 0,
  })
}

useGetMemberEssayAnswersHasLikedQuery.getQueryKey = ({
  memberId,
  essayAnswerIds,
}: {
  memberId: string
  essayAnswerIds: string[]
}) => [MEMBER_ESSAY_ANSWERS_HAS_LIKED_QUERY_KEY, memberId, essayAnswerIds]
