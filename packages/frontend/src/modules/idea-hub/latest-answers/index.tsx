'use client'

import { Fragment, memo } from 'react'

import { useAllPostEssayAnswersQuery } from '@/api-utils/react-query/hooks/post-essay-answer'
import Divider from '@/components/divider'
import { useAuthStore } from '@/services/auth/auth-store'

import { getMemberDisplayName } from '../utils'
import AnswerCard from './answer-card'
import AnswerCardSkeleton from './answer-card-skeleton'

type LatestAnswersProps = {
  onOpenModal: (postSlug: string) => void
}

function LatestAnswers({ onOpenModal }: LatestAnswersProps) {
  const memberId = useAuthStore((s) => s.member?.id ?? '')
  const { data: latestEssayAnswers = [], isPending: isLoading } =
    useAllPostEssayAnswersQuery({
      orderBy: [{ createdAt: 'desc' }],
      take: 3,
    })

  const answers = latestEssayAnswers.map((answer) => {
    const question = answer.question
    return {
      id: answer.id,
      content: answer.content ?? '',
      memberName: getMemberDisplayName(answer.member),
      memberAvatar: answer.member?.avatar?.fileUrl ?? '',
      likesCount: answer.likesCount ?? 0,
      postSlug: question?.post?.slug ?? '',
      createdAt: answer.createdAt ?? '',
      questionTitle: question?.title ?? '',
      isOwnAnswer: !!memberId && answer.member?.id === memberId,
    }
  })

  const handleAnswerCardClick = (postSlug: string) => {
    onOpenModal(postSlug)
  }

  return (
    <div className="mt-10 mb-14 flex w-[calc(100%+48px)] flex-col gap-6 tablet:mt-12 tablet:mb-16 tablet:w-full tablet:gap-8 desktop:mt-18 desktop:mb-24 desktop:w-228 desktop:gap-10 desktop:px-14 hd:mt-24 hd:mb-30 hd:w-248 hd:max-w-none">
      <div className="flex items-center gap-3 pl-6 tablet:pl-0">
        <div className="h-8 w-1.5 rounded-md bg-yellow-400" />
        <h3 className="prose-h3-small font-swei! text-neutral-900 desktop:prose-h3-large">
          最新回答
        </h3>
      </div>
      <div className="mx-6 rounded-[20px] border-2 border-neutral-200 bg-white tablet:mx-0 desktop:rounded-[30px]">
        {isLoading && (
          <div className="flex flex-col">
            {[1, 2, 3].map((index) => (
              <Fragment key={index}>
                {index > 1 && (
                  <hr className="mx-5 border-t border-neutral-200" />
                )}
                <AnswerCardSkeleton />
              </Fragment>
            ))}
          </div>
        )}
        {!isLoading && answers.length > 0 && (
          <div className="flex flex-col">
            {answers.map((answer, index) => (
              <Fragment key={answer.id}>
                {index > 0 && <Divider className="mx-5 w-auto" />}
                <AnswerCard
                  {...answer}
                  onClick={() => handleAnswerCardClick(answer.postSlug)}
                />
              </Fragment>
            ))}
          </div>
        )}
        {!isLoading && answers.length === 0 && (
          <div className="flex w-full items-center justify-center py-12 text-center">
            <p className="prose-p1 text-neutral-500">尚無回答</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default memo(LatestAnswers)
