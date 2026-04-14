import type { ReactNode } from 'react'

import type { SearchPageRequest } from '@/api-utils/react-query/hooks/search-results-infinite'
import Divider from '@/components/divider'

import LoadMoreResults from './components/load-more-results'
import SearchHero from './components/search-hero'
import SearchInput from './components/search-input'
import type { SearchCardItem, SearchNextQuery } from './types'

function SearchModule({
  query,
  totalResults,
  cardItems,
  nextQuery,
  initialPageRequest,
  emptyState,
}: {
  query: string
  totalResults?: string
  cardItems: SearchCardItem[]
  nextQuery?: SearchNextQuery
  initialPageRequest?: SearchPageRequest
  emptyState?: ReactNode
}) {
  return (
    <main className="relative mx-auto flex w-full max-w-300 flex-col items-center px-6 pt-8 pb-14 tablet:px-8 tablet:pt-12 tablet:pb-16 desktop:px-12 desktop:pt-16 desktop:pb-24 hd:pt-20 hd:pb-30">
      <div className="flex w-full flex-col items-center">
        <SearchHero />
        <SearchInput value={query} />
      </div>

      {totalResults ? (
        <div className="w-full">
          <Divider />
          <p className="pt-4 text-left prose-p2 text-neutral-600">
            找到 {totalResults} 項結果
          </p>
        </div>
      ) : null}

      {cardItems.length > 0 && initialPageRequest != null ? (
        <div className="w-full">
          <LoadMoreResults
            initialPage={{ items: cardItems, nextQuery }}
            initialPageRequest={initialPageRequest}
          />
        </div>
      ) : (
        <div className="w-full">{emptyState}</div>
      )}

      <div className="absolute right-0 bottom-0 left-0">
        <Divider />
      </div>
    </main>
  )
}

export default SearchModule
