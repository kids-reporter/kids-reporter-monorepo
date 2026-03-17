'use client'

import { Button, cn, useMediaQuery } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'
import { useEffect, useRef, useState } from 'react'

import TopicRenderer from './topic-renderer'

const MOBILE_MAX_HEIGHT = 1200
const TABLET_MAX_HEIGHT = 700
const MASK_OFFSET = 128

type TopicContentWithMaskProps = {
  rawContentState?: RawDraftContentState
}

function TopicContentWithMask({ rawContentState }: TopicContentWithMaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [exceedsMaxHeight, setExceedsMaxHeight] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const areaRef = useRef<HTMLDivElement>(null)
  const shouldScrollToButtonOnCollapseRef = useRef(false)
  const isTablet = useMediaQuery('(min-width: 768px)')
  const maxHeight = isTablet ? TABLET_MAX_HEIGHT : MOBILE_MAX_HEIGHT

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
        {!isExpanded && (
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
    </div>
  )
}

export default TopicContentWithMask
