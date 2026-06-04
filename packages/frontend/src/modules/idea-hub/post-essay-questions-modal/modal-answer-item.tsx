'use client'

import Image from 'next/image'
import { useCallback } from 'react'

import { usePostEssayQuestionEssayAnswersInfinityQuery } from '@/api-utils/react-query/hooks/post-essay-question'
import Divider from '@/components/divider'
import { DEFAULT_AVATAR } from '@/constants'
import { DEFAULT_TEXT_HOLDER } from '@/constants/input-field'
import { StarIcon, StarIconUnfilled } from '@/icons/miscellaneous'
import type { PostEssayAnswerOrderBy, QnaMemberPublic } from '@/types/api'

import {
  formatChineseDate,
  getDisplayLikesCount,
  getMemberDisplayName,
} from '../utils'
import useOptimisticLikeAnswer from './hooks/use-optimistic-like-answer'

export const QUESTION_ANSWER_ITEM_TAKE = 5

type ModalAnswerItemProps = {
  answer: NonNullable<
    ReturnType<typeof usePostEssayQuestionEssayAnswersInfinityQuery>['data']
  >['pages'][number][number]
  hasLiked: boolean
  memberId: string
  accessToken: string
  questionId: string
  answerOrderBy: PostEssayAnswerOrderBy[]
  essayAnswerIds: string[]
  isLast: boolean
}

function ModalAnswerItem({
  answer,
  hasLiked,
  memberId,
  accessToken,
  questionId,
  answerOrderBy,
  essayAnswerIds,
  isLast,
}: ModalAnswerItemProps) {
  const { toggleLike, isPending } = useOptimisticLikeAnswer({
    answerId: answer.id.toString(),
    memberId,
    accessToken,
    questionId,
    answerOrderBy,
    answerTake: QUESTION_ANSWER_ITEM_TAKE,
    essayAnswerIds,
  })

  const isLoggedIn = !!memberId && !!accessToken

  const handleLikeClick = useCallback(async () => {
    if (!memberId || !accessToken || isPending) return
    try {
      await toggleLike(hasLiked)
    } catch (error) {
      console.error('Failed to toggle like:', error)
    }
  }, [memberId, accessToken, isPending, toggleLike, hasLiked])

  return (
    <>
      <div className="min-w-0">
        <div className="flex min-w-0 flex-col gap-2 rounded-[12px]">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex max-w-full min-w-0 flex-1 items-center gap-2 overflow-hidden">
              <div className="relative size-10 flex-shrink-0 overflow-hidden rounded-full border-2 border-neutral-200">
                <Image
                  src={answer.member?.avatar?.fileUrl || DEFAULT_AVATAR}
                  alt={
                    answer.member
                      ? getMemberDisplayName(answer.member as QnaMemberPublic)
                      : 'User'
                  }
                  className="size-full bg-white object-cover"
                  fill
                  sizes="40px"
                />
              </div>
              <div className="flex min-w-0 flex-col">
                <div className="flex min-w-0 items-center gap-1 prose-p2-bold text-neutral-900">
                  <span className="truncate">
                    {answer.member
                      ? getMemberDisplayName(answer.member as QnaMemberPublic)
                      : DEFAULT_TEXT_HOLDER}
                  </span>
                  {!!memberId && answer.member?.id === memberId && (
                    <span className="shrink-0">(你)</span>
                  )}
                </div>
                {answer.createdAt && (
                  <span className="prose-p2 text-neutral-600">
                    {formatChineseDate(answer.createdAt)}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLikeClick}
              disabled={!memberId || !accessToken || isPending}
              className="flex w-14 cursor-pointer items-center gap-1 disabled:cursor-not-allowed"
              type="button"
              aria-label={`${hasLiked ? 'Unlike' : 'Like'} answer: ${answer.content ?? ''}`}
            >
              <div className="flex flex-1 items-center justify-center text-neutral-600">
                {isLoggedIn && hasLiked && (
                  <StarIcon className="text-yellow-400" />
                )}
                {isLoggedIn && !hasLiked && <StarIconUnfilled />}
                {!isLoggedIn && <StarIcon />}
              </div>

              <span className="w-7 text-left prose-p2 text-neutral-600">
                {getDisplayLikesCount(answer.likesCount)}
              </span>
            </button>
          </div>
          <p className="prose-p1-bold text-neutral-900">
            {answer.content ?? ''}
          </p>
        </div>
      </div>
      {!isLast && <Divider />}
    </>
  )
}

export default ModalAnswerItem
