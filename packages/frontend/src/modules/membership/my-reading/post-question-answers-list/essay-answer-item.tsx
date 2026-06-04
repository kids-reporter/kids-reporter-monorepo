'use client'

import { emitStructured } from '@kids-reporter/logger'
import { useQueryClient } from '@tanstack/react-query'
import errors from '@twreporter/errors'
import { useState } from 'react'
import { toast } from 'sonner'

import { DEFAULT_PAGE_ITEM_COUNT } from '@/api-utils/react-query/constants'
import { useMemberPostsWithAnswersInfinityQuery } from '@/api-utils/react-query/hooks/extended'
import {
  usePostEssayAnswersQuery,
  useUpdatePostEssayAnswerMutation,
} from '@/api-utils/react-query/hooks/post-essay-answer'
import Divider from '@/components/divider'
import { StarIcon } from '@/icons/miscellaneous'
import {
  getDisplayLikesCount,
  getMemberDisplayName,
} from '@/modules/idea-hub/utils'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'
import BaodaozaiQAModal from '@/services/call-baodaozai/components/qa-modal'
import { CallBaodaozaiProvider } from '@/services/call-baodaozai/context'
import type { MemberReadingEssayAnswer } from '@/types/api'

function EssayAnswerItem({
  answer,
  postSlug,
  onBackToFirstPage,
}: {
  answer: MemberReadingEssayAnswer
  postSlug: string
  onBackToFirstPage: (slug: string) => void
}) {
  const likesCount = getDisplayLikesCount(answer.likesCount)
  const [isOpen, setIsOpen] = useState(false)
  const { tokens, member } = useHydratedAuthStore()
  const { mutateAsync: updatePostEssayAnswer } =
    useUpdatePostEssayAnswerMutation({
      accessToken: tokens?.accessToken ?? '',
    })

  const queryClient = useQueryClient()

  const handleSubmit = async (answers: Record<number, string>) => {
    try {
      await updatePostEssayAnswer({
        id: answer.id,
        data: {
          content: answers[0],
        },
      })
      toast.success('編輯成功')
      setIsOpen(false)
      queryClient.invalidateQueries({
        queryKey: usePostEssayAnswersQuery.getQueryKey({
          memberId: member?.id ?? '',
          postSlug,
        }),
      })
      queryClient.invalidateQueries({
        queryKey: useMemberPostsWithAnswersInfinityQuery.getQueryKey({
          memberId: member?.id ?? '',
          take: DEFAULT_PAGE_ITEM_COUNT,
        }),
      })
      onBackToFirstPage(postSlug)
    } catch (_err) {
      const err = errors.helpers.wrap(
        _err,
        'EssayAnswerItemError',
        'Error updating essay answer',
        answer.id
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
      toast.error('編輯失敗，請稍後再試。')
    }
  }

  return (
    <>
      <div className="flex gap-4 rounded-xl bg-white px-5 py-4">
        <p className="prose-p1-medium text-neutral-900">
          {answer.content || ''}
          &nbsp;（
          <button
            type="button"
            className="cursor-pointer text-neutral-600 underline"
            onClick={() => setIsOpen(true)}
          >
            編輯答案
          </button>
          ）
        </p>
        <Divider direction="vertical" className="ml-auto h-auto self-stretch" />
        <div className="flex flex-col items-center gap-1">
          <div className="text-neutral-600">
            <StarIcon />
          </div>
          <span className="prose-p2 text-neutral-600">{likesCount}</span>
        </div>
      </div>
      <CallBaodaozaiProvider>
        <BaodaozaiQAModal
          questions={[
            {
              id: answer.question?.id ?? '',
              type: 'essay',
              title: answer.question?.title ?? '',
              hint: answer.question?.hint ?? '',
              defaultAnswer: answer.content ?? '',
            },
          ]}
          onClose={() => setIsOpen(false)}
          onSubmit={handleSubmit}
          isOpen={isOpen}
          mode="update"
          memberDisplayName={getMemberDisplayName(member, true)}
        />
      </CallBaodaozaiProvider>
    </>
  )
}

export default EssayAnswerItem
