'use client'

import { ComponentProps, useMemo } from 'react'

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
const ASK_QUESTIONS_CONTENT =
  '你好棒！已經把文章讀完了！接下來讓我問問你幾個和文章有關的問題⋯⋯'

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
        action: 'dialog-read',
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
        action: 'dialog-read',
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
        action: 'idel-read',
        clickBaodaozaiAction: 'idel-read',
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
        action: 'idel-read',
      },
    },
    'change-ask-questions': {
      dialogState: {
        isOpen: false,
        content: ASK_QUESTIONS_CONTENT,
        hideCancelButton: false,
        confirmText: '好！出招吧',
        confirmAction: onAskQuestionsConfirm,
      },
      baodaozaiState: {
        action: 'idel-enlighten',
        clickBaodaozaiAction: 'dialog-enlighten',
      },
    },
    'show-ask-questions': {
      dialogState: {
        isOpen: true,
        content: ASK_QUESTIONS_CONTENT,
        hideCancelButton: false,
        confirmText: '好！出招吧',
        confirmAction: onAskQuestionsConfirm,
      },
      baodaozaiState: {
        action: 'dialog-enlighten',
      },
    },
    'scroll-up': {
      dialogState: {
        isOpen: false,
      },
      baodaozaiState: {
        action: 'idel-read',
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
