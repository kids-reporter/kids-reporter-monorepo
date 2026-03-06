'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export type UseIdleTimerOptions = {
  /** Callback executed when user has been idle for the timeout duration */
  idleCallback: () => void
  /** Callback executed when user starts interacting again after idle timeout */
  interactCallback: () => void
  /** When true, the timer is disabled and no callbacks will run */
  disabled?: boolean
  /** Idle timeout in milliseconds (default: 30000) */
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 30000

/** Throttle activity handling so we don't reset the timer on every mousemove/scroll tick */
const ACTIVITY_THROTTLE_MS = 200

const ACTIVITY_EVENTS = [
  'mousedown',
  'mousemove',
  'keydown',
  'touchstart',
  'scroll',
  'wheel',
] as const

function useIdleTimer({
  idleCallback,
  interactCallback,
  disabled = false,
  timeoutMs = DEFAULT_TIMEOUT_MS,
}: UseIdleTimerOptions) {
  const [isIdle, setIsIdle] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isIdleRef = useRef(false)
  const lastActivityHandledAtRef = useRef(0)
  const idleCallbackRef = useRef(idleCallback)
  const interactCallbackRef = useRef(interactCallback)

  idleCallbackRef.current = idleCallback
  interactCallbackRef.current = interactCallback

  const scheduleIdleTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (disabled) return

    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null
      isIdleRef.current = true
      setIsIdle(true)
      idleCallbackRef.current()
    }, timeoutMs)
  }, [disabled, timeoutMs])

  const handleActivity = useCallback(() => {
    const wasIdle = isIdleRef.current
    const now = Date.now()
    const shouldResetTimer =
      wasIdle || now - lastActivityHandledAtRef.current >= ACTIVITY_THROTTLE_MS

    if (shouldResetTimer) {
      lastActivityHandledAtRef.current = now
      isIdleRef.current = false
      scheduleIdleTimer()

      if (wasIdle) {
        interactCallbackRef.current()
        setIsIdle(false)
      }
    }
  }, [scheduleIdleTimer])

  const handleActivityCallback = useCallback(() => {
    const opts = { passive: true }
    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, opts)
    })
  }, [handleActivity])

  useEffect(() => {
    if (disabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      isIdleRef.current = false
      setIsIdle(false)
      return
    }

    scheduleIdleTimer()

    handleActivityCallback()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity)
      })
    }
  }, [disabled, scheduleIdleTimer, handleActivityCallback, handleActivity])

  return { isIdle }
}

export default useIdleTimer
