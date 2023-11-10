import { Metadata } from 'next'
import axios from 'axios'
import { notFound } from 'next/navigation'
import PostList from '@/app/components/post-list'
import Pagination from '@/app/components/pagination'
import {
  API_URL,
  KIDS_URL_ORIGIN,
  GENERAL_DESCRIPTION,
  POST_PER_PAGE,
  POST_CONTENT_GQL,
  OG_SUFFIX,
} from '@/app/constants'
import { GetPostSummaries } from '@/app/utils'
import './page.scss'

const tagMetaGQL = `
query($where: TagWhereUniqueInput!) {
  tag(where: $where) {
    name
  }
}
`

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

export async function generateMetadata({
  params,
}: {
  params: { slug: any }
}): Promise<Metadata> {
  const slug = params.slug?.[0]
  if (!slug) {
    console.error('Incorrect tag routing!')
    notFound()
  }

  let tagName
  try {
    const tagRes = await axios.post(API_URL, {
      query: tagMetaGQL,
      variables: {
        where: {
          slug: slug,
        },
      },
    })
    tagName = tagRes?.data?.data?.tag?.name
    if (!tagName) {
      console.error('Tag not found!', params.slug)
    }
  } catch (err) {
    console.error('Fetch tag failed!', err)
  }

  return {
    title: `標籤: ${tagName} - ${OG_SUFFIX}`,
    description: GENERAL_DESCRIPTION,
    alternates: {
      canonical: `${KIDS_URL_ORIGIN}/tag/${slug}${
        params.slug?.[1] ? `/${params.slug[1]}` : ''
      }`,
    },
  }
}

// Tag's routing path: /tag/[slug]/[page num], ex: /tag/life/1
export default async function Tag({ params }: { params: { slug: any } }) {
  const slug = params.slug?.[0]
  const currentPage = !params.slug?.[1] ? 1 : Number(params.slug[1])

  if (params.slug?.length > 2 || !slug || !(currentPage > 0)) {
    console.error('Incorrect tag routing!')
    notFound()
  }

  let tag, posts, postsCount
  try {
    const response = await axios.post(API_URL, {
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

    tag = response?.data?.data?.tag
    if (!tag) {
      console.error('Tag not found!')
      notFound()
    }
    posts = tag.posts
    postsCount = tag.postsCount
  } catch (err) {
    console.error('Fetch post data failed!', err)
    notFound()
  }

  const totalPages = Math.ceil(postsCount / POST_PER_PAGE)
  if (currentPage > totalPages) {
    console.error(
      `Request page(${currentPage}) exceeds total pages(${totalPages}!`
    )
    notFound()
  }

  const postSummeries = GetPostSummaries(posts)

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
