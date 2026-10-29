'use client'

import 'swiper/css'

import { Button, cn } from '@kids-reporter/routing-ui'
import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import type { Swiper as SwiperCore } from 'swiper/types'

import { useHotTopics } from '@/api-utils/react-query/hooks/hot-topics'
import { HotTopicsIcon } from '@/icons'
import { getMemberDisplayName } from '@/modules/idea-hub/utils'
import type { HotTopic } from '@/types/api'

const AUTOPLAY_MS = 7000

function syncInactiveSlides(swiper: SwiperCore) {
  if (swiper.destroyed || !swiper.slides) return
  swiper.slides.forEach((slide) => {
    const topicIndex = slide.getAttribute('data-swiper-slide-index')
    const inactive =
      Boolean(swiper.params.loop) &&
      topicIndex != null &&
      Number(topicIndex) !== swiper.realIndex
    if (inactive) slide.setAttribute('inert', '')
    else slide.removeAttribute('inert')
  })
}

function formatMonthDay(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}`
}

function HotTopicsBannerSkeleton() {
  return (
    <div
      className="h-[120px] w-full animate-pulse rounded-2xl border border-yellow-400 bg-yellow-100 tablet:h-[92px]"
      aria-busy="true"
    >
      <span className="sr-only">載入中</span>
    </div>
  )
}

function HotTopicSlide({ topic }: { topic: HotTopic }) {
  const account = getMemberDisplayName(topic.member)
  const day = formatMonthDay(topic.answeredAt)
  return (
    <Link
      href={`/article/${topic.slug}`}
      className="flex h-full flex-col justify-center gap-2"
    >
      <div className="flex min-w-0 items-center gap-1">
        <span className="flex shrink-0 items-center gap-1.5 text-yellow-600">
          <span className="flex size-[22px] items-center justify-center">
            <HotTopicsIcon />
          </span>
          <span className="prose-p2-bold whitespace-nowrap">熱門話題</span>
        </span>
        <span className="shrink-0 prose-p2-bold text-neutral-700">・</span>
        <span className="flex min-w-0 flex-1 items-center prose-p2 text-neutral-700">
          <span className="min-w-0 truncate">{account}</span>
          {day ? (
            <span className="shrink-0 whitespace-nowrap">{` 於 ${day} 作答`}</span>
          ) : null}
        </span>
      </div>
      <p className="line-clamp-2 prose-p1-bold text-neutral-900 tablet:line-clamp-1 tablet:prose-h6-large">
        {topic.title}
      </p>
    </Link>
  )
}

function HotTopicsCarousel({ topics }: { topics: HotTopic[] }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const swiperRef = useRef<SwiperCore>()
  const holdsRef = useRef(new Set<string>())
  const stoppedRef = useRef(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const canLoop = topics.length > 1

  const syncAutoplay = () => {
    const autoplay = swiperRef.current?.autoplay
    if (!autoplay || !canLoop) return
    if (stoppedRef.current) {
      autoplay.stop()
      return
    }
    if (holdsRef.current.size > 0) autoplay.pause()
    else autoplay.resume()
  }

  const setHold = (reason: string, held: boolean) => {
    if (held) holdsRef.current.add(reason)
    else holdsRef.current.delete(reason)
    syncAutoplay()
  }

  const setHoldRef = useRef(setHold)
  setHoldRef.current = setHold

  useLayoutEffect(() => {
    const swiper = swiperRef.current
    if (!swiper) return
    // afterInit does not run again when Swiper rebuilds slides for a new topic list
    syncInactiveSlides(swiper)
  }, [activeIndex, canLoop, topics])

  useEffect(() => {
    const node = rootRef.current
    if (!node || !canLoop) return
    const hold = (reason: string, held: boolean) =>
      setHoldRef.current(reason, held)
    const observer = new IntersectionObserver(([entry]) => {
      hold('view', !entry?.isIntersecting)
    })
    observer.observe(node)
    const onVisibility = () => hold('page', document.hidden)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [canLoop])

  return (
    <div
      ref={rootRef}
      className="flex items-center gap-5 overflow-hidden rounded-2xl border border-yellow-400 bg-yellow-100 py-4 pr-4 pl-6 transition-colors duration-200 hover:bg-yellow-200"
      onMouseEnter={() => setHold('hover', true)}
      onMouseLeave={() => setHold('hover', false)}
      onFocusCapture={() => setHold('focus', true)}
      onBlurCapture={(event) => {
        const next = event.relatedTarget
        if (next instanceof Node && event.currentTarget.contains(next)) return
        setHold('focus', false)
      }}
    >
      <Swiper
        direction="vertical"
        slidesPerView={1}
        loop={canLoop}
        speed={400}
        allowTouchMove={canLoop}
        autoplay={
          canLoop ? { delay: AUTOPLAY_MS, disableOnInteraction: false } : false
        }
        modules={canLoop ? [Autoplay] : []}
        className="h-[88px] min-w-0 flex-1 tablet:h-16"
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper
        }}
        onAfterInit={(swiper) => {
          syncInactiveSlides(swiper)
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex)
          syncInactiveSlides(swiper)
        }}
      >
        {topics.map((topic) => (
          <SwiperSlide key={topic.slug} className="h-full">
            <HotTopicSlide topic={topic} />
          </SwiperSlide>
        ))}
      </Swiper>
      {canLoop ? (
        <div
          className="flex shrink-0 flex-col"
          role="tablist"
          aria-label="熱門話題"
        >
          {topics.map((topic, index) => {
            const selected = activeIndex === index
            return (
              <button
                key={topic.slug}
                type="button"
                role="tab"
                aria-label={`第 ${index + 1} 則`}
                aria-selected={selected}
                className="group flex size-4 cursor-pointer items-center justify-center"
                onClick={() => {
                  stoppedRef.current = true
                  swiperRef.current?.slideToLoop(index)
                  swiperRef.current?.autoplay?.stop()
                }}
              >
                <span
                  className={cn(
                    'size-1.5 rounded-full transition-colors duration-200',
                    selected
                      ? 'bg-neutral-800'
                      : 'bg-black/15 group-hover:bg-neutral-800'
                  )}
                />
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

function HotTopicsBanner() {
  const { data, isLoading, isError, isFetching, refetch } = useHotTopics()

  if (isLoading) return <HotTopicsBannerSkeleton />
  if (isError) {
    return (
      <div className="flex min-h-[120px] flex-col items-center justify-center gap-4 text-center">
        <p className="prose-p1 text-neutral-700">載入發生錯誤，請稍候再試</p>
        <Button
          type="button"
          variant="neutral"
          size={44}
          isLoading={isFetching}
          onClick={() => {
            void refetch()
          }}
        >
          重試
        </Button>
      </div>
    )
  }
  if (!data || data.length === 0) return null
  return (
    <HotTopicsCarousel
      key={data.length > 1 ? 'looping' : 'single'}
      topics={data}
    />
  )
}

export default HotTopicsBanner
