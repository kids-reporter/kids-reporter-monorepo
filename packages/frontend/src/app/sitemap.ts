/*
NOTE:
There is a bug of sitemap regeneration in Next.js below v13.5.4
https://github.com/vercel/next.js/issues/54057

BUT there is also a bug of non-conditional request above v13.5.4
(cdn caches 304 response & make blank pages)
https://github.com/vercel/next.js/issues/56018

Therefore, so far we can't upgrade to v13.5.4 due to #56018 & #54057 remains.
*/

import type {
  GetPostsForSitemapQuery,
  GetProjectsForSitemapQuery,
} from '__generated__/operations/content.generated'
import { MetadataRoute } from 'next'
import { headers } from 'next/headers'

import {
  getSitemapPostsContentApi,
  getSitemapProjectsContentApi,
} from '@/api/content-api/sitemaps'
import { KIDS_URL_ORIGIN } from '@/constants'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'
import {
  buildSitemapPostsWhereInput,
  buildSitemapProjectsWhereInput,
} from '@/utils/sitemap-graphql-where'
import { getServerTraceHeaders } from '@/utils/trace-context'

type SitemapPostRow = NonNullable<
  NonNullable<GetPostsForSitemapQuery['posts']>[number]
>
type SitemapProjectRow = NonNullable<
  NonNullable<GetProjectsForSitemapQuery['projects']>[number]
>

export const revalidate = envVars.isProduction ? 86400 : 0 // 1 day

const fetchSitemaps = async (): Promise<
  { url: string; lastModified: Date }[]
> => {
  const traceHeaders = getServerTraceHeaders(headers())
  let sitemaps: { url: string; lastModified: Date }[] = []
  const now = new Date()
  const sixtyDaysBefore = new Date(
    new Date().setHours(0, 0, 0, 0) - 60 * 24 * 60 * 60 * 1000
  )

  let posts: { url: string; lastModified: Date }[] | undefined
  if (envVars.useContentApi) {
    try {
      const rows = await getSitemapPostsContentApi({
        sinceDays: 60,
        traceHeaders,
      })
      posts = rows.map((post) => ({
        url: `${KIDS_URL_ORIGIN}/article/${post.slug}`,
        lastModified: post.publishedDate
          ? new Date(post.publishedDate)
          : new Date(),
      }))
    } catch (err) {
      logContentApiFallback('sitemap-posts', err)
    }
  }
  if (!posts) {
    const postsRes = await sendRestGqlRequest<GetPostsForSitemapQuery>({
      operation: 'posts-sitemap',
      method: 'GET',
      variables: {
        where: buildSitemapPostsWhereInput({
          publishedDateGte: sixtyDaysBefore,
          now,
        }),
      },
      traceHeaders,
    })
    posts = postsRes?.data?.data?.posts?.map((post: SitemapPostRow) => {
      return {
        url: `${KIDS_URL_ORIGIN}/article/${post.slug}`,
        lastModified: post.publishedDate
          ? new Date(post.publishedDate)
          : new Date(),
      }
    })
  }
  if (posts) {
    sitemaps = [...posts]
  }

  let topics: { url: string; lastModified: Date }[] | undefined
  if (envVars.useContentApi) {
    try {
      const rows = await getSitemapProjectsContentApi({
        sinceDays: 60,
        traceHeaders,
      })
      topics = rows.map((topic) => ({
        url: `${KIDS_URL_ORIGIN}/topic/${topic.slug}`,
        lastModified: topic.publishedDate
          ? new Date(topic.publishedDate)
          : new Date(),
      }))
    } catch (err) {
      logContentApiFallback('sitemap-projects', err)
    }
  }
  if (!topics) {
    const topicsRes = await sendRestGqlRequest<GetProjectsForSitemapQuery>({
      operation: 'projects-sitemap',
      method: 'GET',
      variables: {
        where: buildSitemapProjectsWhereInput(sixtyDaysBefore),
      },
      traceHeaders,
    })
    topics = topicsRes?.data?.data?.projects?.map(
      (topic: SitemapProjectRow) => {
        return {
          url: `${KIDS_URL_ORIGIN}/topic/${topic.slug}`,
          lastModified: topic.publishedDate
            ? new Date(topic.publishedDate)
            : new Date(),
        }
      }
    )
  }
  if (topics) {
    sitemaps = [...sitemaps, ...topics]
  }

  return sitemaps
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemaps = await fetchSitemaps()
  return sitemaps?.map((sitemap) => {
    return {
      url: sitemap.url,
      lastModified: sitemap.lastModified,
    }
  })
}
