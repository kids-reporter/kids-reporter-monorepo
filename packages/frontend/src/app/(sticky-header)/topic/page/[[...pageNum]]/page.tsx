import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PostSlider from '@/app/components/post-slider'
import Pagination from '@/app/components/pagination'
import {
  API_URL,
  GENERAL_DESCRIPTION,
  POST_PER_PAGE,
  POST_CONTENT_GQL,
  TOPIC_PAGE_ROUTE,
  Theme,
} from '@/app/constants'
import {
  getFormattedDate,
  getPostSummaries,
  sendGQLRequest,
  log,
  LogLevel,
} from '@/app/utils'
import './page.scss'

export const metadata: Metadata = {
  title: '彙整: 專題 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

const genTopicsGQL = (hasRelatedPosts: boolean): string => {
  const relatedPostsGQL = `
    relatedPostsOrdered {
      ${POST_CONTENT_GQL}
    }
  `

  return `
  query ($orderBy: [ProjectOrderByInput!]!, $take: Int, $skip: Int!) {
    projects(orderBy: $orderBy, take: $take, skip: $skip) {
      title
      slug
      ogDescription
      heroImage {
        resized {
          medium
        }
      }
      publishedDate
      ${hasRelatedPosts ? relatedPostsGQL : ''}
    }
    projectsCount
  }
  `
}

type TopicSummary = {
  image: string
  title: string
  url: string
  desc: string
  publishedDate: string
  relatedPosts?: any[]
}

const TopicCard = (props: { topic: TopicSummary }) => {
  const moreComponent = (
    <div className={`rpjr-btn rpjr-btn-theme-outline theme-blue`}>
      看更多文章 <i className="icon-rpjr-icon-arrow-right"></i>
    </div>
  )

  const topic = props.topic
  return (
    <Link href={topic.url}>
      <div className="topic-container">
        <div className="hero-image-container">
          <img src={topic.image} />
        </div>
        <div className="icon-image">
          <img src={'/assets/images/topic_icon.svg'} />
          <span>專題</span>
        </div>
        <div className="topic-info">
          <div className="icon">
            <img src={'/assets/images/topic_icon.svg'} />
            <span>專題</span>
          </div>
          <p className="title">{topic.title}</p>
          <p className="desc">{topic.desc}</p>
          <div className="bottom">
            <p>{getFormattedDate(topic.publishedDate) ?? ''} 最後更新</p>
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

  // Fetch projects of specific page
  const projectsRes = await sendGQLRequest(API_URL, {
    query: genTopicsGQL(currentPage === 1),
    variables: {
      orderBy: [
        {
          publishedDate: 'desc',
        },
      ],
      take: POST_PER_PAGE,
      skip: (currentPage - 1) * POST_PER_PAGE,
    },
  })
  if (!projectsRes) {
    log(LogLevel.WARNING, 'Emptyp topic response!')
    notFound()
  }

  const topics = projectsRes?.data?.data?.projects
  const topicsCount = projectsRes?.data?.data?.projectsCount
  const totalPages = Math.ceil(topicsCount / POST_PER_PAGE)
  if (currentPage > totalPages) {
    log(
      LogLevel.WARNING,
      `Request page(${currentPage}) exceeds total pages(${totalPages}!`
    )
    notFound()
  }

  const topicSummaries: (TopicSummary | undefined)[] = Array.isArray(topics)
    ? topics.map((topic: any) => {
        return topic
          ? {
              image: topic.heroImage?.resized?.medium ?? '', // TODO: fallback image
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

  return (
    <main>
      <div className="content">
        <img className="topic-image" src={'/assets/images/topic_pic.svg'} />
        {featuredTopic && (
          <div className="topic-summary">
            <TopicCard topic={featuredTopic} />
            <div className="topic-slider">
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
          <div className="topic-list">
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
