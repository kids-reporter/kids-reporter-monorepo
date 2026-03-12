'use client'
import { useMemo } from 'react'

import useIdleTimer from '@/hooks/use-idle-timer'
import { useCallBaodaozaiContext } from '@/services/call-baodaozai'

function useAllSiteBaodaozaiIdleTimer() {
  const {
    baodaozaiProps: { setAction, isInitialized, hide, setIsActionEntered },
    dialogWithActionProps: { isOpen },
  } = useCallBaodaozaiContext()

  const idleTimerProps = useMemo(
    () => ({
      idleCallback: () => {
        setAction('idle-sleep')
      },
      interactCallback: () => {
        setIsActionEntered(false)
      },
      disabled: !isInitialized || hide || isOpen,
    }),
    [isInitialized, hide, isOpen, setAction, setIsActionEntered]
  )

  return useIdleTimer(idleTimerProps)
}

export default useAllSiteBaodaozaiIdleTimer
