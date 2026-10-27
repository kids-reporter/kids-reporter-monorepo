import { emitStructured } from '@kids-reporter/logger'
import { headers } from 'next/headers'
import { notFound, permanentRedirect } from 'next/navigation'

import { getPostMeta } from '@/api/post'
import { isCmsSlug } from '@/utils/is-cms-slug'
import { getServerTraceHeaders } from '@/utils/trace-context'

async function PostPage(props: { params: Promise<{ postSlug: string }> }) {
  const params = await props.params
  const { postSlug } = params

  if (!isCmsSlug(postSlug)) {
    notFound()
  }

  const traceHeaders = getServerTraceHeaders(await headers())
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
