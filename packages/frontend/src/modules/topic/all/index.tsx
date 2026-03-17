'use client'

import { cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'

import AllSiteBaodaozaiEventTrigger from '@/components/all-site-baodaozai-event-trigger'
import Pagination from '@/components/pagination'
import { PostSummary } from '@/components/types'
import { TOPIC_PAGE_ROUTE } from '@/constants'
import useAllSiteBaodaozaiIdleTimer from '@/hooks/use-site-baodaozai-idle-timer'
import { BaodaozaiVisibilitySetter } from '@/services/call-baodaozai'

import FeaturedTopicCard from '../components/featured-topic-card'
import TopicCard from '../components/topic-card'
import TopicPostSlider from '../components/topic-post-slider'
import { TopicSummary } from '../types'

type TopicAllModuleProps = {
  topicsIntroContent: string
  featuredTopic: TopicSummary | null
  featuredTopicPosts: PostSummary[]
  topicsForListing: TopicSummary[]
  totalPages: number
  currentPage: number
}

function TopicAllModule({
  topicsIntroContent,
  featuredTopic,
  featuredTopicPosts,
  topicsForListing,
  totalPages,
  currentPage,
}: TopicAllModuleProps) {
  const { isIdle: isAllSiteBaodaozaiIdle } = useAllSiteBaodaozaiIdleTimer()
  return (
    <main className="mx-auto flex flex-col items-center justify-center">
      <BaodaozaiVisibilitySetter show={true} />
      <AllSiteBaodaozaiEventTrigger
        id="show-intro"
        content={topicsIntroContent}
        isIdle={isAllSiteBaodaozaiIdle}
      />
      <div className="relative">
        <div className="absolute top-[150vh]">
          <AllSiteBaodaozaiEventTrigger
            id="hide-intro"
            isIdle={isAllSiteBaodaozaiIdle}
            content={topicsIntroContent}
          />
        </div>
      </div>
      <div className="w-screen bg-neutral-100 pb-14 tablet:pb-16 desktop:pb-24 hd:pb-30">
        <div className="mx-auto flex w-full flex-col items-center justify-center px-6 tablet:px-8 desktop:px-12 hd:max-w-300 hd:px-0">
          <div className="relative mb-5 flex w-full flex-col items-center justify-center tablet:flex-row tablet:justify-between hd:mb-10 hd:px-14">
            <div className="relative z-2 mt-6 flex items-center gap-4 self-start tablet:mt-16 desktop:mt-20 desktop:gap-5 hd:mt-24">
              <div className="h-10 w-1 rounded-[8px] bg-red-400 desktop:h-12 desktop:w-3" />
              <h1 className="prose-h1-small font-swei! text-neutral-900 desktop:prose-h1-large">
                專題
              </h1>
            </div>
            <Image
              alt="topic illustration"
              width={404}
              height={280}
              className="relative z-2 hidden h-[220px] w-[318px] tablet:mt-[10px] tablet:block tablet:h-[280px] tablet:w-[404px] desktop:mt-0 desktop:h-[360px] desktop:w-[520px]"
              src="/assets/images/topic/illustration.svg"
            />
            <Image
              alt="topic illustration"
              width={318}
              height={220}
              className="relative z-2 h-[220px] w-[318px] tablet:hidden"
              src="/assets/images/topic/illustration_s.svg"
            />

            <div className="absolute top-0 left-1/2 z-1 h-full w-screen -translate-x-1/2 bg-neutral-white"></div>

            <div className="absolute bottom-0 left-1/2 z-3 h-16 w-screen -translate-x-1/2 bg-[url(/assets/images/topic/wave_s.svg)] bg-[length:375px_64px] bg-center bg-repeat-x tablet:hidden" />
            <div className="absolute bottom-0 left-1/2 z-3 hidden h-[114px] w-screen -translate-x-1/2 bg-[url(/assets/images/topic/wave_m.svg)] bg-[length:768px_114px] bg-center bg-repeat-x tablet:block desktop:hidden" />
            <div className="absolute bottom-0 left-1/2 z-3 hidden h-[120px] w-screen -translate-x-1/2 bg-[url(/assets/images/topic/wave_l.svg)] bg-[length:1024px_120px] bg-center bg-repeat-x desktop:block hd:hidden" />
            <div className="absolute bottom-0 left-1/2 z-3 hidden h-[120px] w-screen -translate-x-1/2 bg-[url(/assets/images/topic/wave_xl.svg)] bg-[length:1440px_120px] bg-center bg-repeat-x hd:block" />
          </div>
          {featuredTopic && (
            <div className="w-full hd:px-4">
              <div
                className={cn(
                  'grid w-full grid-cols-1 rounded-[30px] bg-white tablet:gap-6 tablet:rounded-[56px] tablet:p-6 desktop:gap-x-8 desktop:gap-y-8 desktop:rounded-[56px] desktop:p-8 hd:gap-x-8 hd:gap-y-8 hd:p-10',
                  {
                    'desktop:grid-cols-10':
                      featuredTopicPosts && featuredTopicPosts.length > 0,
                    'desktop:grid-cols-1':
                      featuredTopicPosts && featuredTopicPosts.length === 0,
                  }
                )}
              >
                <div
                  className={cn('desktop:col-span-6', {
                    'desktop:col-span-1':
                      featuredTopicPosts && featuredTopicPosts.length === 0,
                  })}
                >
                  <FeaturedTopicCard
                    topic={featuredTopic}
                    articleCount={featuredTopicPosts?.length ?? 0}
                  />
                </div>
                {featuredTopicPosts && featuredTopicPosts.length > 0 && (
                  <div className="flex flex-col gap-5 p-5 tablet:p-0 desktop:col-span-4">
                    <TopicPostSlider posts={featuredTopicPosts} />
                  </div>
                )}
              </div>
            </div>
          )}

          {topicsForListing.length > 0 && (
            <div
              className={cn(
                'mt-10 mb-5 flex w-full flex-col items-center justify-center gap-6 tablet:mt-12 tablet:mb-8 tablet:grid tablet:grid-cols-4 tablet:gap-x-6 tablet:gap-y-8 desktop:mt-14 desktop:mb-10 desktop:gap-x-8 desktop:gap-y-10 hd:mt-20 hd:mb-12 hd:gap-y-14 hd:px-14',
                !featuredTopic && 'mt-0'
              )}
            >
              {topicsForListing.map((topic, index) => {
                const isLastOddTopic =
                  index === topicsForListing.length - 1 &&
                  topicsForListing.length % 2 !== 0
                return (
                  <div
                    key={topic.url}
                    className={cn(
                      'tablet:col-span-2',
                      isLastOddTopic ? 'tablet:col-start-2' : ''
                    )}
                  >
                    <TopicCard {...topic} />
                  </div>
                )
              })}
            </div>
          )}
          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              routingPrefix={TOPIC_PAGE_ROUTE}
            />
          )}
        </div>
      </div>
    </main>
  )
}

export default TopicAllModule
