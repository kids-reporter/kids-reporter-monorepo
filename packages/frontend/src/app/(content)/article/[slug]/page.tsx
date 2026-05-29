import { emitStructured } from '@kids-reporter/logger'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { getPost, getPostMeta } from '@/api/post'
import {
  ContentType,
  GENERAL_DESCRIPTION,
  KIDS_URL_ORIGIN,
  OG_SUFFIX,
} from '@/constants'
import ArticleModule from '@/modules/article'
import { getServerTraceHeaders } from '@/utils/trace-context'

const postRelatedPostsNum = 6
const postEssayQuestionsTake = 3
const postChoiceQuestionsTake = 3

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const slug = params.slug
  const traceHeaders = getServerTraceHeaders(headers())
  const postMeta = await getPostMeta(
    {
      where: {
        slug: slug,
      },
    },
    traceHeaders
  )

  if (!postMeta) {
    emitStructured({
      severity: 'WARNING',
      message: `Post meta not found! ${params.slug}`,
    })
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
    emitStructured({ severity: 'WARNING', message: 'Invalid post slug!' })
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
    take: postRelatedPostsNum,
    postEssayQuestionsTake,
    postChoiceQuestionsTake,
  })
  if (!post) {
    emitStructured({ severity: 'WARNING', message: `Post not found! ${slug}` })
    notFound()
  }

  return (
    <main className="mx-auto flex flex-col items-center">
      {post && <ArticleModule post={post} slug={slug} />}
    </main>
  )
}
