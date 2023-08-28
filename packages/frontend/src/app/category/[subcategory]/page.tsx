import axios from 'axios'
import { notFound } from 'next/navigation'
import PostCard from '@/app/components/post-card'
import Tags from '@/app/components/tags'
import { API_URL } from '@/app/constants'

// TODO: remove mockup
import { postMockupsMore } from '@/app/mockup'

const categoryGQL = ``

const postQueryGQL = `
`

export default async function SubCategory({
  params,
}: {
  params: { subcategory: string }
}) {
  let categoryRes, postRes
  try {
    categoryRes = params?.subcategory
      ? await axios.post(API_URL, {
          query: categoryGQL,
          variables: {
            where: {
              slug: params.subcategory,
            },
          },
        })
      : undefined

    postRes = params?.subcategory
      ? await axios.post(API_URL, {
          query: postQueryGQL,
          variables: {
            where: {
              slug: params.subcategory,
            },
          },
        })
      : undefined
  } catch (err) {
    console.error('Fetch post data failed!', err)
    notFound()
  }

  const categoryTags = categoryRes?.data?.map((category: any) => {
    return {
      name: category.name,
      slug: category.slug,
    }
  })
  const post = postRes?.data?.data?.post
  if (!post) {
    notFound()
  }

  return (
    <main>
      <div className="info">
        <div className="avatar">
          <img src={'/images/category_news.svg'} />
        </div>
        <div>
          <Tags tags={categoryTags} />
        </div>
      </div>
      <div className="post-list">
        {postMockupsMore.map((post, index) => {
          return <PostCard key={`author-post-card-${index}`} post={post} />
        })}
      </div>
    </main>
  )
}
