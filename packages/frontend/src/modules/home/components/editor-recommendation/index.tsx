'use client'

import { cn } from '@kids-reporter/routing-ui'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRef } from 'react'

import { PostSummary } from '@/components/types'
import { FALLBACK_IMG } from '@/constants'
import {
  ArrowLeft,
  ArrowRight,
  EditorRecommendationIcon,
  EditorRecommendationIconLarge,
} from '@/icons'
import { getFormattedDate } from '@/utils'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback')
)

type EditorRecommendationProps = {
  posts: PostSummary[]
}

function EditorRecommendationCard({
  post,
  index,
}: {
  post: PostSummary
  index: number
}) {
  const formattedIndex = String(index + 1).padStart(2, '0')

  return (
    <div className="w-[280px] flex-shrink-0 snap-start tablet:w-[320px] desktop:w-[360px]">
      <span className="prose-h4-small leading-none text-neutral-900 desktop:prose-h4-large">
        {formattedIndex}
      </span>

      <Link href={post.url} className="group relative mt-2 flex flex-col">
        <div className="relative aspect-video w-full overflow-hidden rounded-[20px]">
          <ImageWithFallback
            src={post.image ?? FALLBACK_IMG}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-120"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 py-4 tablet:py-5">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center rounded-[30px] bg-neutral-200 px-2 py-1 prose-p3 text-neutral-900 tablet:px-2.5 tablet:py-1.5 desktop:prose-p2">
              {post.subSubcategory}
            </span>
            <span className="prose-p3 text-neutral-500 desktop:prose-p2">
              {getFormattedDate(post.publishedDate)}
            </span>
          </div>

          <h3 className="line-clamp-2 prose-h5-small text-neutral-900 not-italic transition-colors duration-300 group-hover:text-red-400 desktop:prose-h5-large">
            {post.title}
          </h3>

          <p className="line-clamp-4 prose-p2 text-neutral-600 desktop:prose-p1">
            {post.desc}
          </p>
        </div>
      </Link>
    </div>
  )
}

function EditorRecommendation({ posts }: EditorRecommendationProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  if (!posts || posts.length === 0) {
    return null
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const firstCard = container.querySelector<HTMLElement>(
        '[data-card-index="0"]'
      )
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth
        const gap = parseInt(
          window.getComputedStyle(container).gap.replace('px', '')
        )
        container.scrollBy({
          left: -(cardWidth + gap),
          behavior: 'smooth',
        })
      }
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const firstCard = container.querySelector<HTMLElement>(
        '[data-card-index="0"]'
      )
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth
        const gap = parseInt(
          window.getComputedStyle(container).gap.replace('px', '')
        )
        container.scrollBy({
          left: cardWidth + gap,
          behavior: 'smooth',
        })
      }
    }
  }

  return (
    <div className="relative w-full bg-yellow-100 pt-10 pb-14 tablet:pt-12 tablet:pb-16 desktop:pt-18 desktop:pb-24 hd:pt-24 hd:pb-30">
      <div className="mx-auto mb-6 flex max-w-300 items-center gap-2 px-6 tablet:mb-8 tablet:px-8 desktop:mb-10 desktop:px-12 hd:px-14">
        <EditorRecommendationIcon className="desktop:hidden" />
        <EditorRecommendationIconLarge className="hidden desktop:block" />
        <h2 className="prose-h2-small font-swei! desktop:prose-h2-large">
          編輯推薦
        </h2>

        <div className="ml-auto hidden gap-4 tablet:flex">
          <button
            onClick={scrollLeft}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-red-400 bg-white text-neutral-900 transition-all duration-300 hover:bg-red-400 hover:text-white tablet:h-12 tablet:w-12 desktop:h-14 desktop:w-14 [&>svg]:mr-1"
            aria-label="Scroll left"
            type="button"
          >
            <ArrowLeft />
          </button>
          <button
            onClick={scrollRight}
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border-2 border-red-400 bg-white text-neutral-900 transition-all duration-300 hover:bg-red-400 hover:text-white tablet:h-12 tablet:w-12 desktop:h-14 desktop:w-14 [&>svg]:ml-1"
            aria-label="Scroll right"
            type="button"
          >
            <ArrowRight />
          </button>
        </div>
      </div>
      <div
        ref={scrollContainerRef}
        className={cn(
          'flex snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 scrollbar-none',
          'tablet:scroll-px-8 tablet:px-8',
          'desktop:scroll-px-[max(48px,calc(50vw-600px+48px))] desktop:gap-8 desktop:px-[max(48px,calc(50vw-600px+48px))]',
          'hd:scroll-pl-[calc(50vw-600px+56px)] hd:pl-[calc(50vw-600px+56px)]'
        )}
      >
        {posts.map((post, index) => (
          <div key={post.title} data-card-index={index}>
            <EditorRecommendationCard post={post} index={index} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default EditorRecommendation
