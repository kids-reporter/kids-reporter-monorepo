'use client'

import { Button, cn, useMediaQuery } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'
import { useEffect, useRef, useState } from 'react'

import { useToggleBookmark } from '@/api-utils/react-query/hooks/bookmark'
import { BookmarkFilledIcon, BookmarkOutlineIcon } from '@/icons/miscellaneous'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'

import TopicRenderer from './topic-renderer'

const MOBILE_MAX_HEIGHT = 1200
const TABLET_MAX_HEIGHT = 700
const MASK_OFFSET = 128

type TopicContentWithMaskProps = {
  slug: string
  rawContentState?: RawDraftContentState
}

function TopicContentWithMask({
  slug,
  rawContentState,
}: TopicContentWithMaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [exceedsMaxHeight, setExceedsMaxHeight] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const shouldScrollToButtonOnCollapseRef = useRef(false)
  const isTablet = useMediaQuery('(min-width: 768px)')
  const maxHeight = isTablet ? TABLET_MAX_HEIGHT : MOBILE_MAX_HEIGHT

  const { hydrated, member, tokens } = useHydratedAuthStore()
  const isLogin = hydrated && !!member && !!tokens?.accessToken
  const { isBookmarked, isLoading, isPending, toggle } = useToggleBookmark({
    type: 'project',
    slug,
    memberId: member?.id,
    accessToken: tokens?.accessToken,
    enabled: isLogin,
  })

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const checkHeight = () => {
      setExceedsMaxHeight(el.scrollHeight > maxHeight)
    }

    checkHeight()
    const observer = new ResizeObserver(checkHeight)
    observer.observe(el)
    return () => observer.disconnect()
  }, [maxHeight, rawContentState])

  useEffect(() => {
    if (isExpanded) return
    if (!shouldScrollToButtonOnCollapseRef.current) return

    shouldScrollToButtonOnCollapseRef.current = false

    const area = areaRef.current
    if (!area) return

    const areaTop = area.getBoundingClientRect().top + window.scrollY
    window.scrollTo({
      top: areaTop + maxHeight - MASK_OFFSET,
      behavior: 'smooth',
    })
  }, [isExpanded, maxHeight])

  const showButton = exceedsMaxHeight

  const handleButtonClick = () => {
    if (isExpanded) {
      shouldScrollToButtonOnCollapseRef.current = true
      setIsExpanded(false)
      return
    }
    setIsExpanded(true)
  }

  return (
    <div className="w-full">
      <div
        ref={areaRef}
        className={cn(
          'relative w-full overflow-hidden',
          !isExpanded && 'max-h-[1200px] tablet:max-h-[700px]'
        )}
      >
        <div ref={contentRef}>
          <TopicRenderer rawContentState={rawContentState} />
        </div>
        {showButton && !isExpanded && (
          <div
            className="pointer-events-none absolute right-0 bottom-0 left-0 z-1 h-40 bg-linear-to-b from-[rgba(255,255,255,0)] to-white"
            aria-hidden
          />
        )}
        {showButton && (
          <div
            className={cn(
              'absolute bottom-0 left-1/2 z-2 flex -translate-x-1/2 justify-center',
              isExpanded ? 'relative' : ''
            )}
          >
            <Button
              type="button"
              onClick={handleButtonClick}
              aria-expanded={isExpanded}
              variant="secondary"
              className="w-60 desktop:w-75"
            >
              {isExpanded ? '顯示部分' : '顯示全文'}
            </Button>
          </div>
        )}
      </div>
      {isLogin && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggle}
            disabled={isPending || isLoading}
            aria-label={isBookmarked ? '取消收藏專題' : '收藏此專題'}
            className="my-2 flex h-11 w-60 cursor-pointer items-center justify-center gap-1 rounded-full border-2 border-neutral-400 bg-white px-5 py-2 prose-p1-bold text-neutral-900 transition-colors disabled:cursor-default disabled:opacity-60 desktop:w-75"
          >
            {isBookmarked ? <BookmarkFilledIcon /> : <BookmarkOutlineIcon />}
            {isBookmarked ? '已收藏專題' : '收藏此專題'}
          </button>
        </div>
      )}
    </div>
  )
}

export default TopicContentWithMask
