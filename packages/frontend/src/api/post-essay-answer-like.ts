import {
  CreatePostEssayAnswerLikeMutation,
  CreatePostEssayAnswerLikeMutationVariables,
  DeletePostEssayAnswerLikeMutation,
  DeletePostEssayAnswerLikeMutationVariables,
} from '__generated__/operations/answers.generated'

import {
  createPostEssayAnswerLikeContentApi,
  deletePostEssayAnswerLikeContentApi,
} from '@/api/content-api/post-qna'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const createPostEssayAnswerLike = async (
  variables: CreatePostEssayAnswerLikeMutationVariables,
  accessToken: string
) => {
  if (envVars.useContentApi) {
    try {
      return await createPostEssayAnswerLikeContentApi(variables, accessToken)
    } catch (err) {
      logContentApiFallback('createPostEssayAnswerLike', err)
    }
  }

  const response = await sendRestGqlRequest<CreatePostEssayAnswerLikeMutation>({
    operation: 'create-post-essay-answer-like',
    method: 'POST',
    variables,
    authToken: accessToken,
  })
  return response?.data?.data?.createPostEssayAnswerLike
}

export const deletePostEssayAnswerLike = async (
  variables: DeletePostEssayAnswerLikeMutationVariables,
  accessToken: string
) => {
  const whereId = variables.where?.id
  const hasLikeIdForContentApi =
    whereId != null && String(whereId).trim() !== ''

  if (envVars.useContentApi && hasLikeIdForContentApi) {
    try {
      return await deletePostEssayAnswerLikeContentApi(variables, accessToken)
    } catch (err) {
      logContentApiFallback('deletePostEssayAnswerLike', err)
    }
  }

  const response = await sendRestGqlRequest<DeletePostEssayAnswerLikeMutation>({
    operation: 'delete-post-essay-answer-like',
    method: 'POST',
    variables,
    authToken: accessToken,
  })
  return response?.data?.data?.deletePostEssayAnswerLike
}
