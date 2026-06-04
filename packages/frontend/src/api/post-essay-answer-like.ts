import {
  createPostEssayAnswerLikeContentApi,
  deletePostEssayAnswerLikeContentApi,
} from '@/api/content-api/post-qna'
import type {
  CreatePostEssayAnswerLikeResponse,
  V1CreatePostEssayAnswerLikeBody,
} from '@/types/api'

export const createPostEssayAnswerLike = async (
  body: V1CreatePostEssayAnswerLikeBody,
  accessToken: string
): Promise<CreatePostEssayAnswerLikeResponse | undefined> => {
  return createPostEssayAnswerLikeContentApi(body, accessToken)
}

export const deletePostEssayAnswerLike = async (
  id: string | number,
  accessToken: string
) => {
  return deletePostEssayAnswerLikeContentApi(id, accessToken)
}
