'use client'

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCallBaodaozaiContext } from '../context'
import { BaodaozaiAction, BaodaozaiActionSetter } from '../types'
import { DialogBoxProps } from './dialog-box'

export type BaodaozaiEventTriggerProps = {
  dialogState?: Partial<
    Omit<DialogBoxProps, 'onConfirm' | 'onCancel'> & {
      confirmAction: BaodaozaiActionSetter
      cancelAction: BaodaozaiActionSetter
    }
  >
  baodaozaiState?: Partial<{
    action: BaodaozaiAction
    isEntered: boolean
    clickBaodaozaiAction: BaodaozaiAction
  }>
  once?: boolean
  disabled?: boolean
  id?: string
  suppressAfterAction?: boolean
}

function BaodaozaiEventTrigger({
  dialogState: newDialogState = {},
  baodaozaiState: newBaodaozaiState = {},
  once = true,
  disabled = false,
  suppressAfterAction = true,
  id,
}: BaodaozaiEventTriggerProps) {
  const {
    onDialogPropsChange,
    baodaozaiProps: {
      setAction,
      isInitialized,
      setActionEntered,
      setClickBaodaozaiAction,
    },
  } = useCallBaodaozaiContext()
  const { action, isEntered, clickBaodaozaiAction } = newBaodaozaiState
  const containerRef = useRef<HTMLDivElement>(null)
  const triggeredOnceRef = useRef(false)

  const shouldSuppress = useRef(false)

  const newDialogStateWithSuppress = useMemo(() => {
    const { confirmAction, cancelAction, ...rest } = newDialogState
    return {
      ...rest,
      confirmAction: (args: Parameters<BaodaozaiActionSetter>[0]) => {
        if (suppressAfterAction) {
          shouldSuppress.current = true
        }
        confirmAction?.(args)
      },
      cancelAction: (args: Parameters<BaodaozaiActionSetter>[0]) => {
        if (suppressAfterAction) {
          shouldSuppress.current = true
        }
        cancelAction?.(args)
      },
    }
  }, [newDialogState, suppressAfterAction])

  const handleInView = useCallback(() => {
    onDialogPropsChange({ ...newDialogStateWithSuppress })
    if (typeof action === 'string') {
      if (typeof isEntered === 'boolean') {
        setActionEntered(action, isEntered)
      } else {
        setAction(action)
      }
    }

    if (typeof clickBaodaozaiAction === 'string') {
      setClickBaodaozaiAction(clickBaodaozaiAction)
    }
  }, [
    onDialogPropsChange,
    newDialogStateWithSuppress,
    action,
    clickBaodaozaiAction,
    isEntered,
    setActionEntered,
    setAction,
    setClickBaodaozaiAction,
  ])

  const [prevDisabled, setPrevDisabled] = useState(disabled)

  useEffect(() => {
    if (prevDisabled !== disabled) {
      triggeredOnceRef.current = false
      setPrevDisabled(disabled)
    }
  }, [disabled, prevDisabled])

  useEffect(() => {
    const element = containerRef.current

    if (
      !element ||
      disabled ||
      triggeredOnceRef.current ||
      shouldSuppress.current ||
      !isInitialized
    )
      return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            handleInView()
            if (once) {
              observer.disconnect()
              triggeredOnceRef.current = true
            }
          }
        })
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: '0px 0px -10% 0px', // Trigger when element is 10% from bottom of viewport
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [handleInView, once, disabled, isInitialized])

  return isInitialized ? <div ref={containerRef} id={id} /> : null
}

export default memo(BaodaozaiEventTrigger)
