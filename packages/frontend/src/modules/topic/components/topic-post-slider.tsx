'use client'
import 'swiper/css'

import { cn, useMediaQuery } from '@kids-reporter/routing-ui'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperCore } from 'swiper/types'

import { PostSummary } from '@/components/types'
import { FALLBACK_IMG } from '@/constants'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback'),
  { ssr: false }
)

function FeaturedTopicArticleCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={post.url}
      className="group flex w-full min-w-0 items-start gap-4"
    >
      <div className="relative size-20 shrink-0 overflow-hidden rounded-[11px] desktop:size-[88px] desktop:rounded-[12px]">
        <ImageWithFallback
          className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-120"
          src={post.image ?? FALLBACK_IMG}
          loading="lazy"
        />
      </div>
      <p className="line-clamp-3 min-w-0 flex-1 prose-p1-bold text-neutral-900 transition-colors duration-300 group-hover:text-red-400 desktop:prose-h6-large">
        {post.title}
      </p>
    </Link>
  )
}

function TopicPostSlider({ posts }: { posts: PostSummary[] }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)', {
    initializeWithValue: false,
    defaultValue: false,
  })

  const slidesPerView = isDesktop ? 3 : 2

  const swiperRef = useRef<SwiperCore>()
  const [activeIndex, setActiveIndex] = useState(0)

  const postGroups = useMemo(
    () =>
      posts.reduce((acc, post, index) => {
        const row = Math.floor(index / slidesPerView)
        if (!acc[row]) {
          acc[row] = []
        }
        acc[row].push(post)
        return acc
      }, [] as PostSummary[][]),
    [posts, slidesPerView]
  )

  const slideCount = postGroups.length

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.update()
    }
  }, [postGroups])

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <Swiper
        loop={slideCount > 1}
        slidesPerView={1}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        className="topic-post-slider w-full"
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex)
        }}
        modules={[Autoplay]}
      >
        {postGroups.map((row, index) => (
          <SwiperSlide key={`row-${index}-${row.length}`}>
            <div className="flex min-w-0 flex-col gap-5 tablet:flex-row tablet:gap-6 desktop:flex-col desktop:gap-5">
              {row.map((post, i) => (
                <FeaturedTopicArticleCard
                  key={post.url ?? `row-${index}-${i}`}
                  post={post}
                />
              ))}
              {!isDesktop && row.length % 2 === 1 && (
                <div aria-hidden className="w-full min-w-0" />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {slideCount > 1 && (
        <div
          className="flex shrink-0 items-center gap-3 tablet:mt-5"
          role="tablist"
          aria-label="投影片分頁"
        >
          {postGroups.map((_, index) => (
            <button
              key={`dot-${index}`}
              type="button"
              role="tab"
              aria-label={`第 ${index + 1} 頁`}
              aria-selected={activeIndex === index}
              className={cn(
                'size-[8px] shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2',
                {
                  'bg-red-400': activeIndex === index,
                  'bg-neutral-300 hover:bg-neutral-500': activeIndex !== index,
                }
              )}
              onClick={() => {
                swiperRef.current?.slideToLoop(index)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default TopicPostSlider
