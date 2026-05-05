'use client'

import Image from 'next/image'

import { DEFAULT_AVATAR } from '@/constants'
import { LightbulbIcon, StarIcon } from '@/icons/miscellaneous'
import { useAuthStore } from '@/services/auth/auth-store'

import { PostWithTwoTopLikesAnswersPerQuestion } from '../../types'
import {
  formatChineseDate,
  getDisplayLikesCount,
  getMemberDisplayName,
} from '../../utils'

type QuestionAnswerCardProps = {
  question: PostWithTwoTopLikesAnswersPerQuestion['posts'][number]['postEssayQuestions'][number]
  postSlug: string
  onOpenModal: (postSlug: string) => void
}

const MAX_VISIBLE_ANSWERS = 2

function QuestionAnswerCard({
  question,
  postSlug,
  onOpenModal,
}: QuestionAnswerCardProps) {
  const memberId = useAuthStore((s) => s.member?.id ?? '')
  const visibleAnswers = question.answers.slice(0, MAX_VISIBLE_ANSWERS)
  const hasMoreAnswers = question.answers.length > MAX_VISIBLE_ANSWERS

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white">
      {/* Question Section */}
      <div className="flex gap-4 rounded-t-xl bg-blue-100 px-4 py-4">
        <div className="flex items-start gap-2">
          <div className="flex items-center">
            <LightbulbIcon />
          </div>
          <p className="prose-p1-bold text-neutral-900">{question.title}</p>
        </div>
      </div>

      {/* Answers Section */}
      <div className="flex flex-col gap-4 px-4 py-4">
        {visibleAnswers.map((answer, index) => {
          const memberDisplayName = getMemberDisplayName(answer.member)
          return (
            <div key={answer.id}>
              <div className="flex flex-col gap-2">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-full border-2 border-neutral-200">
                      <Image
                        src={answer.member?.avatar?.fileUrl || DEFAULT_AVATAR}
                        alt={memberDisplayName}
                        className="size-full bg-white object-cover"
                        fill
                        sizes="40px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <div className="flex min-w-0 items-center gap-1 prose-p2-bold text-neutral-900">
                        <span className="truncate">{memberDisplayName}</span>
                        {!!memberId && answer.member?.id === memberId && (
                          <span className="shrink-0">(你)</span>
                        )}
                      </div>
                      <span className="prose-p2 text-neutral-600">
                        {formatChineseDate(answer.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex w-14 items-center gap-1 text-neutral-600">
                    <StarIcon />
                    <span className="w-7 prose-p2">
                      {getDisplayLikesCount(answer.likesCount)}
                    </span>
                  </div>
                </div>

                <p className="prose-p1-bold text-neutral-900">
                  {answer.content}
                </p>
              </div>

              {/* Divider between answers (except last visible answer) */}
              {index < visibleAnswers.length - 1 && (
                <div className="mt-4 h-0 border-t-2 border-neutral-200" />
              )}
            </div>
          )
        })}

        {/* Show More Button */}
        {hasMoreAnswers && (
          <button
            onClick={() => onOpenModal(postSlug)}
            type="button"
            aria-label={`Show more answers for this question: ${question.title}`}
            className="mt-2 flex w-full cursor-pointer items-center justify-center px-5 py-1 prose-p1 text-neutral-600 hover:text-red-400 active:text-red-500"
          >
            顯示更多
          </button>
        )}
      </div>
    </div>
  )
}

export default QuestionAnswerCard
