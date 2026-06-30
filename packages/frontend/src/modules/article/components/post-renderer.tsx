'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ArticleBodyDraftRenderer } from '@kids-reporter/draft-renderer'
import { cn } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'
import { useEffect, useRef } from 'react'
import Skeleton from 'react-loading-skeleton'

import { FontSizeLevel, STICKY_HEADER_HEIGHT } from '@/constants'

import {
  ARTICLE_FONT_SIZE_CLASSNAMES,
  ARTICLE_FONT_SIZE_CLASSNAMES_LARGE,
  ARTICLE_LARGE_FONT_BASE_CLASSNAME,
} from '../constants'
import { useArticleContext } from '../context'
import trimEmptyBlocks from '../utils/trim-empty-blocks'

type PostProp = {
  content: RawDraftContentState
  shouldMount?: boolean
}

const HASH_SCROLL_LAYOUT_STABLE_FRAMES = 3
const HASH_SCROLL_MAX_WAIT_MS = 2000
const HASH_SCROLL_CORRECTION_MS = 2000

function PostRenderer({ content, shouldMount }: PostProp) {
  const { onImageModalOpen, fontSize } = useArticleContext()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!shouldMount) return

    const hash = window.location.hash
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    let cancelled = false
    let rafId: number | undefined
    let correctionRafId: number | undefined
    let correctionTimeoutId: ReturnType<typeof setTimeout> | undefined
    let resizeObserver: ResizeObserver | undefined
    const tabletMediaQuery = window.matchMedia('(min-width: 768px)')
    const getIsTabletViewport = () => tabletMediaQuery.matches

    const scrollToHashTarget = () => {
      let id = ''
      try {
        id = decodeURIComponent(hash.slice(1))
      } catch {
        return false
      }

      if (!id) return false

      const anchor = document.getElementById(id)
      if (!anchor) return false

      const elementPosition = anchor.getBoundingClientRect().top
      const headerOffset = getIsTabletViewport() ? STICKY_HEADER_HEIGHT : 0
      const offsetPosition = elementPosition + window.scrollY - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: 'auto' })
      return true
    }

    const startScrollCorrection = () => {
      const container = containerRef.current
      if (!container || cancelled) return

      resizeObserver = new ResizeObserver(() => {
        if (cancelled) return

        if (correctionRafId !== undefined) {
          cancelAnimationFrame(correctionRafId)
        }

        correctionRafId = requestAnimationFrame(() => {
          correctionRafId = undefined
          if (!cancelled) {
            scrollToHashTarget()
          }
        })
      })
      resizeObserver.observe(container)
      correctionTimeoutId = setTimeout(() => {
        resizeObserver?.disconnect()
      }, HASH_SCROLL_CORRECTION_MS)
    }

    const attemptScrollStartedAt = Date.now()

    const attemptScroll = () => {
      if (cancelled) return

      if (scrollToHashTarget()) {
        startScrollCorrection()
        return
      }

      if (Date.now() - attemptScrollStartedAt >= HASH_SCROLL_MAX_WAIT_MS) {
        return
      }

      rafId = requestAnimationFrame(attemptScroll)
    }

    const waitForStableLayout = () => {
      if (cancelled) return

      const container = containerRef.current
      if (!container) {
        rafId = requestAnimationFrame(waitForStableLayout)
        return
      }

      let lastHeight = container.getBoundingClientRect().height
      let stableFrames = 0
      const startedAt = Date.now()

      const checkLayout = () => {
        if (cancelled) return

        const height = container.getBoundingClientRect().height
        if (height > 0 && height === lastHeight) {
          stableFrames += 1
        } else {
          stableFrames = 0
          lastHeight = height
        }

        const isStable = stableFrames >= HASH_SCROLL_LAYOUT_STABLE_FRAMES
        const isTimedOut = Date.now() - startedAt >= HASH_SCROLL_MAX_WAIT_MS

        if (isStable || isTimedOut) {
          attemptScroll()
          return
        }

        rafId = requestAnimationFrame(checkLayout)
      }

      rafId = requestAnimationFrame(checkLayout)
    }

    waitForStableLayout()

    return () => {
      cancelled = true
      if (rafId !== undefined) cancelAnimationFrame(rafId)
      if (correctionRafId !== undefined) cancelAnimationFrame(correctionRafId)
      if (correctionTimeoutId !== undefined) clearTimeout(correctionTimeoutId)
      resizeObserver?.disconnect()
    }
  }, [shouldMount])

  return (
    <div
      ref={containerRef}
      className={cn(
        'mb-10 prose-article text-neutral-900 tablet:mb-15',
        ...ARTICLE_FONT_SIZE_CLASSNAMES,
        fontSize === FontSizeLevel.LARGE && [
          ARTICLE_LARGE_FONT_BASE_CLASSNAME,
          ...ARTICLE_FONT_SIZE_CLASSNAMES_LARGE,
        ]
      )}
    >
      {shouldMount && (
        <ArticleBodyDraftRenderer
          rawContentState={trimEmptyBlocks(content)}
          onImageModalOpen={onImageModalOpen}
          offsetTop={STICKY_HEADER_HEIGHT}
        />
      )}
      {!shouldMount && (
        <div className="mx-auto w-[min(512px,calc(100vw-12px))] px-6 tablet:px-0 desktop:w-[584px]">
          <Skeleton count={10} />
        </div>
      )}
    </div>
  )
}

export default PostRenderer
