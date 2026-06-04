import { emitStructured } from '@kids-reporter/logger'
import { headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'

import { getPostMeta } from '@/api/post'
import { getServerTraceHeaders } from '@/utils/trace-context'

async function PostPage({ params }: { params: { postSlug: string } }) {
  const { postSlug } = params
  const traceHeaders = getServerTraceHeaders(headers())
  const post = await getPostMeta({ slug: postSlug }, traceHeaders)

  if (!post) {
    emitStructured({
      severity: 'WARNING',
      message: `Post not found! ${postSlug}`,
    })
    notFound()
  }

  permanentRedirect(`/article/${postSlug}`)
}

export default PostPage
