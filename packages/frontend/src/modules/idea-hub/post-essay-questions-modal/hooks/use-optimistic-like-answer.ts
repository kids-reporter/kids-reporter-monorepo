import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef, useState } from 'react'

import { useGetMemberEssayAnswersHasLikedQuery } from '@/api-utils/react-query/hooks/extended'
import { useAllPostEssayAnswersQuery } from '@/api-utils/react-query/hooks/post-essay-answer'
import {
  useCreatePostEssayAnswerLikeMutation,
  useDeletePostEssayAnswerLikeMutation,
} from '@/api-utils/react-query/hooks/post-essay-answer-like'
import { usePostEssayQuestionEssayAnswersInfinityQuery } from '@/api-utils/react-query/hooks/post-essay-question'
import type { PostEssayAnswerOrderBy } from '@/types/api'

function useOptimisticLikeAnswer({
  answerId,
  memberId,
  accessToken,
  questionId,
  answerOrderBy,
  answerTake,
  essayAnswerIds,
}: {
  answerId: string
  memberId: string
  accessToken: string
  questionId: string
  answerOrderBy: PostEssayAnswerOrderBy[]
  answerTake: number
  essayAnswerIds: string[]
}) {
  const queryClient = useQueryClient()
  const toggleLockRef = useRef(false)
  const [interactionLocked, setInteractionLocked] = useState(false)

  const createMutation = useCreatePostEssayAnswerLikeMutation({ accessToken })
  const deleteMutation = useDeletePostEssayAnswerLikeMutation({ accessToken })

  const toggleLike = useCallback(
    async (hasLiked: boolean) => {
      if (
        toggleLockRef.current ||
        createMutation.isPending ||
        deleteMutation.isPending
      ) {
        return
      }
      toggleLockRef.current = true
      setInteractionLocked(true)
      const answersQueryKey =
        usePostEssayQuestionEssayAnswersInfinityQuery.getQueryKey({
          questionId,
          answerOrderBy,
          answerTake,
        })

      const allPostEssayAnswersQueryKey =
        useAllPostEssayAnswersQuery.getQueryKey({
          orderBy: 'createdAt:desc',
          take: answerTake,
        })

      const hasLikedQueryKey =
        useGetMemberEssayAnswersHasLikedQuery.getQueryKey({
          memberId,
          essayAnswerIds,
        })

      // Optimistically update answers query
      await queryClient.cancelQueries({ queryKey: answersQueryKey })
      const previousAnswersData = queryClient.getQueryData(answersQueryKey)

      // Optimistically update all post essay answers query
      await queryClient.cancelQueries({ queryKey: allPostEssayAnswersQueryKey })
      const previousAllPostEssayAnswersData = queryClient.getQueryData(
        allPostEssayAnswersQueryKey
      )

      // Optimistically update hasLiked query
      await queryClient.cancelQueries({ queryKey: hasLikedQueryKey })
      const previousHasLikedData = queryClient.getQueryData(hasLikedQueryKey)

      // Optimistically update answers: increment/decrement likesCount
      queryClient.setQueryData(
        answersQueryKey,
        (
          old: ReturnType<
            typeof usePostEssayQuestionEssayAnswersInfinityQuery
          >['data']
        ) => {
          if (!old?.pages) return old

          return {
            ...old,
            pages: old.pages.map((page) =>
              page.map((answer) => {
                if (answer.id.toString() === answerId) {
                  return {
                    ...answer,
                    likesCount: hasLiked
                      ? Math.max(0, (answer.likesCount ?? 0) - 1)
                      : (answer.likesCount ?? 0) + 1,
                  }
                }
                return answer
              })
            ),
          }
        }
      )

      // Optimistically update all post essay answers query
      queryClient.setQueryData(
        allPostEssayAnswersQueryKey,
        (old: ReturnType<typeof useAllPostEssayAnswersQuery>['data']) => {
          if (!Array.isArray(old)) return old

          return old.map((answer) => {
            if (answer.id.toString() === answerId) {
              return {
                ...answer,
                likesCount: hasLiked
                  ? Math.max(0, (answer.likesCount ?? 0) - 1)
                  : (answer.likesCount ?? 0) + 1,
              }
            }
            return answer
          })
        }
      )

      // Optimistically update hasLiked query
      queryClient.setQueryData(
        hasLikedQueryKey,
        (
          old: ReturnType<typeof useGetMemberEssayAnswersHasLikedQuery>['data']
        ) => {
          if (!Array.isArray(old)) return old

          const existingIndex = old.findIndex(
            (item) => item?.essayAnswerId === answerId
          )

          if (existingIndex >= 0) {
            // Update existing entry
            return old.map((item) => {
              if (item?.essayAnswerId === answerId) {
                return {
                  ...item,
                  hasLiked: !hasLiked,
                }
              }
              return item
            })
          } else {
            // Add new entry if it doesn't exist
            return [
              ...old,
              {
                essayAnswerId: answerId,
                hasLiked: !hasLiked,
                essayAnswerLikeId: '',
              },
            ]
          }
        }
      )

      try {
        if (hasLiked) {
          const hasLikedRows =
            queryClient.getQueryData<
              ReturnType<typeof useGetMemberEssayAnswersHasLikedQuery>['data']
            >(hasLikedQueryKey)
          const row = Array.isArray(hasLikedRows)
            ? hasLikedRows.find((r) => r?.essayAnswerId === answerId)
            : undefined
          const likeIdRaw = (row as { essayAnswerLikeId?: string } | undefined)
            ?.essayAnswerLikeId
          const likeId =
            typeof likeIdRaw === 'string' ? likeIdRaw.trim() : undefined

          if (likeId) {
            await deleteMutation.mutateAsync(likeId)
          } else if (likeIdRaw === '') {
            // Create mutation still in flight after optimistic like; rollback this unlike attempt.
            if (previousAnswersData) {
              queryClient.setQueryData(answersQueryKey, previousAnswersData)
            }
            if (previousAllPostEssayAnswersData) {
              queryClient.setQueryData(
                allPostEssayAnswersQueryKey,
                previousAllPostEssayAnswersData
              )
            }
            if (previousHasLikedData) {
              queryClient.setQueryData(hasLikedQueryKey, previousHasLikedData)
            }
            return
          } else {
            if (previousAnswersData) {
              queryClient.setQueryData(answersQueryKey, previousAnswersData)
            }
            if (previousAllPostEssayAnswersData) {
              queryClient.setQueryData(
                allPostEssayAnswersQueryKey,
                previousAllPostEssayAnswersData
              )
            }
            if (previousHasLikedData) {
              queryClient.setQueryData(hasLikedQueryKey, previousHasLikedData)
            }
            return
          }
        } else {
          // Create like
          const createdLike = await createMutation.mutateAsync({
            answerId,
          })

          const createdLikeId = (createdLike as { id?: string } | undefined)?.id
          if (createdLikeId) {
            queryClient.setQueryData(
              hasLikedQueryKey,
              (
                old: ReturnType<
                  typeof useGetMemberEssayAnswersHasLikedQuery
                >['data']
              ) => {
                if (!Array.isArray(old)) return old

                return old.map((item) => {
                  if (item?.essayAnswerId !== answerId) return item
                  return {
                    ...item,
                    essayAnswerLikeId: createdLikeId,
                  }
                })
              }
            )
          }
        }
      } catch (error) {
        // Rollback on error
        if (previousAnswersData) {
          queryClient.setQueryData(answersQueryKey, previousAnswersData)
        }
        if (previousAllPostEssayAnswersData) {
          queryClient.setQueryData(
            allPostEssayAnswersQueryKey,
            previousAllPostEssayAnswersData
          )
        }
        if (previousHasLikedData) {
          queryClient.setQueryData(hasLikedQueryKey, previousHasLikedData)
        }
        throw error
      } finally {
        toggleLockRef.current = false
        setInteractionLocked(false)
        // Invalidate to refetch fresh data
        queryClient.invalidateQueries({ queryKey: answersQueryKey })
        queryClient.invalidateQueries({ queryKey: allPostEssayAnswersQueryKey })
        queryClient.invalidateQueries({ queryKey: hasLikedQueryKey })
      }
    },
    [
      questionId,
      answerOrderBy,
      answerTake,
      memberId,
      essayAnswerIds,
      queryClient,
      answerId,
      deleteMutation,
      createMutation,
    ]
  )

  return {
    toggleLike,
    isPending:
      createMutation.isPending || deleteMutation.isPending || interactionLocked,
  }
}

export default useOptimisticLikeAnswer
