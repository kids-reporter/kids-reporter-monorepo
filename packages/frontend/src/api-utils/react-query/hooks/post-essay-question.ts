import { useInfiniteQuery } from '@tanstack/react-query'

import { getPostEssayQuestionEssayAnswers } from '@/api/post-essay-question'
import type {
  PostEssayAnswerOrderBy,
  V1PostEssayQuestionAnswersRequest,
} from '@/types/api'

const POST_ESSAY_QUESTION_ESSAY_ANSWERS_INFINITY_QUERY_KEY =
  'post-essay-questions'

function toQuestionAnswersRequest({
  questionId,
  answerOrderBy,
  answerTake,
  answerSkip,
}: {
  questionId: string
  answerOrderBy: PostEssayAnswerOrderBy[]
  answerTake: number
  answerSkip?: number
}): V1PostEssayQuestionAnswersRequest {
  const parsedId = Number(questionId)
  if (!Number.isFinite(parsedId)) {
    throw new Error('invalid question id')
  }
  const first = answerOrderBy[0]
  return {
    questionId: parsedId,
    answerTake,
    answerSkip,
    answerOrderBy:
      first === 'likesCount:desc' ? 'likesCount:desc' : 'createdAt:desc',
  }
}

export function usePostEssayQuestionEssayAnswersInfinityQuery({
  questionId,
  answerOrderBy,
  answerTake,
}: {
  questionId: string
  answerOrderBy: PostEssayAnswerOrderBy[]
  answerTake: number
}) {
  return useInfiniteQuery({
    queryKey: usePostEssayQuestionEssayAnswersInfinityQuery.getQueryKey({
      questionId,
      answerOrderBy,
      answerTake,
    }),
    queryFn: ({ pageParam }) =>
      getPostEssayQuestionEssayAnswers(
        toQuestionAnswersRequest({
          questionId,
          answerOrderBy,
          answerTake,
          answerSkip: pageParam,
        })
      ),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const hasNextPage = lastPage.length === answerTake
      return hasNextPage ? lastPageParam + answerTake : undefined
    },
    initialPageParam: 0,
  })
}

usePostEssayQuestionEssayAnswersInfinityQuery.getQueryKey = ({
  questionId,
  answerOrderBy,
  answerTake,
}: {
  questionId: string
  answerOrderBy: PostEssayAnswerOrderBy[]
  answerTake: number
}) => [
  POST_ESSAY_QUESTION_ESSAY_ANSWERS_INFINITY_QUERY_KEY,
  questionId,
  answerOrderBy,
  answerTake,
]
