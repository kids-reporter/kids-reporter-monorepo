import type { GetProjectsQuery } from '__generated__/operations/content.generated'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getCallBaodaozaiIntroContent } from '@/api/call-baodaozai-intro'
import Pagination from '@/components/pagination'
import PostSlider from '@/components/post-slider'
import {
  FALLBACK_IMG,
  GENERAL_DESCRIPTION,
  POST_PER_PAGE,
  Theme,
  TOPIC_PAGE_ROUTE,
} from '@/constants'
import { BaodaozaiVisibilitySetter } from '@/services/call-baodaozai'
import { getFormattedDate, getPostSummaries, log, LogLevel } from '@/utils'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

import TopicModule from './_components/module'
import styles from './page.module.css'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback'),
  { ssr: false }
)

export const metadata: Metadata = {
  title: '彙整: 專題 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

type TopicSummary = {
  image: string
  title: string
  url: string
  desc: string
  publishedDate: string
  relatedPosts?: any[]
}

const topicIcon = '/assets/images/topic_icon.svg'

const TopicCard = (props: { topic: TopicSummary }) => {
  const moreComponent = (
    <div className={`rpjr-btn rpjr-btn-theme-outline theme-blue`}>
      看更多文章 <i className="icon-rpjr-icon-arrow-right"></i>
    </div>
  )

  const topic = props.topic
  return (
    <Link href={topic.url}>
      <div className="relative flex flex-col items-stretch lg:flex-row">
        <div className={styles['hero-image-container']}>
          <ImageWithFallback
            className="h-full w-full object-cover align-middle"
            src={topic.image ?? FALLBACK_IMG}
            loading="lazy"
          />
        </div>
        <div
          style={{ width: 'fit-content', height: 'fit-content', zIndex: '2' }}
          className="absolute top-5 left-5 flex flex-row items-center gap-1 rounded-3xl bg-white px-4 py-1 lg:hidden"
        >
          <img className="w-10" src={topicIcon} loading="lazy" />
          <span
            style={{ lineHeight: '160%', letterSpacing: '0.08em' }}
            className="text-xl font-bold"
          >
            專題
          </span>
        </div>
        <div
          className={`${styles['topic-info']} flex flex-col items-start justify-between border-solid border-gray-300 bg-white`}
        >
          <div className="hidden w-full flex-row items-center gap-1 lg:flex">
            <img className="max-w-10" src={topicIcon} loading="lazy" />
            <span
              style={{ lineHeight: '160%', letterSpacing: '0.08em' }}
              className="text-xl font-bold"
            >
              專題
            </span>
          </div>
          <p
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: '2',
              lineHeight: '160%',
              letterSpacing: '0.08em',
            }}
            className="mb-4 overflow-hidden text-2xl font-bold"
          >
            {topic.title}
          </p>
          <p
            style={{
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: '5',
              lineHeight: '160%',
              letterSpacing: '0.08em',
            }}
            className="mb-4 overflow-hidden text-base font-normal"
          >
            {topic.desc}
          </p>
          <div className="flex w-full flex-row items-end justify-between">
            <p className="text-base font-medium tracking-wider text-gray-500">
              {getFormattedDate(topic.publishedDate) ?? ''} 最後更新
            </p>
            {moreComponent}
          </div>
        </div>
      </div>
    </Link>
  )
}

// Topic's routing path: /topic/page/[page num], ex: /topic/page/1
export default async function Topic({
  params,
}: {
  params: { pageNum: string }
}) {
  if (params.pageNum?.length > 1) {
    log(LogLevel.WARNING, `Incorrect routing path! ${params.pageNum}`)
    notFound()
  }

  const currentPage = !params.pageNum ? 1 : Number(params.pageNum)
  if (!(currentPage > 0)) {
    log(LogLevel.WARNING, `Incorrect page! ${currentPage}`)
    notFound()
  }

  const [projectsRes, topicsIntroContentRes] = await Promise.allSettled([
    // Fetch projects of specific page
    sendRestGqlRequest<GetProjectsQuery>({
      operation: 'projects-paged',
      method: 'GET',
      variables: {
        orderBy: [
          {
            publishedDate: 'desc',
          },
        ],
        take: POST_PER_PAGE,
        skip: (currentPage - 1) * POST_PER_PAGE,
        includeRelatedPosts: currentPage === 1,
      },
    }),
    getCallBaodaozaiIntroContent({ where: { page: 'topics' } }),
  ])
  if (projectsRes.status === 'rejected') {
    log(LogLevel.WARNING, 'Empty topic response!')
    notFound()
  }

  const projects = projectsRes.value
  const topics = projects?.data?.data?.projects
  const topicsCount = projects?.data?.data?.projectsCount ?? 0
  const totalPages = Math.ceil(topicsCount / POST_PER_PAGE)
  if (currentPage > 1 && currentPage > totalPages) {
    log(
      LogLevel.WARNING,
      `Request page(${currentPage}) exceeds total pages(${totalPages})!`
    )
    notFound()
  }

  const topicSummaries: (TopicSummary | undefined)[] = Array.isArray(topics)
    ? topics.map((topic: any) => {
        return topic
          ? {
              image: topic.heroImage?.resized?.medium ?? FALLBACK_IMG,
              title: topic.title,
              url: `/topic/${topic.slug}`,
              desc: topic.ogDescription,
              publishedDate: topic.publishedDate,
              relatedPosts: topic.relatedPostsOrdered,
            }
          : undefined
      })
    : []

  const featuredTopic =
    currentPage === 1 && topicSummaries?.[0] ? topicSummaries[0] : null
  const featuredTopicPosts =
    featuredTopic?.relatedPosts &&
    getPostSummaries(featuredTopic.relatedPosts.filter((post) => post))

  // If has featuredTopic, list topics like [featuredTopic(topicSummaries[0])], topicSummaries[1], topicSummaries[2]...
  const topicsForListing = featuredTopic
    ? topicSummaries.slice(1)
    : topicSummaries

  const topicsIntroContent =
    topicsIntroContentRes.status === 'fulfilled'
      ? topicsIntroContentRes.value
      : ''

  return (
    <main
      className={`${styles.main} mb-10 flex flex-col items-center justify-center`}
    >
      <BaodaozaiVisibilitySetter show={true} />
      <TopicModule introContent={topicsIntroContent ?? ''} />
      <div className="flex w-full max-w-7xl flex-col items-center justify-center gap-10">
        <img
          className="w-full max-w-xl"
          src={'/assets/images/topic_pic.svg'}
          loading="lazy"
        />
        {featuredTopic && (
          <div className="flex w-full flex-col justify-center gap-5 rounded-3xl bg-white p-0 lg:bg-gray-100 lg:p-5">
            <TopicCard topic={featuredTopic} />
            <div className="hidden lg:block">
              {featuredTopicPosts && featuredTopicPosts.length > 0 && (
                <PostSlider
                  posts={featuredTopicPosts}
                  sliderTheme={Theme.BLUE}
                  isSimple={true}
                  enablePagination={false}
                />
              )}
            </div>
          </div>
        )}
        {topicsForListing.length > 0 && (
          <div className="flex w-full flex-col items-center justify-center gap-10">
            {topicsForListing.map((topic, index) => {
              return (
                topic && <TopicCard key={`topic-card-${index}`} topic={topic} />
              )
            })}
          </div>
        )}
        {totalPages && totalPages > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            routingPrefix={TOPIC_PAGE_ROUTE}
          />
        )}
      </div>
    </main>
  )
}
