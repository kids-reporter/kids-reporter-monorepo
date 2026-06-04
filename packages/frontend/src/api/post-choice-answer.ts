import {
  createPostChoiceAnswerContentApi,
  getPostChoiceAnswersByMemberIdContentApi,
  updatePostChoiceAnswerContentApi,
} from '@/api/content-api/post-qna'
import type {
  CreatePostChoiceAnswerResponse,
  PostChoiceAnswer,
  UpdatePostChoiceAnswerResponse,
  V1CreatePostChoiceAnswerBody,
  V1PatchPostChoiceAnswerBody,
} from '@/types/api'

export const getPostChoiceAnswersByMemberId = async (
  _memberId: string,
  accessToken: string,
  postSlug?: string
): Promise<PostChoiceAnswer[]> => {
  return getPostChoiceAnswersByMemberIdContentApi({
    accessToken,
    postSlug,
  })
}

export const createPostChoiceAnswer = async (
  body: V1CreatePostChoiceAnswerBody,
  accessToken: string
): Promise<CreatePostChoiceAnswerResponse | undefined> => {
  return createPostChoiceAnswerContentApi(body, accessToken)
}

export const updatePostChoiceAnswer = async (
  variables: { id: string | number; data: V1PatchPostChoiceAnswerBody },
  accessToken: string
): Promise<UpdatePostChoiceAnswerResponse | undefined> => {
  return updatePostChoiceAnswerContentApi(variables, accessToken)
}
