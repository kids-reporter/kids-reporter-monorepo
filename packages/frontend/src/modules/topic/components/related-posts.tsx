'use client'

import { useMediaQuery } from '@kids-reporter/routing-ui'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { PostSummary } from '@/components/types'
import { FALLBACK_IMG } from '@/constants'
import { Breakpoint } from '@/types'
import { getFormattedDate } from '@/utils'

import { RELATED_POSTS_PER_ROW } from '../constants'
import { groupPostsByRow } from '../utils'

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

  const groupedPosts = groupPostsByRow(posts, viewPort)
  const perRow = RELATED_POSTS_PER_ROW[viewPort]

  return (
    <section className="mx-auto w-screen bg-neutral-100 px-6 py-10 tablet:px-8 tablet:py-16 desktop:px-12 desktop:py-20 hd:px-0">
      <div className="flex flex-col gap-6 tablet:gap-8 desktop:gap-10 hd:gap-14">
        {groupedPosts.map((row, index) => {
          return (
            <div
              key={`row-${index}`}
              className="mx-auto flex max-w-300 justify-center gap-8 hd:px-14"
            >
              {row.map((post) => (
                <div
                  key={post.url}
                  className="min-w-0 shrink-0 grow-0"
                  style={{
                    // 100% - (perRow - 1) * gapPx / perRow
                    flexBasis: `calc((100% - (${perRow - 1} * 32px)) / ${perRow})`,
                  }}
                >
                  <RelatedPostCard post={post} />
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default RelatedPosts
