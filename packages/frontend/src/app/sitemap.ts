/*
NOTE:
There is a bug of sitemap regeneration in Next.js below v13.5.4
https://github.com/vercel/next.js/issues/54057

BUT there is also a bug of non-conditional request above v13.5.4
(cdn caches 304 response & make blank pages)
https://github.com/vercel/next.js/issues/56018

Therefore, so far we can't upgrade to v13.5.4 due to #56018 & #54057 remains.
*/

import { MetadataRoute } from 'next'
import axios from 'axios'
import errors from '@twreporter/errors'
import { API_URL, KIDS_URL_ORIGIN } from '@/app/constants'
import { log, LogLevel } from '@/app/utils'

export const revalidate = 86400 // 1 day

const postsGQL = `
query($where: PostWhereInput!) {
  posts(where: $where) {
    slug
    publishedDate
  }
}
`

const topicsGQL = `
query($where: ProjectWhereInput!) {
  projects(where: $where) {
    slug
    publishedDate
  }
}
`

const fetchSitemaps = async (): Promise<
  { url: string; lastModified: Date }[]
> => {
  let sitemaps: { url: string; lastModified: Date }[] = []
  const sixtyDaysBefore = new Date(
    new Date().setHours(0, 0, 0, 0) - 60 * 24 * 60 * 60 * 1000
  )
  try {
    const postsRes = await axios.post(API_URL, {
      query: postsGQL,
      variables: {
        where: {
          publishedDate: {
            gte: sixtyDaysBefore,
          },
        },
      },
    })
    const posts = postsRes?.data?.data?.posts?.map((post: any) => {
      return {
        url: `${KIDS_URL_ORIGIN}/article/${post.slug}`,
        lastModified: post.publishedDate,
      }
    })
    if (posts) {
      sitemaps = [...posts]
    }
  } catch (err) {
    const annotatedErr = errors.helpers.annotateAxiosError(err)
    const msg = errors.helpers.printAll(annotatedErr, {
      withStack: true,
      withPayload: true,
    })
    log(LogLevel.ERROR, msg)
  }

  try {
    const topicsRes = await axios.post(API_URL, {
      query: topicsGQL,
      variables: {
        where: {
          publishedDate: {
            gte: sixtyDaysBefore,
          },
        },
      },
    })
    const topics = topicsRes?.data?.data?.projects?.map((topic: any) => {
      return {
        url: `${KIDS_URL_ORIGIN}/topic/${topic.slug}`,
        lastModified: topic.publishedDate,
      }
    })
    if (topics) {
      sitemaps = [...sitemaps, ...topics]
    }
  } catch (err) {
    const annotatedErr = errors.helpers.annotateAxiosError(err)
    const msg = errors.helpers.printAll(annotatedErr, {
      withStack: true,
      withPayload: true,
    })
    log(LogLevel.ERROR, msg)
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
