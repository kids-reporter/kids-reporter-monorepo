import { Metadata } from 'next'
import {
  API_URL,
  KIDS_URL_ORIGIN,
  Theme,
  GENERAL_DESCRIPTION,
  OG_SUFFIX,
} from '@/app/constants'
import { PublishedDate, SubTitle } from './styled'
import { Content } from './content'
import { Credits } from './credits'
import {
  getFormattedDate,
  getPostSummaries,
  sendGQLRequest,
  log,
  LogLevel,
} from '@/app/utils'
import { Leading } from './leading'
import { RelatedPosts } from './related-posts'
import { notFound } from 'next/navigation'

const query = `
  fragment ImageEntity on Photo {
    resized {
      small
      medium
      large
    }
  }
  query GetAProject($where: ProjectWhereUniqueInput!) {
    project(where: $where) {
      title
      titlePosition
      subtitle
      content
      credits
      publishedDate
      heroImage {
        ...ImageEntity
      }
      mobileHeroImage {
        ...ImageEntity
      }
      relatedPostsOrdered {
        title
        slug
        publishedDate
        heroImage {
          ...ImageEntity
        }
        ogDescription
        subSubcategoriesOrdered {
          name
          slug
          subcategory {
            name
            slug
            category {
              name
              slug
              themeColor
            }
          }
        }
      }
    }
  }
`

const metaGQL = `
query($where: ProjectWhereUniqueInput!) {
  project(where: $where) {
    publishedDate
    ogDescription
    ogTitle
    ogImage {
      resized {
        small
      }
    }
  }
}
`

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const slug = params.slug

  const topicOGRes = await sendGQLRequest(API_URL, {
    query: metaGQL,
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
      contentType: 'topic',
    },
  }
}

export default async function TopicPage({
  params,
}: {
  params: { slug: string }
}) {
  if (!params?.slug) {
    return notFound()
  }

  // TODO: maybe we could try apollo-client pkg
  const axiosRes = await sendGQLRequest(API_URL, {
    query,
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

  const relatedPosts = getPostSummaries(project?.relatedPostsOrdered)

  return (
    project && (
      <div>
        <Leading
          title={project.title}
          titlePosition={project.titlePosition}
          backgroundImage={project.heroImage}
          mobileBgImage={project.mobileHeroImage}
        />
        {project.subtitle ? <SubTitle>{project.subtitle}</SubTitle> : null}
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
