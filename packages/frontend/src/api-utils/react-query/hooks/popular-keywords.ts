import { useQuery } from '@tanstack/react-query'

import { getPopularKeywords } from '@/api/popular-keywords'

const POPULAR_KEYWORDS_QUERY_KEY = 'popular-keywords'
export const usePopularKeywords = () => {
  return useQuery({
    queryKey: usePopularKeywords.getQueryKey(),
    queryFn: () => getPopularKeywords(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}

usePopularKeywords.getQueryKey = () => [POPULAR_KEYWORDS_QUERY_KEY]
