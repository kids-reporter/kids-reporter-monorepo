import { emitStructured } from '@kids-reporter/logger'
import { useQueryClient } from '@tanstack/react-query'
import errors from '@twreporter/errors'
import { useCallback } from 'react'

import { DEFAULT_PAGE_ITEM_COUNT } from '@/api-utils/react-query/constants'
import { useMemberPostsWithAnswersInfinityQuery } from '@/api-utils/react-query/hooks/extended'
import {
  useCreatePostChoiceAnswerMutation,
  usePostChoiceAnswersQuery,
  useUpdatePostChoiceAnswerMutation,
} from '@/api-utils/react-query/hooks/post-choice-answer'
import {
  useCreatePostEssayAnswerMutation,
  usePostEssayAnswersQuery,
  useUpdatePostEssayAnswerMutation,
} from '@/api-utils/react-query/hooks/post-essay-answer'
import { BaodaozaiQuestions } from '@/services/call-baodaozai'

function useBatchSubmitAnswers({
  memberId,
  postSlug,
  accessToken,
}: {
  memberId: string
  postSlug: string
  accessToken: string
}) {
  const queryClient = useQueryClient()

  const handleInvalidateAnswers = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: usePostEssayAnswersQuery.getQueryKey({ memberId, postSlug }),
    })
    queryClient.invalidateQueries({
      queryKey: usePostChoiceAnswersQuery.getQueryKey({ memberId, postSlug }),
    })
    queryClient.invalidateQueries({
      queryKey: useMemberPostsWithAnswersInfinityQuery.getQueryKey({
        memberId,
        take: DEFAULT_PAGE_ITEM_COUNT,
      }),
    })
  }, [queryClient, memberId, postSlug])

  const { data: essayAnswers } = usePostEssayAnswersQuery({
    memberId,
    postSlug,
    accessToken,
  })
  const { data: choiceAnswers } = usePostChoiceAnswersQuery({
    memberId,
    postSlug,
    accessToken,
  })

  const { mutateAsync: createPostEssayAnswer } =
    useCreatePostEssayAnswerMutation({
      accessToken,
    })
  const { mutateAsync: createPostChoiceAnswer } =
    useCreatePostChoiceAnswerMutation({
      accessToken,
    })

  const { mutateAsync: updatePostEssayAnswer } =
    useUpdatePostEssayAnswerMutation({
      accessToken,
    })
  const { mutateAsync: updatePostChoiceAnswer } =
    useUpdatePostChoiceAnswerMutation({
      accessToken,
    })

  const handleBatchSubmitAnswers = useCallback(
    async (
      answers: Record<number, string>,
      questions: BaodaozaiQuestions | null
    ) => {
      if (!questions) return

      const existingEssayQuestionIds =
        essayAnswers?.map((answer) => answer.question?.id ?? '') ?? []
      const existingChoiceQuestionIds =
        choiceAnswers?.map((answer) => answer.question?.id ?? '') ?? []

      await Promise.all(
        questions.map(async (question, index) => {
          if (!answers[index]) return
          try {
            if (question.type === 'essay') {
              const existingEssayQuestionIndex =
                existingEssayQuestionIds.indexOf(question.id)
              if (existingEssayQuestionIndex !== -1) {
                const answerId =
                  essayAnswers?.[existingEssayQuestionIndex]?.id ?? ''
                await updatePostEssayAnswer({
                  id: answerId,
                  data: {
                    content: answers[index],
                  },
                })
                return
              }
              await createPostEssayAnswer({
                data: {
                  question: {
                    connect: {
                      id: question.id,
                    },
                  },
                  content: answers[index],
                },
              })
            }
            if (question.type === 'choice') {
              const existingChoiceQuestionIndex =
                existingChoiceQuestionIds.indexOf(question.id)
              if (existingChoiceQuestionIndex !== -1) {
                const answerId =
                  choiceAnswers?.[existingChoiceQuestionIndex]?.id ?? ''
                await updatePostChoiceAnswer({
                  id: answerId,
                  data: {
                    choiceIndex: parseInt(answers[index]),
                  },
                })
                return
              }
              await createPostChoiceAnswer({
                data: {
                  question: {
                    connect: {
                      id: question.id,
                    },
                  },
                  choiceIndex: parseInt(answers[index]),
                },
              })
            }
          } catch (_err) {
            const err = errors.helpers.wrap(
              _err,
              'BatchSubmitAnswersError',
              'Error batch submitting answers',
              question
            )

            const msg = errors.helpers.printAll(
              err,
              {
                withStack: true,
                withPayload: true,
              },
              0,
              0
            )

            emitStructured({ severity: 'ERROR', message: msg })
          }
        })
      )
      handleInvalidateAnswers()
    },
    [
      essayAnswers,
      choiceAnswers,
      createPostEssayAnswer,
      updatePostEssayAnswer,
      createPostChoiceAnswer,
      updatePostChoiceAnswer,
      handleInvalidateAnswers,
    ]
  )

  return { onBatchSubmitAnswers: handleBatchSubmitAnswers }
}

export default useBatchSubmitAnswers
