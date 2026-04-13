import type { ReactNode } from 'react'

import type { SearchPageRequest } from '@/api-utils/react-query/hooks/search-results-infinite'

import LoadMoreResults from './components/load-more-results'
import SearchHero from './components/search-hero'
import SearchInput from './components/search-input'
import type { SearchCardItem, SearchNextQuery } from './types'

export function SearchModule({
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
    <main className="mx-auto flex w-full max-w-desktop flex-col items-center px-6 pt-12 pb-16 tablet:px-8">
      <div className="flex w-full flex-col items-center">
        <SearchHero />
        <SearchInput value={query} />
      </div>

      {totalResults ? (
        <div className="w-full">
          <div className="h-px w-full bg-neutral-400" />
          <p className="pt-6 text-left prose-p2 text-neutral-600 tablet:pt-10 desktop:pt-12">
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
    </main>
  )
}

export default SearchModule
