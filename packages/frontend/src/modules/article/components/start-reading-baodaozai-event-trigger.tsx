'use client'
import { useIsAtTop } from '@kids-reporter/routing-ui'
import { useEffect, useState } from 'react'

import ArticleBaodaozaiEventTrigger from './article-baodaozai-event-trigger'

type StartReadingBaodaozaiEventTriggerProps = {
  content: string
}

function StartReadingBaodaozaiEventTrigger({
  content,
}: StartReadingBaodaozaiEventTriggerProps) {
  const isAtTop = useIsAtTop(35)
  const [isFirstRenderAtTop, setIsFirstRenderAtTop] = useState(isAtTop)

  const disabled = !isFirstRenderAtTop

  useEffect(() => {
    if (!isAtTop && isFirstRenderAtTop) {
      setIsFirstRenderAtTop(false)
    }
  }, [isAtTop, isFirstRenderAtTop])

  return (
    <ArticleBaodaozaiEventTrigger
      id="show-start-reading"
      disabled={disabled}
      startReadingContent={content}
    />
  )
}

export default StartReadingBaodaozaiEventTrigger
