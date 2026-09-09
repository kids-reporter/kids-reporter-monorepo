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
import { useFeatureIntroDialogContext } from '@/services/feature-intro/context'
import type { CallBaodaozaiIntro } from '@/types/api'
import {
  isValidHttpUrl,
  resolveCallBaodaozaiIntro,
} from '@/utils/call-baodaozai-intro'

type EventId = 'show-intro' | 'hide-intro'

type EventConfig = Pick<
  ComponentProps<typeof BaodaozaiEventTrigger>,
  'dialogState' | 'baodaozaiState'
>

type IntroButtonConfig = Pick<
  CallBaodaozaiIntro,
  'content' | 'buttonStatus' | 'buttonText' | 'buttonUrl'
>

type AllSiteBaodaozaiEventTriggerProps = {
  id: EventId
  intro?: Partial<CallBaodaozaiIntro> | null
  isIdle: boolean
}

function createBaodaozaiEventConfig({
  intro,
  confirmAction,
}: {
  confirmAction: (args: Parameters<BaodaozaiActionSetter>[0]) => void
  intro: IntroButtonConfig
}): Record<EventId, EventConfig> {
  const hideConfirmButton = intro.buttonStatus === 'hidden'
  const dialogBase = {
    content: intro.content || '',
    confirmText: intro.buttonText,
    confirmAction,
    cancelText: '跳過',
    cancelAction: ({ setAction }: Parameters<BaodaozaiActionSetter>[0]) => {
      setAction('default')
    },
    hideConfirmButton,
  }

  return {
    'show-intro': {
      dialogState: {
        isOpen: true,
        ...dialogBase,
      },
      baodaozaiState: {
        action: 'dialog-speaker',
        clickBaodaozaiAction: 'dialog-speaker',
      },
    },
    'hide-intro': {
      dialogState: {
        isOpen: false,
        ...dialogBase,
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
  intro,
  isIdle,
}: AllSiteBaodaozaiEventTriggerProps) {
  const isAtTop = useIsAtTop(35)
  const [isFirstRenderAtTop, setIsFirstRenderAtTop] = useState(isAtTop)
  const { openDialog } = useFeatureIntroDialogContext()

  const resolvedIntro = useMemo(() => resolveCallBaodaozaiIntro(intro), [intro])

  useEffect(() => {
    if (!isAtTop && isFirstRenderAtTop) {
      setIsFirstRenderAtTop(false)
    }
  }, [isAtTop, isFirstRenderAtTop])

  const confirmAction = useCallback(
    ({ setAction }: Parameters<BaodaozaiActionSetter>[0]) => {
      setAction('default')
      if (resolvedIntro.buttonStatus === 'showIntro') {
        openDialog()
        return
      }
      if (resolvedIntro.buttonStatus === 'custom') {
        const url = resolvedIntro.buttonUrl.trim()
        if (isValidHttpUrl(url)) {
          window.location.assign(url)
        }
      }
    },
    [openDialog, resolvedIntro]
  )

  const eventConfig = useMemo(() => {
    const config = createBaodaozaiEventConfig({
      intro: resolvedIntro,
      confirmAction,
    })
    return config[id]
  }, [id, resolvedIntro, confirmAction])

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
