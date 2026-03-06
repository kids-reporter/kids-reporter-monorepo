'use client'
import { useEffect, useMemo, useRef } from 'react'

import useIdleTimer from '@/hooks/use-idle-timer'
import { useCallBaodaozaiContext } from '@/services/call-baodaozai'
import { DEFAULT_ANIMATION_DELAY } from '@/services/call-baodaozai/context/constants'

function useArticleBaodaozaiIdleTimer() {
  const {
    baodaozaiProps: { setAction, setIsIdelReadStoned, isInitialized, hide },
  } = useCallBaodaozaiContext()

  const stoneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (stoneTimerRef.current) {
        clearTimeout(stoneTimerRef.current)
        stoneTimerRef.current = null
      }
    }
  }, [])

  const idleTimerProps = useMemo(() => {
    const cleanTimer = () => {
      if (stoneTimerRef.current) {
        clearTimeout(stoneTimerRef.current)
        stoneTimerRef.current = null
      }
    }
    const idleCallback = () => {
      setAction('idel-read')
      cleanTimer()
      stoneTimerRef.current = setTimeout(() => {
        setIsIdelReadStoned(true)
      }, DEFAULT_ANIMATION_DELAY)
    }
    const interactCallback = () => {
      cleanTimer()
      setIsIdelReadStoned(false)
    }
    return { idleCallback, interactCallback, disabled: !isInitialized || hide }
  }, [setAction, setIsIdelReadStoned, isInitialized, hide])

  return useIdleTimer(idleTimerProps)
}

export default useArticleBaodaozaiIdleTimer
