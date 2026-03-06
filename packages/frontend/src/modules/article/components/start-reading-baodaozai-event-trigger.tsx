'use client'
import { useIsAtTop } from '@kids-reporter/routing-ui'
import { useEffect, useState } from 'react'

import { useFeatureIntroDialogContext } from '@/services/feature-intro'

import ArticleBaodaozaiEventTrigger from './article-baodaozai-event-trigger'

type StartReadingBaodaozaiEventTriggerProps = {
  content: string
  isIdle: boolean
}

function StartReadingBaodaozaiEventTrigger({
  content,
  isIdle,
}: StartReadingBaodaozaiEventTriggerProps) {
  const isAtTop = useIsAtTop(35)
  const [isFirstRenderAtTop, setIsFirstRenderAtTop] = useState(isAtTop)
  const { isFinishedIntro } = useFeatureIntroDialogContext()

  const disabled = !isFinishedIntro || !isFirstRenderAtTop || isIdle

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
