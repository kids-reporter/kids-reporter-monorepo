'use client'

import { Button } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import Link from 'next/link'

import { useCategoryPostsQuery } from '@/api-utils/react-query/hooks/post'
import { CategorySlug } from '@/types'
import { getPostSummaries } from '@/utils'

import CategoryPostCard from './category-post-card'
import CategoryPostCardsIllustrations from './illustrations'

type CategoryPostsProps = {
  category: CategorySlug
  categoryName: string
  isLast: boolean
}

const CATEGORY_POSTS_TAKE = 3

function CategoryPostCards({
  category,
  categoryName,
  isLast,
}: CategoryPostsProps) {
  const { data, isLoading } = useCategoryPostsQuery({
    slug: category,
    take: CATEGORY_POSTS_TAKE,
    skip: 0,
  })

  if (!data?.relatedPosts) {
    return null
  }

  const posts = getPostSummaries(
    data.relatedPosts.filter((post): post is NonNullable<typeof post> =>
      Boolean(post)
    )
  )

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="relative w-full">
      <div className="relative z-2 mx-auto w-full max-w-300">
        <h2 className="mb-6 flex w-full items-center justify-center gap-2 prose-h2-small text-neutral-900 tablet:mb-8 desktop:mb-12 desktop:prose-h2-large">
          <Image
            src={`/assets/images/home/category/${category.replace('-', '_')}_icon_s.svg`}
            alt={categoryName}
            width={44}
            height={44}
            className="desktop:hidden"
          />
          <Image
            src={`/assets/images/home/category/${category.replace('-', '_')}_icon_l.svg`}
            alt={categoryName}
            width={64}
            height={64}
            className="hidden desktop:block"
          />
          {categoryName}
        </h2>
        <div className="flex w-full snap-x snap-mandatory scroll-px-12 gap-6 overflow-x-auto px-12 pb-2 scrollbar-none tablet:grid tablet:grid-cols-3 tablet:px-6 desktop:scroll-px-8 desktop:gap-8 desktop:px-12 hd:px-14">
          {!isLoading ? (
            posts.map((post) => <CategoryPostCard key={post.url} post={post} />)
          ) : (
            <div className="h-65"></div>
          )}
        </div>
        <Button
          variant="secondary"
          size={44}
          asChild
          className="mx-auto mt-4 flex w-max tablet:mt-6 desktop:mt-8"
        >
          <Link href={`/category/${category}`}>看全部</Link>
        </Button>
        {!isLast && (
          <div className="mx-6 my-10 h-[2px] bg-[url('/assets/images/home/category/divider.svg')] bg-center bg-repeat-x tablet:mx-8 tablet:my-12 desktop:mx-12 desktop:my-16 hd:mx-14 hd:my-18"></div>
        )}
      </div>
      <CategoryPostCardsIllustrations category={category} />
    </div>
  )
}

export default CategoryPostCards
