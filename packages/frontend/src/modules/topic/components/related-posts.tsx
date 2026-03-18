'use client'

import { cn, useMediaQuery } from '@kids-reporter/routing-ui'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PostSummary } from '@/components/types'
import { FALLBACK_IMG } from '@/constants'
import { Breakpoint } from '@/types'
import { getFormattedDate } from '@/utils'

function getRelatedPostGridColumn(
  viewPort: Breakpoint,
  index: number,
  total: number
): string {
  if (viewPort === 'mobile') return ''
  if (viewPort === 'tablet') {
    const perRow = 2
    const lastRowCount = total % perRow || perRow
    const lastRowStart = total - lastRowCount
    if (index >= lastRowStart && lastRowCount === 1) {
      return 'tablet:col-start-2 tablet:col-end-4'
    }
    return ''
  }
  // desktop (and hd)
  const perRow = 3
  const lastRowCount = total % perRow || perRow
  const lastRowStart = total - lastRowCount
  if (index < lastRowStart) return ''
  if (lastRowCount === 1) return 'desktop:col-start-3 desktop:col-end-5'
  if (lastRowCount === 2) {
    const posInLastRow = index - lastRowStart
    return posInLastRow === 0
      ? 'desktop:col-start-2 desktop:col-end-4'
      : 'desktop:col-start-4 desktop:col-end-6'
  }
  return ''
}

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback'),
  { ssr: false }
)

type RelatedPostCardProps = {
  post: PostSummary
}

function RelatedPostCard({ post }: RelatedPostCardProps) {
  return (
    <Link
      href={post.url}
      className="group flex w-full flex-col overflow-hidden rounded-[30px] bg-white"
    >
      <div className="relative w-full shrink-0 overflow-hidden rounded-t-[30px]">
        <div className="aspect-video w-full">
          <ImageWithFallback
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-120"
            src={post.image ?? FALLBACK_IMG}
            alt={post.title}
          />
        </div>
      </div>
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-[30px] bg-neutral-200 px-3 py-1 prose-p3-bold text-neutral-900">
            {post.subSubcategory || post.category}
          </span>
          <span className="shrink-0 prose-p2 text-neutral-500">
            {getFormattedDate(post.publishedDate)}
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <h3 className="line-clamp-2 prose-p1 font-bold text-neutral-900 transition-colors duration-300 group-hover:text-red-400 desktop:prose-h6-large">
            {post.title}
          </h3>
          {post.desc ? (
            <p className="line-clamp-4 h-26 prose-p1 text-neutral-700">
              {post.desc}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  )
}

type RelatedPostsProps = {
  posts?: PostSummary[]
}

function RelatedPosts({ posts = [] }: RelatedPostsProps) {
  const isTablet = useMediaQuery('(min-width: 768px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [viewPort, setViewPort] = useState<Breakpoint>('mobile')
  useEffect(() => {
    setViewPort(isDesktop ? 'desktop' : isTablet ? 'tablet' : 'mobile')
  }, [isTablet, isDesktop])

  if (!posts.length) {
    return null
  }

  return (
    <section className="mx-auto w-screen bg-neutral-100 px-6 py-10 tablet:px-8 tablet:py-16 desktop:px-12 desktop:py-20 hd:px-0">
      <div className="mx-auto grid max-w-300 grid-cols-1 gap-x-6 gap-y-6 tablet:grid-cols-4 tablet:gap-x-6 tablet:gap-y-8 desktop:grid-cols-6 desktop:gap-x-8 desktop:gap-y-10 hd:gap-x-8 hd:gap-y-14 hd:px-14">
        {posts.map((post, index) => (
          <div
            key={post.url}
            className={cn(
              'min-w-0 tablet:col-span-2 desktop:col-span-2',
              getRelatedPostGridColumn(viewPort, index, posts.length)
            )}
          >
            <RelatedPostCard post={post} />
          </div>
        ))}
      </div>
    </section>
  )
}

export default RelatedPosts
