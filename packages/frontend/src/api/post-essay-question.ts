import { getPostEssayQuestionEssayAnswersContentApi } from '@/api/content-api/post-qna'
import type {
  PostEssayQuestionWithAnswers,
  V1PostEssayQuestionAnswersRequest,
} from '@/types/api'

export const getPostEssayQuestionEssayAnswers = async (
  request: V1PostEssayQuestionAnswersRequest
): Promise<PostEssayQuestionWithAnswers['answers']> => {
  const result = await getPostEssayQuestionEssayAnswersContentApi(request)
  return result ?? []
}
