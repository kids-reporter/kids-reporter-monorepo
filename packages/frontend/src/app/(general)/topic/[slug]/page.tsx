import type {
  GetProjectMetaQuery,
  GetProjectQuery,
} from '__generated__/operations/content.generated'
import { emitStructured } from '@kids-reporter/logger'
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
import envVars from '@/environment-variables'
import TopicSlugModule from '@/modules/topic/slug'
import { TitlePosition } from '@/modules/topic/types'
import { normalizePhoto } from '@/modules/topic/utils'
import { getFormattedDate, getPostSummaries } from '@/utils'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'
import { getServerTraceHeaders } from '@/utils/trace-context'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const slug = params.slug
  const traceHeaders = getServerTraceHeaders(headers())

  let topicMeta: GetProjectMetaQuery['project'] | undefined
  if (envVars.useContentApi) {
    try {
      topicMeta = await getProjectMetaContentApi({ slug, traceHeaders })
    } catch (err) {
      logContentApiFallback('topic-project-meta', err)
    }
  }
  if (!topicMeta) {
    const topicOGRes = await sendRestGqlRequest<GetProjectMetaQuery>({
      operation: 'project-meta',
      method: 'GET',
      variables: {
        where: {
          slug: slug,
        },
      },
      traceHeaders,
    })
    topicMeta = topicOGRes?.data?.data?.project
  }
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
      // Since we can't inject <!-- <PageMap>...</PageMap> --> to <head> section with Next metadata API,
      // so handle google seo with extra <meta> tag here, but be awared there are limitations(maximum 50 tags):
      // https://developers.google.com/custom-search/docs/structured_data?hl=zh-tw#limitations
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
  let project: GetProjectQuery['project'] | undefined
  const traceHeaders = getServerTraceHeaders(headers())
  if (envVars.useContentApi) {
    try {
      project = await getProjectDetailContentApi({
        slug: params.slug,
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('topic-project-detail', err)
    }
  }
  if (!project) {
    const axiosRes = await sendRestGqlRequest<GetProjectQuery>({
      operation: 'project-detail',
      method: 'GET',
      variables: {
        where: {
          slug: params.slug,
        },
      },
      traceHeaders,
    })
    project = axiosRes?.data?.data?.project
  }
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
      content={project.content}
      credits={project.credits}
      relatedPosts={relatedPosts}
    />
  )
}
