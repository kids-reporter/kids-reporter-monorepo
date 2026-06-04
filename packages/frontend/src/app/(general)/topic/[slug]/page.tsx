import { emitStructured } from '@kids-reporter/logger'
import type { RawDraftContentState } from 'draft-js'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import {
  getProjectDetailContentApi,
  getProjectMetaContentApi,
} from '@/api/content-api/project-by-slug'
import {
  ContentType,
  GENERAL_DESCRIPTION,
  KIDS_URL_ORIGIN,
  OG_SUFFIX,
} from '@/constants'
import TopicSlugModule from '@/modules/topic/slug'
import { TitlePosition } from '@/modules/topic/types'
import { normalizePhoto } from '@/modules/topic/utils'
import type { ProjectDetail, ProjectMeta } from '@/types/api'
import { getFormattedDate, getPostSummaries } from '@/utils'
import { getServerTraceHeaders } from '@/utils/trace-context'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const slug = params.slug
  const traceHeaders = getServerTraceHeaders(headers())

  const topicMeta: ProjectMeta | undefined = await getProjectMetaContentApi({
    slug,
    traceHeaders,
  })
  if (!topicMeta) {
    emitStructured({
      severity: 'WARNING',
      message: `Topic not found! ${params.slug}`,
    })
  }

  return {
    title: `${topicMeta?.ogTitle ? topicMeta.ogTitle + ' - ' : ''}${OG_SUFFIX}`,
    alternates: {
      canonical: `${KIDS_URL_ORIGIN}/topic/${slug}`,
    },
    openGraph: {
      title: topicMeta?.ogTitle ?? OG_SUFFIX,
      description: topicMeta?.ogDescription ?? GENERAL_DESCRIPTION,
      images: topicMeta?.ogImage?.resized?.small
        ? [topicMeta.ogImage.resized.small]
        : [],
    },
    other: {
      publishedDate: topicMeta?.publishedDate ?? '',
      contentType: ContentType.TOPIC,
    },
  }
}

export default async function TopicPage({
  params,
}: {
  params: { slug: string }
}) {
  if (!params?.slug) {
    emitStructured({ severity: 'WARNING', message: 'Incorrect topic slug!' })
    notFound()
  }
  const traceHeaders = getServerTraceHeaders(headers())
  const project: ProjectDetail | undefined = await getProjectDetailContentApi({
    slug: params.slug,
    traceHeaders,
  })
  if (!project) {
    emitStructured({ severity: 'WARNING', message: 'Empty topic!' })
    notFound()
  }

  const relatedPosts = getPostSummaries(project?.relatedPostsOrdered ?? [])
  const heroImage = normalizePhoto(project?.heroImage ?? {})
  const mobileHeroImage = project?.mobileHeroImage
    ? normalizePhoto(project.mobileHeroImage)
    : undefined

  return (
    <TopicSlugModule
      title={project.title ?? ''}
      subtitle={project.subtitle ?? ''}
      titlePosition={(project.titlePosition ?? 'center') as TitlePosition}
      backgroundImage={heroImage}
      mobileBgImage={mobileHeroImage}
      publishedDate={getFormattedDate(project.publishedDate ?? '')}
      content={project.content as RawDraftContentState | undefined}
      credits={project.credits as RawDraftContentState | undefined}
      relatedPosts={relatedPosts}
    />
  )
}
