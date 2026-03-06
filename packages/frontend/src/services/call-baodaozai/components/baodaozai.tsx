'use client'
import { cn, useMediaQuery } from '@kids-reporter/routing-ui'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCallBaodaozaiContext } from '../context'
import DialogBox from './dialog-box'

function Baodaozai() {
  const {
    dialogWithActionProps,
    baodaozaiProps,
    renderBaodaozai,
    onDialogPropsChange,
  } = useCallBaodaozaiContext()

  const { confirmAction, cancelAction, ...dialogProps } = dialogWithActionProps
  const {
    action,
    setAction,
    setActionEntered,
    setIsIdelReadStoned,
    hide,
    setHide,
    clickBaodaozaiAction,
  } = baodaozaiProps

  const handleConfirm = useCallback(() => {
    confirmAction({ setHide, setActionEntered, setIsIdelReadStoned, setAction })
    onDialogPropsChange({ isOpen: false })
  }, [
    confirmAction,
    setHide,
    setActionEntered,
    setIsIdelReadStoned,
    setAction,
    onDialogPropsChange,
  ])

  const handleCancel = useCallback(() => {
    cancelAction({ setHide, setActionEntered, setIsIdelReadStoned, setAction })
    onDialogPropsChange({ isOpen: false })
  }, [
    cancelAction,
    setHide,
    setActionEntered,
    setIsIdelReadStoned,
    setAction,
    onDialogPropsChange,
  ])

  const handleOpenDialog = useCallback(() => {
    onDialogPropsChange({ isOpen: true })
    if (clickBaodaozaiAction) {
      setAction(clickBaodaozaiAction)
      return
    }
    setActionEntered(action, true)
  }, [
    onDialogPropsChange,
    setAction,
    setActionEntered,
    action,
    clickBaodaozaiAction,
  ])

  const refDialogBoxContainerRef = useRef<HTMLDivElement>(null)
  const [dialogBoxHeight, setDialogBoxHeight] = useState(0)

  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(max-width: 1024px)')

  useEffect(() => {
    const container = refDialogBoxContainerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect
        setDialogBoxHeight(height)
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  const baodaozaiBottom = useMemo(() => {
    if (isMobile && dialogProps.isOpen) {
      return `calc(${dialogBoxHeight}px - 30px)`
    }
    return isTablet ? '24px' : '32px'
  }, [isMobile, dialogProps.isOpen, isTablet, dialogBoxHeight])

  return (
    <div
      className={cn(
        'fixed right-0 bottom-0 z-bar w-full tablet:right-0 tablet:bottom-0',
        hide ? 'opacity-0' : 'opacity-100 transition-opacity duration-1000'
      )}
    >
      <div
        className={cn(
          'absolute -right-0 -bottom-0 z-[11] w-full tablet:right-6 tablet:bottom-21 tablet:z-1 tablet:w-auto tablet:translate-x-0 desktop:right-8',
          dialogProps.isOpen ? 'pointer-events-auto' : 'pointer-events-none'
        )}
      >
        <div ref={refDialogBoxContainerRef}>
          <DialogBox
            {...dialogProps}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        </div>
      </div>
      <button
        className={cn(
          'absolute right-2 z-12 transition-all duration-1000 tablet:right-8',
          !dialogProps.isOpen && 'cursor-pointer',
          dialogProps.isOpen && 'right-9 z-10'
        )}
        onClick={dialogProps.isOpen ? undefined : handleOpenDialog}
        style={{
          bottom: baodaozaiBottom,
        }}
      >
        {renderBaodaozai}
      </button>
    </div>
  )
}

export default Baodaozai
