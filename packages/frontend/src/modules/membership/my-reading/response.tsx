'use client'

import {
  Button,
  HeaderMobileBackButtonHrefSetter,
} from '@kids-reporter/routing-ui'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

import { DEFAULT_PAGE_ITEM_COUNT } from '@/api-utils/react-query/constants'
import { useMemberPostsWithAnswersInfinityQuery } from '@/api-utils/react-query/hooks/extended'
import Pagination from '@/components/pagination'
import { ArrowLeft } from '@/icons'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'

import PostQuestionAnswersList from './post-question-answers-list'
import { parseMemberPostsWithAnswersToPostQuestionAnswers } from './utils'

function MyReadingResponse() {
  const [currentPage, setCurrentPage] = useState(1)
  const { member, tokens } = useHydratedAuthStore()
  const {
    data: memberPostsWithAnswersPageData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useMemberPostsWithAnswersInfinityQuery({
    memberId: member?.id ?? '',
    take: DEFAULT_PAGE_ITEM_COUNT,
    accessToken: tokens?.accessToken ?? '',
  })

  const loadedPages = memberPostsWithAnswersPageData?.pages ?? []
  const currentPagePosts = loadedPages[currentPage - 1]?.posts
  const postsCount = loadedPages[0]?.postsCount
  const totalPages =
    postsCount == null ? 0 : Math.ceil(postsCount / DEFAULT_PAGE_ITEM_COUNT)
  const currentPostQuestionAnswers =
    parseMemberPostsWithAnswersToPostQuestionAnswers(currentPagePosts ?? [])
  const isCurrentPagePending =
    currentPagePosts == null && (isLoading || hasNextPage || isFetchingNextPage)

  // ponytail: drains every cursor page so a numbered click can show that slice.
  // loadedPages.length is a dep because hasNextPage stays true until the last cursor,
  // so a finished fetch would not re-run this effect on its own.
  // Ceiling: one request per 5 answers. Upgrade path is offset/skip.
  useEffect(() => {
    if (hasNextPage) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, loadedPages.length])

  const [openedAccordionItemValue, setOpenedAccordionItemValue] = useState<
    string | undefined
  >(undefined)
  const handleBackToFirstPage = useCallback((slug: string) => {
    setCurrentPage(1)
    setOpenedAccordionItemValue(slug)
  }, [])
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    setOpenedAccordionItemValue(undefined)
  }, [])
  const isGetMemberPostsWithAnswersLoading =
    isLoading || !member?.id || isCurrentPagePending

  return (
    <div className="mx-auto w-full bg-neutral-100 px-6 pt-6 pb-40 tablet:px-8 tablet:pt-8 desktop:px-12 desktop:pt-16 desktop:pb-50">
      <div className="mx-auto flex w-full max-w-[789px] flex-col">
        <HeaderMobileBackButtonHrefSetter href="/myreading" />
        <div className="mb-6 flex items-center gap-4 desktop:mb-8">
          <Button
            variant="neutral"
            size={44}
            className="hidden size-11 shrink-0 p-0 tablet:inline-flex"
            asChild
          >
            <Link href="/myreading" aria-label="返回">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="prose-h4-small font-swei text-neutral-900 desktop:prose-h4-large">
            我的回答{postsCount == null ? '' : ` (${postsCount})`}
          </h1>
        </div>
        <PostQuestionAnswersList
          postQuestionAnswers={currentPostQuestionAnswers}
          isLoading={isGetMemberPostsWithAnswersLoading}
          key={currentPage}
          onBackToFirstPage={handleBackToFirstPage}
          openedAccordionItemValue={openedAccordionItemValue}
        />
        {totalPages > 0 && (
          <Pagination
            className="mt-10 desktop:mt-14"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}

export default MyReadingResponse
