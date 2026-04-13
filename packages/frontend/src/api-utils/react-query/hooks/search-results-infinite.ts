import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'

import envVars from '@/environment-variables'
import {
  SEARCH_API_DEFAULT_COUNT,
  type SearchCardItem,
  type SearchNextQuery,
} from '@/modules/search/types'

const SEARCH_RESULTS_INFINITE_KEY = 'search-results-infinite'

export type SearchInfinitePage = {
  items: SearchCardItem[]
  nextQuery?: SearchNextQuery
}

export type SearchPageRequest = {
  q: string
  start: number
  count: number
}

async function fetchSearchPage(
  pageParam: SearchPageRequest
): Promise<SearchInfinitePage> {
  const { q, start, count } = pageParam
  const axiosRes = await axios.get('/api/search', {
    params: { q, start, count },
    timeout: envVars.requestTimeoutMs,
  })
  if (axiosRes.data?.status === 'error') {
    throw new Error(axiosRes.data?.message ?? 'Search request failed')
  }
  const items = (axiosRes.data?.data?.items ?? []) as SearchCardItem[]
  const nextQuery = axiosRes.data?.data?.nextQuery as
    | SearchNextQuery
    | undefined
  return { items, nextQuery }
}

export function useSearchResultsInfiniteQuery({
  initialPageRequest,
  initialPage,
}: {
  initialPageRequest: SearchPageRequest
  initialPage: SearchInfinitePage
}) {
  return useInfiniteQuery({
    queryKey: [SEARCH_RESULTS_INFINITE_KEY, initialPageRequest.q],
    queryFn: async ({ pageParam }) => fetchSearchPage(pageParam),
    initialPageParam: initialPageRequest,
    initialData: {
      pages: [initialPage],
      pageParams: [initialPageRequest],
    } satisfies InfiniteData<SearchInfinitePage, SearchPageRequest>,
    getNextPageParam: (lastPage) => {
      const nq = lastPage.nextQuery
      if (nq?.q == null || nq.startIndex == null) {
        return undefined
      }
      return {
        q: nq.q,
        start: nq.startIndex,
        count: nq.count ?? SEARCH_API_DEFAULT_COUNT,
      }
    },
    staleTime: Infinity,
  })
}
