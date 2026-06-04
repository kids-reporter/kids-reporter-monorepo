import {
  createPostEssayAnswerContentApi,
  getAllPostEssayAnswersContentApi,
  getPostEssayAnswersByMemberIdContentApi,
  updatePostEssayAnswerContentApi,
} from '@/api/content-api/post-qna'
import type {
  AllPostEssayAnswersItem,
  CreatePostEssayAnswerResponse,
  PostEssayAnswer,
  UpdatePostEssayAnswerResponse,
  V1AllPostEssayAnswersQuery,
  V1CreatePostEssayAnswerBody,
  V1PatchPostEssayAnswerBody,
} from '@/types/api'

export const getAllPostEssayAnswers = async (
  query?: Pick<V1AllPostEssayAnswersQuery, 'orderBy' | 'take'>
): Promise<AllPostEssayAnswersItem[]> => {
  return getAllPostEssayAnswersContentApi(
    {
      orderBy: query?.orderBy ?? 'createdAt:desc',
      take: query?.take ?? undefined,
    },
    undefined
  )
}

export const getPostEssayAnswersByMemberId = async (
  _memberId: string,
  accessToken: string,
  postSlug?: string
): Promise<PostEssayAnswer[]> => {
  return getPostEssayAnswersByMemberIdContentApi({
    accessToken,
    postSlug,
  })
}

export const createPostEssayAnswer = async (
  body: V1CreatePostEssayAnswerBody,
  accessToken: string
): Promise<CreatePostEssayAnswerResponse | undefined> => {
  return createPostEssayAnswerContentApi(body, accessToken)
}

export const updatePostEssayAnswer = async (
  variables: { id: string | number; data: V1PatchPostEssayAnswerBody },
  accessToken: string
): Promise<UpdatePostEssayAnswerResponse | undefined> => {
  const content = variables.data.content
  if (typeof content !== 'string') {
    throw new Error('updatePostEssayAnswer requires data.content')
  }
  return updatePostEssayAnswerContentApi(
    { id: variables.id, data: { content } },
    accessToken
  )
}
