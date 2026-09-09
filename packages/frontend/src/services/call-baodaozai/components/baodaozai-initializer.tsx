'use client'

import { useEffect, useRef } from 'react'

import { useFeatureIntroDialogContext } from '@/services/feature-intro/context'
import type { CallBaodaozaiIntro } from '@/types/api'
import {
  isValidHttpUrl,
  resolveCallBaodaozaiIntro,
} from '@/utils/call-baodaozai-intro'

import { useCallBaodaozaiContext } from '../context'
import { BaodaozaiActionSetter } from '../types'

type BaodaozaiInitializerProps = {
  intro?: Partial<CallBaodaozaiIntro> | null
}

function BaodaozaiInitializer({ intro }: BaodaozaiInitializerProps) {
  const {
    onDialogPropsChange,
    baodaozaiProps: { setClickBaodaozaiAction },
  } = useCallBaodaozaiContext()
  const { openDialog } = useFeatureIntroDialogContext()
  const didInit = useRef(false)

  useEffect(() => {
    if (didInit.current) return
    didInit.current = true

    const resolved = resolveCallBaodaozaiIntro(intro)

    const confirmAction = ({
      setAction,
    }: Parameters<BaodaozaiActionSetter>[0]) => {
      setAction('default')
      if (resolved.buttonStatus === 'showIntro') {
        openDialog()
        return
      }
      if (resolved.buttonStatus === 'custom') {
        const url = resolved.buttonUrl.trim()
        if (isValidHttpUrl(url)) {
          window.location.assign(url)
        }
      }
    }

    onDialogPropsChange({
      content: resolved.content || '',
      confirmText: resolved.buttonText,
      cancelText: '跳過',
      hideConfirmButton: resolved.buttonStatus === 'hidden',
      confirmAction,
      cancelAction: ({ setAction }) => {
        setAction('default')
      },
    })
    setClickBaodaozaiAction('dialog-speaker')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return null
}

export default BaodaozaiInitializer
