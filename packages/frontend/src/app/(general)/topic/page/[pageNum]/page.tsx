import { emitStructured } from '@kids-reporter/logger'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { getCallBaodaozaiIntro } from '@/api/call-baodaozai-intro'
import { getTopicProjectsPaged } from '@/api/project'
import {
  FALLBACK_IMG,
  FIRST_PAGE_TOPIC_PER_PAGE,
  GENERAL_DESCRIPTION,
  OTHER_PAGE_TOPIC_PER_PAGE,
} from '@/constants'
import TopicAllModule from '@/modules/topic/all'
import { TopicSummary } from '@/modules/topic/types'
import { getPostSummaries } from '@/utils'
import { resolveCallBaodaozaiIntro } from '@/utils/call-baodaozai-intro'
import { getServerTraceHeaders } from '@/utils/trace-context'

export const metadata: Metadata = {
  title: '彙整: 專題 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

export default async function Topic({
  params: { pageNum },
}: {
  params: { pageNum: string }
}) {
  if (
    isNaN(Number(pageNum)) ||
    !Number.isInteger(Number(pageNum)) ||
    Number(pageNum) <= 0
  ) {
    emitStructured({
      severity: 'WARNING',
      message: `Incorrect page number! ${pageNum}`,
    })
    notFound()
  }

  const currentPage = Number(pageNum)

  const traceHeaders = getServerTraceHeaders(headers())

  const [projectsRes, topicsIntroRes] = await Promise.allSettled([
    // Fetch projects of specific page
    getTopicProjectsPaged(
      {
        orderBy: 'publishedDate:desc',
        take:
          currentPage === 1
            ? FIRST_PAGE_TOPIC_PER_PAGE
            : OTHER_PAGE_TOPIC_PER_PAGE,
        skip:
          currentPage === 1
            ? 0
            : FIRST_PAGE_TOPIC_PER_PAGE +
              (currentPage - 2) * OTHER_PAGE_TOPIC_PER_PAGE,
        includeRelatedPosts: true,
      },
      traceHeaders
    ),
    getCallBaodaozaiIntro({ page: 'topics' }, traceHeaders),
  ])
  if (projectsRes.status === 'rejected') {
    emitStructured({ severity: 'WARNING', message: 'Empty topic response!' })
    notFound()
  }

  const projects = projectsRes.value
  const topics = projects?.projects
  const topicsCount = projects?.projectsCount ?? 0
  const totalPages =
    topicsCount > 0
      ? 1 +
        Math.ceil(
          Math.max(0, topicsCount - FIRST_PAGE_TOPIC_PER_PAGE) /
            OTHER_PAGE_TOPIC_PER_PAGE
        )
      : 0
  if (currentPage > 1 && currentPage > totalPages) {
    emitStructured({
      severity: 'WARNING',
      message: `Request page(${currentPage}) exceeds total pages(${totalPages})!`,
    })
    notFound()
  }

  const topicSummaries: (TopicSummary | undefined)[] = Array.isArray(topics)
    ? topics.map((topic) => {
        return topic
          ? {
              image: topic.heroImage?.resized?.medium ?? FALLBACK_IMG,
              title: topic.title ?? '',
              url: `/topic/${topic.slug}`,
              desc: topic.ogDescription ?? '',
              publishedDate: topic.publishedDate ?? '',
              relatedPosts: topic.relatedPostsOrdered ?? [],
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

  const topicsIntro =
    topicsIntroRes.status === 'fulfilled'
      ? resolveCallBaodaozaiIntro(topicsIntroRes.value)
      : resolveCallBaodaozaiIntro()

  return (
    <TopicAllModule
      topicsIntro={topicsIntro}
      featuredTopic={featuredTopic}
      featuredTopicPosts={featuredTopicPosts ?? []}
      topicsForListing={
        topicsForListing?.filter((topic) => topic !== undefined) ?? []
      }
      totalPages={totalPages}
      currentPage={currentPage}
    />
  )
}
