import type {
  GetAuthorMetaQuery,
  GetAuthorPostsQuery,
} from '__generated__/operations/content.generated'
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import Pagination from '@/components/pagination'
import PostList from '@/components/post-list'
import {
  ContentType,
  DEFAULT_AVATAR,
  GENERAL_DESCRIPTION,
  KIDS_URL_ORIGIN,
  POST_PER_PAGE,
} from '@/constants'
import { getPostSummaries, log, LogLevel } from '@/utils'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export async function generateMetadata({
  params,
}: {
  params: { slug: any }
}): Promise<Metadata> {
  const slug = params.slug?.[0]

  const authorMetaRes = await sendRestGqlRequest<GetAuthorMetaQuery>({
    operation: 'author-meta',
    method: 'GET',
    variables: {
      where: {
        slug: slug,
      },
    },
  })
  const authorMeta = authorMetaRes?.data?.data?.author
  if (!authorMeta) {
    log(LogLevel.WARNING, `Author meta not found! ${slug}`)
    return {}
  }

  return {
    title: authorMeta.name,
    alternates: {
      canonical: `${KIDS_URL_ORIGIN}/author/${slug}`,
    },
    openGraph: {
      title: authorMeta.name,
      description: authorMeta.bio ?? GENERAL_DESCRIPTION,
      images: authorMeta.image?.resized?.small
        ? [authorMeta.image.resized.small]
        : [],
    },
    other: {
      // Since we can't inject <!-- <PageMap>...</PageMap> --> to <head> section with Next metadata API,
      // so handle google seo with extra <meta> tag here, but be awared there are limitations(maximum 50 tags):
      // https://developers.google.com/custom-search/docs/structured_data?hl=zh-tw#limitations
      contentType: ContentType.AUTHOR,
    },
  }
}

// Author's routing path: /author/[slug]/[page num], ex: /author/yunruchen/1
export default async function Author({ params }: { params: { slug: any } }) {
  const slug = params.slug?.[0]
  const currentPage = !params.slug?.[1] ? 1 : Number(params.slug[1])

  if (params.slug?.length > 2 || !slug || !(currentPage > 0)) {
    log(LogLevel.WARNING, 'Incorrect author routing!')
    notFound()
  }

  const response = await sendRestGqlRequest<GetAuthorPostsQuery>({
    operation: 'author-posts',
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
  })
  const author = response?.data?.data?.author
  if (!author) {
    log(LogLevel.WARNING, 'Author not found!')
    notFound()
  }
  const posts = author.posts ?? []
  const postsCount = author.postsCount ?? 0

  const avatarURL = author.avatar?.resized?.tiny ?? DEFAULT_AVATAR

  const totalPages = Math.ceil(postsCount / POST_PER_PAGE)
  if (currentPage > 1 && currentPage > totalPages) {
    log(
      LogLevel.WARNING,
      `Request page(${currentPage}) exceeds total pages(${totalPages})!`
    )
    notFound()
  }

  const postSummeries = getPostSummaries(posts)

  return (
    <main
      style={{ width: '95vw' }}
      className="mb-10 flex flex-col items-center justify-center gap-10"
    >
      <div className="flex max-w-2xl flex-col items-center justify-center gap-1.5 bg-white px-9 pt-10">
        <div className="mx-auto mb-1.5 max-h-44 max-w-44 overflow-hidden rounded-full object-cover">
          <img
            className="max-h-44 w-full max-w-44 object-cover"
            src={avatarURL}
            alt={author.name}
            loading="lazy"
          />
        </div>
        <h1
          style={{ lineHeight: '160%', letterSpacing: '.08em' }}
          className="mt-3 mb-9 text-center text-xl font-bold text-gray-900"
        >
          {author.name}
        </h1>
        {author.email && (
          <Link
            style={{
              lineHeight: '160%',
              letterSpacing: '.05em',
              color: 'var(--paletteColor1)',
            }}
            className="mb-2 text-center text-base font-medium not-italic"
            href={`mailto:${author.email}`}
          >
            {author.email}
          </Link>
        )}
        <p
          style={{ lineHeight: '200%', letterSpacing: '.05em' }}
          className="text-center text-lg font-normal whitespace-pre-wrap text-gray-900 not-italic"
        >
          {author.bio}
        </p>
      </div>
      <PostList posts={postSummeries} />
      {totalPages && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          routingPrefix={`/author/${slug}`}
        />
      )}
    </main>
  )
}
