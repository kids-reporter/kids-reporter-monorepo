import { useMutation } from '@tanstack/react-query'

import {
  createPostEssayAnswerLike,
  deletePostEssayAnswerLike,
} from '@/api/post-essay-answer-like'
import type { V1CreatePostEssayAnswerLikeBody } from '@/types/api'

export function useCreatePostEssayAnswerLikeMutation({
  accessToken,
}: {
  accessToken: string
}) {
  return useMutation({
    mutationFn: (body: V1CreatePostEssayAnswerLikeBody) =>
      createPostEssayAnswerLike(body, accessToken),
  })
}

export function useDeletePostEssayAnswerLikeMutation({
  accessToken,
}: {
  accessToken: string
}) {
  return useMutation({
    mutationFn: (id: string | number) =>
      deletePostEssayAnswerLike(id, accessToken),
  })
}
