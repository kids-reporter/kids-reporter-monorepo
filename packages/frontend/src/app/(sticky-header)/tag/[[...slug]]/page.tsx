import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import PostList from '@/app/components/post-list'
import Pagination from '@/app/components/pagination'
import {
  API_URL,
  GENERAL_DESCRIPTION,
  POST_PER_PAGE,
  POST_CONTENT_GQL,
} from '@/app/constants'
import { getPostSummaries, sendGQLRequest, log, LogLevel } from '@/app/utils'
import './page.scss'

export const metadata: Metadata = {
  title: '標籤 - 少年報導者 The Reporter for Kids',
  description: GENERAL_DESCRIPTION,
}

const tagGQL = `
query($where: TagWhereUniqueInput!, $take: Int, $skip: Int!, $orderBy: [PostOrderByInput!]!) {
  tag(where: $where) {
    posts(orderBy: $orderBy, take: $take, skip: $skip) {
      ${POST_CONTENT_GQL}
    }
    postsCount
    name
  }
}
`

// Tag's routing path: /tag/[slug]/[page num], ex: /tag/life/1
export default async function Tag({ params }: { params: { slug: any } }) {
  const slug = params.slug?.[0]
  const currentPage = !params.slug?.[1] ? 1 : Number(params.slug[1])

  if (params.slug?.length > 2 || !slug || !(currentPage > 0)) {
    log(LogLevel.WARNING, 'Incorrect tag routing!')
    notFound()
  }

  const response = await sendGQLRequest(API_URL, {
    query: tagGQL,
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

  const tag = response?.data?.data?.tag
  if (!tag) {
    log(LogLevel.WARNING, 'Tag not found!')
    notFound()
  }
  const posts = tag.posts
  const postsCount = tag.postsCount

  const totalPages = Math.ceil(postsCount / POST_PER_PAGE)
  if (currentPage > totalPages) {
    log(
      LogLevel.WARNING,
      `Request page(${currentPage}) exceeds total pages(${totalPages}!`
    )
    notFound()
  }

  const postSummeries = getPostSummaries(posts)

  return (
    <main>
      <div className="info">
        <h1>#{tag.name}</h1>
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
