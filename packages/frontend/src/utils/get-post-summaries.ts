import { Post } from '__generated__/types'

import { PostSummary } from '@/components/types'
import { FALLBACK_IMG } from '@/constants'
import { DeepPartial } from '@/types/utils'

export const getPostSummaries = (posts: DeepPartial<Post>[]): PostSummary[] => {
  return posts.map((post) => {
    const subSubcategory = post?.subSubcategoriesOrdered?.[0]

    return {
      image: post.heroImage?.resized?.small ?? FALLBACK_IMG,
      title: post.title ?? '',
      url: `/article/${post.slug}`,
      desc: post.ogDescription ?? '',
      category: subSubcategory?.subcategory?.name ?? '',
      subSubcategory: subSubcategory?.name ?? '',
      publishedDate: post.publishedDate ?? '',
    }
  })
}
