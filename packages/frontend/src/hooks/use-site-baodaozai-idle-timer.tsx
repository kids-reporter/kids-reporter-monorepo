'use client'
import { useMemo } from 'react'

import useIdleTimer from '@/hooks/use-idle-timer'
import { useCallBaodaozaiContext } from '@/services/call-baodaozai'

function useAllSiteBaodaozaiIdleTimer() {
  const {
    baodaozaiProps: { setAction, isInitialized, hide },
  } = useCallBaodaozaiContext()

  const idleTimerProps = useMemo(
    () => ({
      idleCallback: () => {
        setAction('idel-sleep')
      },
      interactCallback: () => {
        setAction('dialog-speaker')
      },
      disabled: !isInitialized || hide,
    }),
    [setAction, isInitialized, hide]
  )

  return useIdleTimer(idleTimerProps)
}

export default useAllSiteBaodaozaiIdleTimer
