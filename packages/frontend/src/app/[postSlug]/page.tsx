import { notFound, permanentRedirect } from 'next/navigation'

import { getPostMeta } from '@/api/post'
import { log, LogLevel } from '@/utils/log'

async function PostPage({ params }: { params: { postSlug: string } }) {
  const { postSlug } = params
  const post = await getPostMeta({
    where: { slug: postSlug },
  })

  if (!post) {
    log(LogLevel.WARNING, `Post not found! ${postSlug}`)
    notFound()
  }

  permanentRedirect(`/article/${postSlug}`)
}

export default PostPage
