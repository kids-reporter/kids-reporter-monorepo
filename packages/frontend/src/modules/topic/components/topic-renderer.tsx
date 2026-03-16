'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ProjectContentDraftRenderer } from '@kids-reporter/draft-renderer'
import { cn } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'
import { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'

import { ARTICLE_FONT_SIZE_CLASSNAMES } from '@/modules/article/constants'

export type TopicRendererProp = {
  rawContentState?: RawDraftContentState
  className?: string
}

function TopicRenderer({ rawContentState, className }: TopicRendererProp) {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  return isMounted && rawContentState ? (
    <div
      className={cn(
        'mb-10 prose-article text-neutral-900 tablet:mb-15',
        ...ARTICLE_FONT_SIZE_CLASSNAMES,
        className
      )}
    >
      <ProjectContentDraftRenderer rawContentState={rawContentState} />
    </div>
  ) : (
    <div className="mx-auto w-[calc(100%-48px)] max-w-[512px] leading-[200%] desktop:max-w-[584px]">
      <Skeleton count={10} />
    </div>
  )
}

export default TopicRenderer
