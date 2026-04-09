'use client'

import { usePostsPagedInfiniteQuery } from '@/api-utils/react-query/hooks/posts-paged'
import AllSiteBaodaozaiEventTrigger from '@/components/all-site-baodaozai-event-trigger'
import CommonCollection from '@/components/common-collection'
import { PostSummary } from '@/components/types'
import { POST_PER_PAGE } from '@/constants'
import useAllSiteBaodaozaiIdleTimer from '@/hooks/use-site-baodaozai-idle-timer'
import { BaodaozaiVisibilitySetter } from '@/services/call-baodaozai'

type AllModuleProps = {
  introContent: string
  posts: PostSummary[]
}

function AllModule({ introContent, posts }: AllModuleProps) {
  const { isIdle: isAllSiteBaodaozaiIdle } = useAllSiteBaodaozaiIdleTimer()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostsPagedInfiniteQuery({
      orderBy: [{ publishedDate: 'desc' }],
      take: POST_PER_PAGE,
      initialPosts: posts,
    })

  const allPosts = data?.pages.flat() ?? posts
  return (
    <main>
      <BaodaozaiVisibilitySetter show={true} />
      <AllSiteBaodaozaiEventTrigger
        id="show-intro"
        content={introContent}
        isIdle={isAllSiteBaodaozaiIdle}
      />
      <div className="relative">
        <div className="absolute top-[150vh]">
          <AllSiteBaodaozaiEventTrigger
            id="hide-intro"
            isIdle={isAllSiteBaodaozaiIdle}
            content={introContent}
          />
        </div>
      </div>
      <CommonCollection
        hero={{
          type: 'illustrated',
          title: '最新文章',
          illustration: '/assets/images/all/illustration.svg',
          illustrationSmall: '/assets/images/all/illustration_s.svg',
        }}
        morePostsMode="loadingMore"
        posts={allPosts}
        onLoadMore={() => fetchNextPage()}
        isLoading={isFetchingNextPage}
        hasMore={hasNextPage}
      />
    </main>
  )
}

export default AllModule
