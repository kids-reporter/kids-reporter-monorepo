import { emitStructured } from '@kids-reporter/logger'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { getAuthorMetaBySlug, getAuthorPostsBySlugPaged } from '@/api/author'
import {
  ContentType,
  DEFAULT_AVATAR,
  GENERAL_DESCRIPTION,
  KIDS_URL_ORIGIN,
  POST_PER_PAGE,
} from '@/constants'
import AuthorCollectionModule from '@/modules/author/collection'
import { getPostSummaries } from '@/utils'
import { getSanitizedCurrentPage } from '@/utils/get-sanitized-current-page'
import { getServerTraceHeaders } from '@/utils/trace-context'

export async function generateMetadata({
  params,
}: {
  params: { slug: any }
}): Promise<Metadata> {
  const slug = params.slug?.[0]

  const authorMeta = slug ? await getAuthorMetaBySlug({ slug }) : null
  if (!authorMeta) {
    emitStructured({
      severity: 'WARNING',
      message: `Author meta not found! ${slug}`,
    })
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
  const currentPage = getSanitizedCurrentPage(params.slug?.[1])
  const traceHeaders = getServerTraceHeaders(headers())
  if (params.slug?.length > 2 || !slug || currentPage == null) {
    emitStructured({
      severity: 'WARNING',
      message: 'Incorrect author routing!',
    })
    notFound()
  }

  const author = await getAuthorPostsBySlugPaged(
    {
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
    traceHeaders
  )
  if (!author) {
    emitStructured({ severity: 'WARNING', message: 'Author not found!' })
    notFound()
  }
  const posts = author.posts ?? []
  const postsCount = author.postsCount ?? 0

  const avatarURL = author.avatar?.resized?.tiny ?? DEFAULT_AVATAR

  const totalPages = Math.ceil(postsCount / POST_PER_PAGE)
  if (currentPage > 1 && currentPage > totalPages) {
    emitStructured({
      severity: 'WARNING',
      message: `Request page(${currentPage}) exceeds total pages(${totalPages})!`,
    })
    notFound()
  }

  const postSummaries = getPostSummaries(posts)

  return (
    <AuthorCollectionModule
      author={{
        name: author.name ?? '',
        bio: author.bio,
        email: author.email,
        avatarURL,
      }}
      posts={postSummaries}
      totalPages={totalPages}
      currentPage={currentPage}
      routingPrefix={`/author/${slug}`}
    />
  )
}
