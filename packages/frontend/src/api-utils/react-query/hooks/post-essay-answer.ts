import { useMutation, useQuery } from '@tanstack/react-query'

import {
  createPostEssayAnswer,
  getAllPostEssayAnswers,
  getPostEssayAnswersByMemberId,
  updatePostEssayAnswer,
} from '@/api/post-essay-answer'
import type {
  V1AllPostEssayAnswersQuery,
  V1CreatePostEssayAnswerBody,
} from '@/types/api'

const POST_ESSAY_ANSWERS_QUERY_KEY = 'post-essay-answers'

export function usePostEssayAnswersQuery({
  memberId,
  accessToken,
  postSlug,
}: {
  memberId: string
  accessToken: string
  postSlug?: string
}) {
  return useQuery({
    queryKey: usePostEssayAnswersQuery.getQueryKey({ memberId, postSlug }),
    queryFn: () =>
      getPostEssayAnswersByMemberId(memberId, accessToken, postSlug),
    enabled: !!memberId && !!accessToken,
    staleTime: Infinity,
  })
}
usePostEssayAnswersQuery.getQueryKey = ({
  memberId,
  postSlug,
}: {
  memberId: string
  postSlug?: string
}) => [POST_ESSAY_ANSWERS_QUERY_KEY, memberId, postSlug ?? 'all-posts']

export function useAllPostEssayAnswersQuery(
  query?: Pick<V1AllPostEssayAnswersQuery, 'orderBy' | 'take'>
) {
  return useQuery({
    queryKey: useAllPostEssayAnswersQuery.getQueryKey(query),
    queryFn: () => getAllPostEssayAnswers(query),
    staleTime: Infinity,
  })
}

useAllPostEssayAnswersQuery.getQueryKey = (
  query?: Pick<V1AllPostEssayAnswersQuery, 'orderBy' | 'take'>
) => [
  POST_ESSAY_ANSWERS_QUERY_KEY,
  'all-members',
  'all-posts',
  query?.orderBy ?? 'createdAt:desc',
  query?.take,
]

export function useCreatePostEssayAnswerMutation({
  accessToken,
}: {
  accessToken: string
}) {
  return useMutation({
    mutationFn: (body: V1CreatePostEssayAnswerBody) =>
      createPostEssayAnswer(body, accessToken),
  })
}

export function useUpdatePostEssayAnswerMutation({
  accessToken,
}: {
  accessToken: string
}) {
  return useMutation({
    mutationFn: (variables: {
      id: string | number
      data: { content: string }
    }) => updatePostEssayAnswer(variables, accessToken),
  })
}
