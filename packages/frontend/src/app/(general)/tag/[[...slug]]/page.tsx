import type {
  GetTagMetaQuery,
  GetTagPostsQuery,
} from '__generated__/operations/content.generated'
import { emitStructured } from '@kids-reporter/logger'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import Pagination from '@/components/pagination'
import PostList from '@/components/post-list'
import {
  ContentType,
  GENERAL_DESCRIPTION,
  KIDS_URL_ORIGIN,
  OG_SUFFIX,
  POST_PER_PAGE,
} from '@/constants'
import { getPostSummaries } from '@/utils'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'
import { getServerTraceHeaders } from '@/utils/trace-context'

export async function generateMetadata({
  params,
}: {
  params: { slug: any }
}): Promise<Metadata> {
  const slug = params.slug?.[0]

  const tagOGRes = await sendRestGqlRequest<GetTagMetaQuery>({
    operation: 'tag-meta',
    method: 'GET',
    variables: {
      where: {
        slug: slug,
      },
    },
  })
  const tagMeta = tagOGRes?.data?.data?.tag
  if (!tagMeta) {
    emitStructured({
      severity: 'WARNING',
      message: `Tag meta not found! ${slug}`,
    })
  }

  return {
    title: `${tagMeta?.ogTitle ? tagMeta.ogTitle + ' - ' : ''}${OG_SUFFIX}`,
    alternates: {
      canonical: `${KIDS_URL_ORIGIN}/tag/${slug}`,
    },
    openGraph: {
      title: tagMeta?.ogTitle ?? OG_SUFFIX,
      description: tagMeta?.ogDescription ?? GENERAL_DESCRIPTION,
      images: tagMeta?.ogImage?.resized?.small
        ? [tagMeta.ogImage.resized.small]
        : [],
    },
    other: {
      // Since we can't inject <!-- <PageMap>...</PageMap> --> to <head> section with Next metadata API,
      // so handle google seo with extra <meta> tag here, but be awared there are limitations(maximum 50 tags):
      // https://developers.google.com/custom-search/docs/structured_data?hl=zh-tw#limitations
      contentType: ContentType.TAG,
    },
  }
}

// Tag's routing path: /tag/[slug]/[page num], ex: /tag/life/1
export default async function Tag({ params }: { params: { slug: any } }) {
  const slug = params.slug?.[0]
  const currentPage = !params.slug?.[1] ? 1 : Number(params.slug[1])
  const traceHeaders = getServerTraceHeaders(headers())
  if (params.slug?.length > 2 || !slug || !(currentPage > 0)) {
    emitStructured({ severity: 'WARNING', message: 'Incorrect tag routing!' })
    notFound()
  }

  const response = await sendRestGqlRequest<GetTagPostsQuery>({
    operation: 'tag-posts',
    method: 'GET',
    variables: {
      where: {
        slug: slug,
      },
      orderBy: [
        {
          publishedDate: 'desc',
        },
      ],
      take: POST_PER_PAGE,
      skip: (currentPage - 1) * POST_PER_PAGE,
    },
    traceHeaders,
  })

  const tag = response?.data?.data?.tag
  if (!tag) {
    emitStructured({ severity: 'WARNING', message: 'Tag not found!' })
    notFound()
  }
  const posts = tag.posts ?? []
  const postsCount = tag.postsCount ?? 0

  const totalPages = Math.ceil(postsCount / POST_PER_PAGE)
  if (currentPage > 1 && currentPage > totalPages) {
    emitStructured({
      severity: 'WARNING',
      message: `Request page(${currentPage}) exceeds total pages(${totalPages})!`,
    })
    notFound()
  }

  const postSummeries = getPostSummaries(posts)

  return (
    <main
      style={{ width: '95vw' }}
      className="mx-auto mb-10 flex flex-col items-center justify-center gap-10 px-9 pt-10"
    >
      <div className="flex w-full flex-col items-center justify-center bg-white">
        <h1
          style={{ lineHeight: '160%' }}
          className="text-center text-3xl font-bold tracking-wider text-gray-900"
        >
          #{tag.name}
        </h1>
      </div>
      <PostList posts={postSummeries} />
      {totalPages && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          routingPrefix={`/tag/${slug}`}
        />
      )}
    </main>
  )
}
