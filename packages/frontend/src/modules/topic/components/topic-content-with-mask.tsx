'use client'

import { Button, cn, useMediaQuery } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'
import { useEffect, useRef, useState } from 'react'

import TopicRenderer from './topic-renderer'

const MOBILE_MAX_HEIGHT = 1200
const TABLET_MAX_HEIGHT = 700

type TopicContentWithMaskProps = {
  rawContentState?: RawDraftContentState
}

function TopicContentWithMask({ rawContentState }: TopicContentWithMaskProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [exceedsMaxHeight, setExceedsMaxHeight] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
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

  const showButton = exceedsMaxHeight

  return (
    <div className="w-full">
      <div
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
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-32 bg-linear-to-b from-[rgba(255,255,255,0)] to-white"
            aria-hidden
          />
        )}
      </div>
      {showButton && (
        <div
          className={cn('mt-10 flex justify-center', isExpanded ? 'mt-0' : '')}
        >
          <Button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            variant="secondary"
            className="w-60 desktop:w-75"
          >
            {isExpanded ? '顯示部分' : '顯示全文'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default TopicContentWithMask
