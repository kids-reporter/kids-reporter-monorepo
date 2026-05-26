'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ArticleBodyDraftRenderer } from '@kids-reporter/draft-renderer'
import { cn } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'
import { useEffect } from 'react'
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

function PostRenderer({ content, shouldMount }: PostProp) {
  const { onImageModalOpen, fontSize } = useArticleContext()

  useEffect(() => {
    if (!shouldMount) return

    const hash = window.location.hash
    if (!hash) {
      window.scrollTo(0, 0)
      return
    }

    const scrollToHashTarget = () => {
      let id = ''
      try {
        id = decodeURIComponent(hash.slice(1))
      } catch {
        return false
      }

      const anchor = document.getElementById(id)
      if (!anchor) return false

      const elementPosition = anchor.getBoundingClientRect().top
      const headerOffset = window.matchMedia('(min-width: 768px)').matches
        ? STICKY_HEADER_HEIGHT
        : 0
      const offsetPosition = elementPosition + window.scrollY - headerOffset
      window.scrollTo({ top: offsetPosition, behavior: 'auto' })
      return true
    }

    let rafId1: number | undefined
    let rafId2: number | undefined

    if (!scrollToHashTarget()) {
      rafId1 = requestAnimationFrame(() => {
        if (!scrollToHashTarget()) {
          rafId2 = requestAnimationFrame(scrollToHashTarget)
        }
      })
    }

    return () => {
      if (rafId1 !== undefined) cancelAnimationFrame(rafId1)
      if (rafId2 !== undefined) cancelAnimationFrame(rafId2)
    }
  }, [shouldMount])

  return (
    <div
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
