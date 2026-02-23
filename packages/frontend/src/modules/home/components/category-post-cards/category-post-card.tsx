'use client'

import { cn } from '@kids-reporter/routing-ui'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import { PostSummary } from '@/components/types'
import { FALLBACK_IMG } from '@/constants'
import { getFormattedDate } from '@/utils'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback')
)

type CategoryPostCardProps = {
  post: PostSummary
  className?: string
}

function CategoryPostCard({ post, className }: CategoryPostCardProps) {
  return (
    <div
      className={cn(
        'min-h-30 w-[calc(100vw-96px)] flex-shrink-0 snap-start tablet:min-h-auto tablet:w-auto',
        className
      )}
    >
      <Link href={post.url} className="group relative flex h-full flex-col">
        <div className="flex h-full flex-col overflow-hidden rounded-[30px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.05)]">
          {/* Image */}
          <div className="relative aspect-video w-full overflow-hidden rounded-t-[30px]">
            <ImageWithFallback
              src={post.image ?? FALLBACK_IMG}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-120"
            />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-3 p-4 tablet:p-5">
            {/* Category Tag */}
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center rounded-[30px] bg-neutral-200 px-2 py-1 prose-p3 tablet:px-2.5 tablet:py-1.5 desktop:prose-p2">
                {post.subSubcategory}
              </span>
              <span className="prose-p3 text-neutral-500 desktop:prose-p2">
                {getFormattedDate(post.publishedDate)}
              </span>
            </div>

            {/* Title */}
            <h3 className="line-clamp-2 prose-h5-small text-neutral-900 not-italic transition-colors duration-300 group-hover:text-red-400 desktop:prose-h5-large">
              {post.title}
            </h3>
            <p className="line-clamp-4 prose-p2 text-neutral-600 desktop:prose-p1">
              {post.desc}
            </p>
          </div>
        </div>
      </Link>
    </div>
  )
}

export default CategoryPostCard
