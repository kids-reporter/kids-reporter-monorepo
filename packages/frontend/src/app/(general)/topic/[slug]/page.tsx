import type {
  GetProjectMetaQuery,
  GetProjectQuery,
} from '__generated__/operations/content.generated'
import { HeaderPostTitleSetter } from '@kids-reporter/routing-ui'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import {
  ContentType,
  FALLBACK_IMG,
  GENERAL_DESCRIPTION,
  KIDS_URL_ORIGIN,
  OG_SUFFIX,
  Theme,
} from '@/constants'
import { getFormattedDate, getPostSummaries, log, LogLevel } from '@/utils'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

import { Content } from '../../_components/topic/content'
import { Credits } from '../../_components/topic/credits'
import { Leading } from '../../_components/topic/leading'
import { RelatedPosts } from '../../_components/topic/related-posts'
import { PublishedDate } from '../../_components/topic/styled'

const normalizePhoto = (photo: {
  resized?: { small?: string; medium?: string; large?: string }
}) => {
  return {
    resized: {
      small: photo.resized?.small ?? FALLBACK_IMG,
      medium: photo.resized?.medium ?? photo.resized?.small ?? FALLBACK_IMG,
      large:
        photo.resized?.large ??
        photo.resized?.medium ??
        photo.resized?.small ??
        FALLBACK_IMG,
    },
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const slug = params.slug

  const topicOGRes = await sendRestGqlRequest<GetProjectMetaQuery>({
    operation: 'project-meta',
    method: 'GET',
    variables: {
      where: {
        slug: slug,
      },
    },
  })
  const topicMeta = topicOGRes?.data?.data?.project
  if (!topicMeta) {
    log(LogLevel.WARNING, `Topic not found! ${params.slug}`)
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
    log(LogLevel.WARNING, 'Incorrect topic slug!')
    notFound()
  }

  // TODO: maybe we could try apollo-client pkg
  const axiosRes = await sendRestGqlRequest<GetProjectQuery>({
    operation: 'project-detail',
    method: 'GET',
    variables: {
      where: {
        slug: params.slug,
      },
    },
  })
  const project = axiosRes?.data?.data?.project
  if (!project) {
    log(LogLevel.WARNING, 'Empty topic!')
    notFound()
  }

  const relatedPosts = getPostSummaries(project?.relatedPostsOrdered ?? [])
  const heroImage = normalizePhoto(project?.heroImage ?? {})
  const mobileHeroImage = project?.mobileHeroImage
    ? normalizePhoto(project.mobileHeroImage)
    : undefined

  return (
    project && (
      <div>
        <HeaderPostTitleSetter postTitle={project.title} />
        <Leading
          title={project.title ?? ''}
          subtitle={project.subtitle ?? ''}
          titlePosition={project.titlePosition}
          backgroundImage={heroImage}
          mobileBgImage={mobileHeroImage}
        />
        {project.publishedDate ? (
          <PublishedDate>
            {getFormattedDate(project.publishedDate)} 最後更新
          </PublishedDate>
        ) : null}
        {project.content ? (
          <Content rawContentState={project.content} theme={Theme.BLUE} />
        ) : null}
        {project.credits ? (
          <Credits rawContentState={project.credits} theme={Theme.BLUE} />
        ) : null}
        <RelatedPosts posts={relatedPosts} />
      </div>
    )
  )
}
