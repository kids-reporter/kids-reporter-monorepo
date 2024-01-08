import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Article from './article'
import {
  API_URL,
  KIDS_URL_ORIGIN,
  GENERAL_DESCRIPTION,
  POST_CONTENT_GQL,
  OG_SUFFIX,
} from '@/app/constants'
import { sendGQLRequest, log, LogLevel } from '@/app/utils'
import './page.scss'

const topicRelatedPostsNum = 5

const heroImageGQL = `
  heroImage {
    resized {
      small
      medium
      large
    }
  }
`

const categoryGQL = `
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
`

const postGQL = `
  query($where: PostWhereUniqueInput!, $orderBy: [NewsReadingGroupItemOrderByInput!]!, $take: Int) {
    post(where: $where) {
      title
      newsReadingGroup {
        items (orderBy: $orderBy){
          name
          embedCode
        }
      }
      brief
      content
      publishedDate
      ${heroImageGQL}
      heroCaption
      authors {
        avatar {
          resized {
            tiny
          }
        }
        bio
        id
        name
        slug
      }
      authorsJSON
      tagsOrdered {
        name
        slug
      }
      relatedPostsOrdered {
        title
        slug
        publishedDate
        ${heroImageGQL}
        ogDescription
        ${categoryGQL}
      }
      subtitle
      ${categoryGQL}
      mainProject {
        title
        slug
      }
      projects {
        title
        slug
        relatedPosts(take: $take) {
          ${POST_CONTENT_GQL}
        }
      }
    }
  }
`

const metaGQL = `
query($where: PostWhereUniqueInput!) {
  post(where: $where) {
    publishedDate
    ogDescription
    ogTitle
    ogImage {
      resized {
        small
      }
    }
    ${categoryGQL}
  }
}
`

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const slug = params.slug

  const postMetaRes = await sendGQLRequest(API_URL, {
    query: metaGQL,
    variables: {
      where: {
        slug: slug,
      },
    },
  })
  const postMeta = postMetaRes?.data?.data?.post
  if (!postMeta) {
    log(LogLevel.WARNING, `Post meta not found! ${params.slug}`)
  }

  return {
    title: `${postMeta?.ogTitle ? postMeta.ogTitle + ' - ' : ''}${OG_SUFFIX}`,
    alternates: {
      canonical: `${KIDS_URL_ORIGIN}/article/${slug}`,
    },
    openGraph: {
      title: postMeta?.ogTitle ?? OG_SUFFIX,
      description: postMeta?.ogDescription ?? GENERAL_DESCRIPTION,
      images: postMeta?.ogImage?.resized?.small
        ? [postMeta.ogImage.resized.small]
        : [],
      type: 'article',
    },
    other: {
      // Since we can't inject <!-- <PageMap>...</PageMap> --> to <head> section with Next metadata API,
      // so handle google seo with extra <meta> tag here, but be awared there are limitations(maximum 50 tags):
      // https://developers.google.com/custom-search/docs/structured_data?hl=zh-tw#limitations
      publishedDate: postMeta?.publishedDate ?? '',
      category:
        postMeta?.subSubcategoriesOrdered?.[0]?.subcategory?.category?.name ??
        '',
      subcategory:
        postMeta?.subSubcategoriesOrdered?.[0]?.subcategory?.name ?? '',
      subSubcategory: postMeta?.subSubcategoriesOrdered?.[0]?.name ?? '',
      contentType: 'article',
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  if (!params.slug) {
    log(LogLevel.WARNING, 'Invalid post slug!')
    notFound()
  }

  const postRes = await sendGQLRequest(API_URL, {
    query: postGQL,
    variables: {
      where: {
        slug: params.slug,
      },
      orderBy: [{ order: 'asc' }],
      take: topicRelatedPostsNum,
    },
  })
  const post = postRes?.data?.data?.post
  if (!post) {
    log(LogLevel.WARNING, `Post not found! ${params.slug}`)
    notFound()
  }

  return <main>{post && <Article post={post} />}</main>
}
