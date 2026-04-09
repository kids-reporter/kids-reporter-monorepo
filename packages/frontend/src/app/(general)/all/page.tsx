import { emitStructured } from '@kids-reporter/logger'
import { Metadata } from 'next'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

import { getCallBaodaozaiIntroContent } from '@/api/call-baodaozai-intro'
import { getPostsPaged } from '@/api/post'
import { ERROR_PAGE, GENERAL_DESCRIPTION, POST_PER_PAGE } from '@/constants'
import AllModule from '@/modules/all'
import { getPostSummaries } from '@/utils'
import { getServerTraceHeaders } from '@/utils/trace-context'

export const metadata: Metadata = {
  title: '所有文章 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

export default async function LatestPosts() {
  const traceHeaders = getServerTraceHeaders(headers())

  const [posts, introContent] = await Promise.all([
    getPostsPaged(
      {
        orderBy: [
          {
            publishedDate: 'desc',
          },
        ],
        take: POST_PER_PAGE,
      },
      traceHeaders
    ),
    getCallBaodaozaiIntroContent(
      {
        where: { page: 'all' },
      },
      traceHeaders
    ),
  ])

  if (typeof posts === 'undefined') {
    emitStructured({
      severity: 'WARNING',
      message: `Empty posts response!`,
    })
    redirect(ERROR_PAGE)
  }

  const postSummaries = getPostSummaries(posts)

  return <AllModule introContent={introContent ?? ''} posts={postSummaries} />
}
