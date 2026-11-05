import { useQuery } from '@tanstack/react-query'

import { getHotTopics } from '@/api/hot-topics'

const HOT_TOPICS_QUERY_KEY = 'hot-topics'

export function useHotTopics() {
  return useQuery({
    queryKey: useHotTopics.getQueryKey(),
    queryFn: () => getHotTopics(),
    staleTime: 60_000,
  })
}

useHotTopics.getQueryKey = () => [HOT_TOPICS_QUERY_KEY] as const
