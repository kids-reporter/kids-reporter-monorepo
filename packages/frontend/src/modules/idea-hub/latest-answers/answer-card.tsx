'use client'

import Image from 'next/image'

import { DEFAULT_AVATAR } from '@/constants'
import { StarIcon } from '@/icons/miscellaneous'

import { formatChineseDate, getDisplayLikesCount } from '../utils'

type AnswerCardProps = {
  content: string
  memberName: string
  memberAvatar?: string
  likesCount: number
  createdAt: string
  questionTitle: string
  onClick?: () => void
}

function AnswerCard({
  content,
  memberName,
  memberAvatar,
  likesCount,
  createdAt,
  questionTitle,
  onClick,
}: AnswerCardProps) {
  return (
    <div className="p-5 desktop:p-0 desktop:px-5 desktop:first:pt-5 desktop:last:pb-5">
      <div
        className="flex cursor-pointer flex-col gap-3 transition-all duration-300 hover:bg-neutral-200 desktop:m-5"
        onClick={onClick}
        role="button"
        aria-label={`View answer: ${content}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-[52px] shrink-0 overflow-hidden rounded-full border-2 border-neutral-200">
              <Image
                src={memberAvatar || DEFAULT_AVATAR}
                alt={memberName}
                className="size-full bg-white object-cover"
                fill
                sizes="52px"
              />
            </div>
            <div className="flex flex-col">
              <span className="prose-p1-bold text-neutral-900 desktop:prose-h6-small desktop:font-swei!">
                {memberName}
              </span>
              <span className="prose-p2 text-neutral-600">
                {formatChineseDate(createdAt)}
              </span>
            </div>
          </div>
          <div className="flex w-14 items-center gap-1 text-neutral-600">
            <StarIcon />
            <span className="w-7 prose-p2">
              {getDisplayLikesCount(likesCount)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="line-clamp-3 prose-p1-bold text-neutral-900">
            {content}
          </p>
          <p className="truncate prose-p1 text-neutral-800">
            回應問題：{questionTitle}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnswerCard
