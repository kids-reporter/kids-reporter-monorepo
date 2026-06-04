import { InfiniteData, useInfiniteQuery } from '@tanstack/react-query'

import { getPostsPaged } from '@/api/post'
import { PostSummary } from '@/components/types'
import type { PostOrderBy } from '@/types/api'
import { getPostSummaries } from '@/utils'

const POSTS_PAGED_INFINITY_QUERY_KEY = 'posts-paged-infinity'

export function usePostsPagedInfiniteQuery({
  orderBy = 'publishedDate:desc',
  take,
  initialPosts,
}: {
  orderBy?: PostOrderBy
  take: number
  initialPosts?: PostSummary[]
}) {
  return useInfiniteQuery({
    queryKey: usePostsPagedInfiniteQuery.getQueryKey({ orderBy, take }),
    queryFn: async ({ pageParam }) => {
      const posts = await getPostsPaged({
        orderBy,
        take,
        skip: pageParam,
      })
      return getPostSummaries(posts ?? [])
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const hasNextPage = lastPage.length === take
      return hasNextPage ? lastPageParam + take : undefined
    },
    ...(initialPosts
      ? ({
          initialData: {
            pages: [initialPosts],
            pageParams: [0],
          } satisfies InfiniteData<PostSummary[], number>,
        } as const)
      : null),
  })
}

usePostsPagedInfiniteQuery.getQueryKey = ({
  orderBy,
  take,
}: {
  orderBy?: PostOrderBy
  take: number
}) => [POSTS_PAGED_INFINITY_QUERY_KEY, orderBy, take]
