import type {
  GetPostsQuery,
  PostsCountQuery,
} from '__generated__/operations/content.generated'
import type { Post } from '__generated__/types'
import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { getCallBaodaozaiIntroContent } from '@/api/call-baodaozai-intro'
import Pagination from '@/components/pagination'
import PostList from '@/components/post-list'
import { ERROR_PAGE, GENERAL_DESCRIPTION, POST_PER_PAGE } from '@/constants'
import { BaodaozaiVisibilitySetter } from '@/services/call-baodaozai'
import type { DeepPartial } from '@/types/utils'
import { getPostSummaries, log, LogLevel } from '@/utils'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

import AllModule from './_components/module'

export const metadata: Metadata = {
  title: '所有文章 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

// TODO: improve posts loading with ajax instead of routing to avoid page reload
// Latest post page's routing path: /all/[page num], ex: /all/1
export default async function LatestPosts({
  params,
}: {
  params: { page: any }
}) {
  const currentPage = !params.page ? 1 : Number(params.page?.[0])

  if (params.page?.length > 1 || !(currentPage > 0)) {
    log(LogLevel.WARNING, `Incorrect page!: ${params.page}, ${currentPage}`)
    notFound()
  }

  // Fetch total posts count
  const postsCountRes = await sendRestGqlRequest<PostsCountQuery>({
    operation: 'posts-count',
    method: 'GET',
  })
  if (!postsCountRes) {
    log(LogLevel.WARNING, `Empty post count response!`)
  }
  const postsCount = postsCountRes?.data?.data?.postsCount ?? 0

  let posts: DeepPartial<Post>[] = []
  let totalPages
  if (postsCount > 0) {
    totalPages = Math.ceil(postsCount / POST_PER_PAGE)
    if (currentPage > 1 && currentPage > totalPages) {
      log(
        LogLevel.WARNING,
        `Request page(${currentPage}) exceeds total pages(${totalPages})!`
      )
      notFound()
    }

    // Fetch posts of specific page
    const postsRes = await sendRestGqlRequest<GetPostsQuery>({
      operation: 'posts-paged',
      method: 'GET',
      variables: {
        orderBy: [
          {
            publishedDate: 'desc',
          },
        ],
        take: POST_PER_PAGE,
        skip: (currentPage - 1) * POST_PER_PAGE,
      },
    })
    if (!postsRes) {
      log(LogLevel.WARNING, `Empty posts response!`)
      redirect(ERROR_PAGE)
    }
    posts = postsRes?.data?.data?.posts ?? []
  }

  const postSummaries = getPostSummaries(posts)

  const introContent = await getCallBaodaozaiIntroContent({
    where: { page: 'all' },
  })

  return (
    <main
      style={{ width: '95vw' }}
      className="mx-auto mb-10 flex flex-col items-center justify-center gap-10"
    >
      <BaodaozaiVisibilitySetter show={true} />
      <AllModule introContent={introContent ?? ''} />
      <img
        className="w-full max-w-xl"
        src={'/assets/images/new_article.svg'}
        loading="lazy"
      />
      <PostList posts={postSummaries} />
      {totalPages && totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          routingPrefix={'/all'}
        />
      )}
    </main>
  )
}
