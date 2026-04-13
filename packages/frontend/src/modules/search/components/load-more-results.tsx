'use client'

import { Button } from '@kids-reporter/routing-ui'

import {
  type SearchInfinitePage,
  type SearchPageRequest,
  useSearchResultsInfiniteQuery,
} from '@/api-utils/react-query/hooks/search-results-infinite'

import ResultCards from './result-cards'

function LoadMoreResults({
  initialPage,
  initialPageRequest,
}: {
  initialPage: SearchInfinitePage
  initialPageRequest: SearchPageRequest
}) {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError } =
    useSearchResultsInfiniteQuery({ initialPageRequest, initialPage })

  const cardItems = data?.pages.flatMap((p) => p.items) ?? []

  return (
    <div className="w-full">
      <ResultCards items={cardItems} />

      {isError ? (
        <p className="prose-p2 text-neutral-600">載入發生錯誤，請稍候再試</p>
      ) : null}

      {hasNextPage ? (
        <div className="flex w-full justify-center">
          <Button
            type="button"
            variant="secondary"
            size={44}
            isLoading={isFetchingNextPage}
            onClick={() => {
              void fetchNextPage()
            }}
            className="mx-auto mt-4 w-[300px] tablet:w-[240px]"
          >
            載入更多
          </Button>
        </div>
      ) : null}
    </div>
  )
}

export default LoadMoreResults
