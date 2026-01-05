import { HeaderPostTitleSetter } from '@kids-reporter/routing-ui'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPost, getPostMeta } from '@/api/post'
import {
  ContentType,
  GENERAL_DESCRIPTION,
  KIDS_URL_ORIGIN,
  OG_SUFFIX,
} from '@/constants'
import Article from '@/modules/article'
import TableOfContentSideMenu from '@/modules/article/components/table-of-content-side-menu'
import parseTocIndexesFromEntityMap from '@/modules/article/utils/parse-toc-indexes-from-entity-map'
import { log, LogLevel } from '@/utils'

const topicRelatedPostsNum = 5
const postEssayQuestionsTake = 3
const postChoiceQuestionsTake = 3

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const slug = params.slug

  const postMeta = await getPostMeta({
    where: {
      slug: slug,
    },
  })

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
      type: ContentType.ARTICLE,
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
      contentType: ContentType.ARTICLE,
    },
  }
}

export default async function PostPage({
  params,
}: {
  params: { slug: string }
}) {
  const slug = params.slug
  if (!slug) {
    log(LogLevel.WARNING, 'Invalid post slug!')
    notFound()
  }

  const post = await getPost({
    where: {
      slug: slug,
    },
    relatedPostsWhere: {
      slug: {
        notIn: [slug],
      },
    },
    orderBy: [{ order: 'asc' }],
    take: topicRelatedPostsNum,
    postEssayQuestionsTake,
    postChoiceQuestionsTake,
  })
  if (!post) {
    log(LogLevel.WARNING, `Post not found! ${slug}`)
    notFound()
  }

  const tocIndexes = parseTocIndexesFromEntityMap(post.content?.entityMap)

  return (
    <main className="mx-auto flex max-w-(--breakpoint-2xl) flex-col items-center">
      <HeaderPostTitleSetter postTitle={post?.title} />
      {tocIndexes.length > 0 && <TableOfContentSideMenu indexes={tocIndexes} />}
      {post && <Article post={post} slug={slug} />}
    </main>
  )
}
