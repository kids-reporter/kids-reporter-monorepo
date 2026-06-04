import { useMutation, useQuery } from '@tanstack/react-query'

import {
  createPostChoiceAnswer,
  getPostChoiceAnswersByMemberId,
  updatePostChoiceAnswer,
} from '@/api/post-choice-answer'
import type { V1CreatePostChoiceAnswerBody } from '@/types/api'

export const POST_CHOICE_ANSWERS_QUERY_KEY = 'post-choice-answers'

export function usePostChoiceAnswersQuery({
  memberId,
  accessToken,
  postSlug,
}: {
  memberId: string
  accessToken: string
  postSlug?: string
}) {
  return useQuery({
    queryKey: usePostChoiceAnswersQuery.getQueryKey({ memberId, postSlug }),
    queryFn: () =>
      getPostChoiceAnswersByMemberId(memberId, accessToken, postSlug),
    enabled: !!memberId && !!accessToken,
    staleTime: Infinity,
  })
}

usePostChoiceAnswersQuery.getQueryKey = ({
  memberId,
  postSlug,
}: {
  memberId: string
  postSlug?: string
}) => [POST_CHOICE_ANSWERS_QUERY_KEY, memberId, postSlug ?? 'all-posts']

export function useCreatePostChoiceAnswerMutation({
  accessToken,
}: {
  accessToken: string
}) {
  return useMutation({
    mutationFn: (body: V1CreatePostChoiceAnswerBody) =>
      createPostChoiceAnswer(body, accessToken),
  })
}

export function useUpdatePostChoiceAnswerMutation({
  accessToken,
}: {
  accessToken: string
}) {
  return useMutation({
    mutationFn: (variables: {
      id: string | number
      data: { choiceIndex?: number }
    }) => updatePostChoiceAnswer(variables, accessToken),
  })
}
