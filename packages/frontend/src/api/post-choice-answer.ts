import {
  CreatePostChoiceAnswerMutation,
  CreatePostChoiceAnswerMutationVariables,
  GetPostChoiceAnswersQuery,
  GetPostChoiceAnswersQueryVariables,
  UpdatePostChoiceAnswerMutation,
  UpdatePostChoiceAnswerMutationVariables,
} from '__generated__/operations/answers.generated'

import {
  createPostChoiceAnswerContentApi,
  getPostChoiceAnswersByMemberIdContentApi,
  updatePostChoiceAnswerContentApi,
} from '@/api/content-api/post-qna'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getPostChoiceAnswersByMemberId = async (
  memberId: string,
  accessToken: string,
  postSlug?: string
) => {
  if (envVars.useContentApi) {
    void memberId
    try {
      return await getPostChoiceAnswersByMemberIdContentApi({
        accessToken,
        postSlug,
      })
    } catch (err) {
      logContentApiFallback('getPostChoiceAnswersByMemberId', err)
    }
  }

  const variables: GetPostChoiceAnswersQueryVariables = {
    where: {
      member: { id: { equals: memberId } },
      ...(postSlug && { question: { post: { slug: { equals: postSlug } } } }),
    },
  }

  const response = await sendRestGqlRequest<GetPostChoiceAnswersQuery>({
    operation: 'post-choice-answers',
    method: 'GET',
    variables,
    authToken: accessToken,
  })
  return response?.data?.data?.postChoiceAnswers ?? []
}
export const createPostChoiceAnswer = async (
  variables: CreatePostChoiceAnswerMutationVariables,
  accessToken: string
) => {
  if (envVars.useContentApi) {
    try {
      return await createPostChoiceAnswerContentApi(variables, accessToken)
    } catch (err) {
      logContentApiFallback('createPostChoiceAnswer', err)
    }
  }

  const response = await sendRestGqlRequest<CreatePostChoiceAnswerMutation>({
    operation: 'create-post-choice-answer',
    method: 'POST',
    variables,
    authToken: accessToken,
  })
  return response?.data?.data?.createPostChoiceAnswer
}

export const updatePostChoiceAnswer = async (
  variables: UpdatePostChoiceAnswerMutationVariables,
  accessToken: string
) => {
  if (envVars.useContentApi) {
    try {
      return await updatePostChoiceAnswerContentApi(variables, accessToken)
    } catch (err) {
      logContentApiFallback('updatePostChoiceAnswer', err)
    }
  }

  const response = await sendRestGqlRequest<UpdatePostChoiceAnswerMutation>({
    operation: 'update-post-choice-answer',
    method: 'POST',
    variables,
    authToken: accessToken,
  })
  return response?.data?.data?.updatePostChoiceAnswer
}
