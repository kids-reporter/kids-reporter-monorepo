'use client'

import { ComponentProps, useMemo } from 'react'

import { ReporterIcon } from '@/icons'
import {
  BaodaozaiActionSetter,
  BaodaozaiEventTrigger,
} from '@/services/call-baodaozai'

type EventId =
  | 'show-start-reading'
  | 'hide-start-reading'
  | 'change-start-reading'
  | 'change-encourage-reading'
  | 'change-ask-questions'
  | 'show-ask-questions'
  | 'show-related-articles'
  | 'scroll-up'

type EventConfig = Pick<
  ComponentProps<typeof BaodaozaiEventTrigger>,
  'dialogState' | 'baodaozaiState'
>

type ArticleBaodaozaiEventTriggerProps = {
  id: EventId
  once?: boolean
  disabled?: boolean
  onAskQuestionsConfirm?: BaodaozaiActionSetter
  startReadingContent?: string
}

const ENCOURAGE_READING_CONTENT =
  '進度很棒！再看一下下，最後會有小挑戰等你破解！'

function createBaodaozaiEventConfig({
  onAskQuestionsConfirm,
  startReadingContent,
}: {
  onAskQuestionsConfirm?: BaodaozaiActionSetter
  startReadingContent?: string
}): Record<EventId, EventConfig> {
  return {
    'show-start-reading': {
      dialogState: {
        isOpen: true,
        confirmText: '開始閱讀',
        hideCancelButton: true,
        content: startReadingContent || '',
        confirmAction: () => {},
      },
      baodaozaiState: {
        isActive: true,
        action: 'speak',
      },
    },
    'hide-start-reading': {
      dialogState: {
        isOpen: false,
        hideCancelButton: true,
        confirmText: '開始閱讀',
        content: startReadingContent || '',
        confirmAction: () => {},
      },
      baodaozaiState: {
        isActive: false,
        action: 'none',
      },
    },
    'change-start-reading': {
      dialogState: {
        isOpen: false,
        hideCancelButton: true,
        confirmText: '開始閱讀',
        content: startReadingContent || '',
        confirmAction: () => {},
      },
      baodaozaiState: {
        isActive: false,
        action: 'none',
      },
    },
    'change-encourage-reading': {
      dialogState: {
        isOpen: false,
        hideCancelButton: true,
        confirmText: '繼續閱讀',
        content: ENCOURAGE_READING_CONTENT,
        confirmAction: () => {},
      },
      baodaozaiState: {
        isActive: false,
        action: 'none',
      },
    },
    'change-ask-questions': {
      dialogState: {
        isOpen: false,
        content:
          '你好棒！已經把文章讀完了！接下來讓我問問你幾個和文章有關的問題⋯⋯',
        hideCancelButton: false,
        confirmText: '好！出招吧',
        confirmAction: onAskQuestionsConfirm,
      },
      baodaozaiState: {
        isActive: false,
        action: 'none',
      },
    },
    'show-ask-questions': {
      dialogState: {
        isOpen: true,
        content:
          '你好棒！已經把文章讀完了！接下來讓我問問你幾個和文章有關的問題⋯⋯',
        hideCancelButton: false,
        confirmText: '好！出招吧',
        confirmAction: onAskQuestionsConfirm,
      },
      baodaozaiState: {
        isActive: true,
        action: 'speak',
      },
    },
    'show-related-articles': {
      dialogState: {
        isOpen: true,
        content: (
          <span>
            現在點擊相關文章的
            <span className="mx-1 inline-block size-5 align-middle">
              <ReporterIcon />
            </span>
            報導者，可以看到來自報導者的觀點了，一起來看看更多深度文章吧！
          </span>
        ),
        hideCancelButton: true,
        confirmText: '我知道了',
        confirmAction: () => {},
      },
      baodaozaiState: {
        isActive: true,
        action: 'speak',
      },
    },
    'scroll-up': {
      dialogState: {
        isOpen: false,
      },
      baodaozaiState: {
        isActive: false,
        action: 'none',
      },
    },
  }
}

function ArticleBaodaozaiEventTrigger({
  id,
  once = true,
  disabled = false,
  onAskQuestionsConfirm,
  startReadingContent: content,
}: ArticleBaodaozaiEventTriggerProps) {
  const eventConfig = useMemo(() => {
    const config = createBaodaozaiEventConfig({
      onAskQuestionsConfirm,
      startReadingContent: content,
    })
    return config[id]
  }, [id, onAskQuestionsConfirm, content])

  if (!eventConfig) {
    console.warn(
      `No configuration found for baodaozai event trigger with id: ${id}`
    )
    return null
  }

  return (
    <BaodaozaiEventTrigger
      id={id}
      once={once}
      disabled={disabled}
      {...eventConfig}
    />
  )
}

export default ArticleBaodaozaiEventTrigger
