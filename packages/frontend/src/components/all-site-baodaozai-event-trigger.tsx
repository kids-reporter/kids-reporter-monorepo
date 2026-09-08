'use client'

import { useIsAtTop } from '@kids-reporter/routing-ui'
import {
  ComponentProps,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import BaodaozaiEventTrigger from '@/services/call-baodaozai/components/baodaozai-event-trigger'
import { BaodaozaiActionSetter } from '@/services/call-baodaozai/types'

type EventId = 'show-intro' | 'hide-intro'

type EventConfig = Pick<
  ComponentProps<typeof BaodaozaiEventTrigger>,
  'dialogState' | 'baodaozaiState'
>

type AllSiteBaodaozaiEventTriggerProps = {
  id: EventId
  content?: string
  isIdle: boolean
}

function createBaodaozaiEventConfig({
  content,
  confirmAction,
}: {
  confirmAction: (args: Parameters<BaodaozaiActionSetter>[0]) => void
  content?: string
}): Record<EventId, EventConfig> {
  return {
    'show-intro': {
      dialogState: {
        isOpen: true,
        content: content || '',
        confirmText: '開始介紹',
        confirmAction,
        cancelText: '跳過',
        cancelAction: ({ setAction }) => {
          setAction('default')
        },
      },
      baodaozaiState: {
        action: 'dialog-speaker',
        clickBaodaozaiAction: 'dialog-speaker',
      },
    },
    'hide-intro': {
      dialogState: {
        isOpen: false,
        content: content || '',
        confirmText: '開始介紹',
        confirmAction,
        cancelText: '跳過',
        cancelAction: ({ setAction }) => {
          setAction('default')
        },
      },
      baodaozaiState: {
        action: 'default',
        clickBaodaozaiAction: 'dialog-speaker',
      },
    },
  }
}

function AllSiteBaodaozaiEventTrigger({
  id,
  content,
  isIdle,
}: AllSiteBaodaozaiEventTriggerProps) {
  const isAtTop = useIsAtTop(35)
  const [isFirstRenderAtTop, setIsFirstRenderAtTop] = useState(isAtTop)

  useEffect(() => {
    if (!isAtTop && isFirstRenderAtTop) {
      setIsFirstRenderAtTop(false)
    }
  }, [isAtTop, isFirstRenderAtTop])

  const confirmAction = useCallback(
    ({ setAction }: Parameters<BaodaozaiActionSetter>[0]) => {
      setAction('default')
    },
    []
  )

  const eventConfig = useMemo(() => {
    const config = createBaodaozaiEventConfig({
      content,
      confirmAction,
    })
    return config[id]
  }, [id, content, confirmAction])

  const disabled = (id === 'show-intro' && !isFirstRenderAtTop) || isIdle

  if (!eventConfig) {
    console.warn(
      `No configuration found for baodaozai event trigger with id: ${id}`
    )
    return null
  }

  return (
    <BaodaozaiEventTrigger
      id={id}
      disabled={disabled}
      once={false}
      {...eventConfig}
    />
  )
}

export default AllSiteBaodaozaiEventTrigger
