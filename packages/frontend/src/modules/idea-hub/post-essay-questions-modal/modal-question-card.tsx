'use client'

import { cn, useMediaQuery } from '@kids-reporter/routing-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useGetMemberEssayAnswersHasLikedQuery } from '@/api-utils/react-query/hooks/extended'
import { usePostEssayQuestionEssayAnswersInfinityQuery } from '@/api-utils/react-query/hooks/post-essay-question'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion'
import Divider from '@/components/divider'
import useDebounceValue from '@/hooks/use-debounce-value'
import { LightbulbIcon } from '@/icons/miscellaneous'
import { useAuthStore } from '@/services/auth/auth-store'
import type { PostEssayAnswerOrderBy } from '@/types/api'

import ModalAnswerItem, { QUESTION_ANSWER_ITEM_TAKE } from './modal-answer-item'
import ModalAnswerItemSkeleton from './modal-answer-item-skeleton'

type ModalQuestionCardProps = {
  questionId: string
  questionTitle: string
  onScrollChange?: (questionId: string, isScrolled: boolean) => void
  isSelfScrolled?: boolean
}

function ModalQuestionCard({
  questionId,
  questionTitle,
  onScrollChange,
  isSelfScrolled,
}: ModalQuestionCardProps) {
  const { member, tokens } = useAuthStore()
  const memberId = member?.id ?? ''
  const accessToken = tokens?.accessToken ?? ''

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostEssayQuestionEssayAnswersInfinityQuery({
      questionId,
      answerOrderBy: ['createdAt:desc'],
      answerTake: QUESTION_ANSWER_ITEM_TAKE,
    })

  const answers = useMemo(() => {
    return data?.pages.flatMap((page) => page) ?? []
  }, [data])

  const essayAnswerIds = useMemo(
    () => answers.map((answer) => answer.id.toString()),
    [answers]
  )

  const { data: hasLikedData } = useGetMemberEssayAnswersHasLikedQuery({
    memberId,
    essayAnswerIds,
    accessToken,
  })

  const hasLikedMap = useMemo(() => {
    const map = new Map<string, boolean>()
    if (!hasLikedData) return map
    hasLikedData.forEach((item) => {
      const essayAnswerId = item?.essayAnswerId ?? ''
      const hasLiked = item?.hasLiked ?? false
      if (!essayAnswerId) return
      map.set(essayAnswerId, hasLiked)
    })
    return map
  }, [hasLikedData])

  const answerOrderBy: PostEssayAnswerOrderBy[] = ['createdAt:desc']

  const isTablet = useMediaQuery('(min-width: 768px)')
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const titleNodeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element || !hasNextPage || isFetchingNextPage || !isTablet) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 100px 0px',
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, isTablet])

  const renderTitle = useCallback(() => {
    return (
      <div className="flex flex-1 items-start gap-2" ref={titleNodeRef}>
        <div className="flex-shrink-0">
          <LightbulbIcon />
        </div>
        <div
          className={cn(
            'min-w-0 flex-1 overflow-hidden transition-all duration-300 ease-in-out',
            isSelfScrolled ? 'max-h-[1.8em]' : 'max-h-auto'
          )}
        >
          <p
            className={cn(
              'text-left prose-p1-bold text-neutral-900',
              isSelfScrolled && 'line-clamp-1'
            )}
          >
            {questionTitle}
          </p>
        </div>
      </div>
    )
  }, [questionTitle, isSelfScrolled])

  const [isScrolledState, setIsScrolledState] = useState(false)
  const debouncedIsScrolled = useDebounceValue(isScrolledState, 150)

  useEffect(() => {
    const container = scrollContainerRef.current
    const titleNode = titleNodeRef.current
    if (!container || !isTablet || !titleNode) return

    const handleScroll = () => {
      if (!isScrolledState && container.scrollTop > titleNode.clientHeight) {
        setIsScrolledState(true)
      }

      if (isScrolledState && container.scrollTop === 0) {
        setIsScrolledState(false)
      }
    }

    handleScroll()

    container.addEventListener('scroll', handleScroll, { passive: true })

    const timeoutId = setTimeout(() => {
      handleScroll()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [isTablet, isScrolledState, answers.length])

  useEffect(() => {
    if (onScrollChange) {
      onScrollChange(questionId, debouncedIsScrolled)
    }
  }, [questionId, debouncedIsScrolled, onScrollChange])

  if (answers.length === 0) {
    return null
  }

  return (
    <div
      ref={scrollContainerRef}
      className="flex flex-col overflow-hidden rounded-2xl border-2 border-neutral-200 bg-white tablet:max-h-full tablet:min-h-0 tablet:scrollbar-thin tablet:w-75 tablet:flex-shrink-0 tablet:self-start tablet:overflow-y-auto desktop:w-92 hd:w-[374px]"
    >
      <AccordionItem value={questionId} className="relative border-0">
        {isTablet ? (
          <div className="sticky top-0 z-10 rounded-t-2xl bg-blue-100 px-4 py-4">
            {renderTitle()}
          </div>
        ) : (
          <AccordionTrigger className="overflow-hidden rounded-t-2xl bg-blue-100 px-4 py-4 hover:no-underline [&[data-state=open]]:rounded-b-none">
            {renderTitle()}
          </AccordionTrigger>
        )}
        <AccordionContent className="px-0 pb-0 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <div className="flex flex-col gap-4 px-4 py-4">
            {answers.map((answer, index) => {
              const hasLiked = hasLikedMap.get(answer.id.toString()) ?? false

              return (
                <ModalAnswerItem
                  key={answer.id}
                  answer={answer}
                  hasLiked={hasLiked}
                  memberId={memberId}
                  accessToken={accessToken}
                  questionId={questionId}
                  answerOrderBy={answerOrderBy}
                  essayAnswerIds={essayAnswerIds}
                  isLast={index === answers.length - 1}
                />
              )
            })}

            {isTablet && hasNextPage && (
              <div ref={loadMoreRef} className="h-10" />
            )}
            {isFetchingNextPage && (
              <>
                <Divider />
                <ModalAnswerItemSkeleton />
              </>
            )}
            {!isTablet && hasNextPage && !isFetchingNextPage && (
              <button
                onClick={() => fetchNextPage()}
                className="mt-2 flex w-full cursor-pointer items-center justify-center px-5 py-1 prose-p1 text-neutral-600 hover:text-red-400 active:text-red-500 disabled:cursor-not-allowed disabled:text-neutral-400"
                disabled={isFetchingNextPage}
                type="button"
                aria-label={`Show more answers for this question: ${questionTitle}`}
              >
                顯示更多
              </button>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </div>
  )
}

export default ModalQuestionCard
