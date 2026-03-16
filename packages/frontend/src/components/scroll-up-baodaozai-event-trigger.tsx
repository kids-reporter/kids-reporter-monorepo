'use client'

import throttle from 'lodash/throttle'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import { useCallBaodaozaiContext } from '@/services/call-baodaozai'

const SCROLL_UP_THRESHOLD = 100

function ScrollUpBaodaozaiEventTrigger() {
  const { onDialogPropsChange, baodaozaiProps } = useCallBaodaozaiContext()
  const { setAction, isInitialized, action } = baodaozaiProps

  const lastScrollY = useRef(0)
  const scrollUpStartY = useRef(0)
  const isScrollingUp = useRef(false)

  const resetScrollTracking = useCallback(() => {
    isScrollingUp.current = false
    scrollUpStartY.current = lastScrollY.current
  }, [])

  const triggerScrollUpEvent = useCallback(() => {
    onDialogPropsChange({ isOpen: false })
    setAction('default')
    resetScrollTracking()
  }, [onDialogPropsChange, setAction, resetScrollTracking])

  const throttledTriggerScrollUpEvent = useMemo(
    () => throttle(triggerScrollUpEvent, 100),
    [triggerScrollUpEvent]
  )

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY
    const scrollingUp = currentScrollY < lastScrollY.current

    if (scrollingUp) {
      if (!isScrollingUp.current) {
        scrollUpStartY.current = lastScrollY.current
        isScrollingUp.current = true
      }

      const scrollUpDistance = scrollUpStartY.current - currentScrollY
      if (scrollUpDistance >= SCROLL_UP_THRESHOLD) {
        throttledTriggerScrollUpEvent()
      }
    }

    if (!scrollingUp) {
      resetScrollTracking()
    }

    lastScrollY.current = currentScrollY
  }, [throttledTriggerScrollUpEvent, resetScrollTracking])

  useEffect(() => {
    if (!isInitialized) return

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [handleScroll, isInitialized, action])

  return null
}

export default ScrollUpBaodaozaiEventTrigger
