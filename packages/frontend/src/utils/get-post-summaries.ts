import { PostSummary } from '@/components/types'
import { FALLBACK_IMG } from '@/constants'
import { Post } from '@/types/api'
import { DeepPartial } from '@/types/utils'

export const getPostSummaries = (posts: DeepPartial<Post>[]): PostSummary[] => {
  return posts.map((post) => {
    const subSubcategory = post?.subSubcategoriesOrdered?.[0]

    const externalUrl = post.externalUrl ?? ''

    return {
      image: post.heroImage?.resized?.small ?? FALLBACK_IMG,
      title: post.title ?? '',
      url: externalUrl || `/article/${post.slug}`,
      desc: post.ogDescription ?? '',
      category: subSubcategory?.subcategory?.name ?? '',
      subSubcategory: subSubcategory?.name ?? '',
      publishedDate: post.publishedDate ?? '',
      externalUrl,
      videoDuration: post.videoDuration ?? '',
    }
  })
}
