import { GetEssayQuestionEssayAnswersQuery } from '__generated__/operations/answers.generated'
import {
  PostEssayAnswerOrderByInput,
  PostEssayQuestionWhereUniqueInput,
} from '__generated__/types'

import { getPostEssayQuestionEssayAnswersContentApi } from '@/api/content-api/post-qna'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getPostEssayQuestionEssayAnswers = async ({
  where,
  answerOrderBy,
  answerTake,
  answerSkip,
}: {
  where: PostEssayQuestionWhereUniqueInput
  answerOrderBy: PostEssayAnswerOrderByInput[]
  answerTake: number
  answerSkip: number
}) => {
  if (envVars.useContentApi) {
    try {
      return await getPostEssayQuestionEssayAnswersContentApi({
        where: { id: String(where.id) },
        answerOrderBy,
        answerTake,
        answerSkip,
      })
    } catch (err) {
      logContentApiFallback('getPostEssayQuestionEssayAnswers', err)
    }
  }

  const response = await sendRestGqlRequest<GetEssayQuestionEssayAnswersQuery>({
    operation: 'post-essay-question-answers',
    method: 'GET',
    variables: {
      where,
      answerOrderBy,
      answerTake,
      answerSkip,
    },
  })
  return response?.data?.data?.postEssayQuestion?.answers ?? []
}
