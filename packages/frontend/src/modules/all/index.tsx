'use client'

import { usePostsPagedInfiniteQuery } from '@/api-utils/react-query/hooks/posts-paged'
import AllSiteBaodaozaiEventTrigger from '@/components/all-site-baodaozai-event-trigger'
import CommonCollection from '@/components/common-collection'
import { PostSummary } from '@/components/types'
import { POST_PER_PAGE } from '@/constants'
import useAllSiteBaodaozaiIdleTimer from '@/hooks/use-site-baodaozai-idle-timer'
import {
  BaodaozaiInitializer,
  BaodaozaiVisibilitySetter,
} from '@/services/call-baodaozai'
import type { CallBaodaozaiIntro } from '@/types/api'

type AllModuleProps = {
  intro: Pick<
    CallBaodaozaiIntro,
    'content' | 'buttonStatus' | 'buttonText' | 'buttonUrl'
  >
  posts: PostSummary[]
}

function AllModule({ intro, posts }: AllModuleProps) {
  const { isIdle: isAllSiteBaodaozaiIdle } = useAllSiteBaodaozaiIdleTimer()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    usePostsPagedInfiniteQuery({
      orderBy: 'publishedDate:desc',
      take: POST_PER_PAGE,
      initialPosts: posts,
    })

  const allPosts = data?.pages.flat() ?? posts
  return (
    <main>
      <BaodaozaiVisibilitySetter show={true} />
      <BaodaozaiInitializer intro={intro} />
      <AllSiteBaodaozaiEventTrigger
        id="show-intro"
        intro={intro}
        isIdle={isAllSiteBaodaozaiIdle}
      />
      <div className="relative">
        <div className="absolute top-[150vh]">
          <AllSiteBaodaozaiEventTrigger
            id="hide-intro"
            isIdle={isAllSiteBaodaozaiIdle}
            intro={intro}
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
