'use client'
import { cn, useMediaQuery } from '@kids-reporter/routing-ui'
import { useCallback, useEffect, useRef, useState } from 'react'

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
    setAction,
    setIsActionEntered,
    hide,
    setHide,
    clickBaodaozaiAction,
    setClickBaodaozaiAction,
  } = baodaozaiProps

  const handleConfirm = useCallback(() => {
    confirmAction({
      setHide,
      setIsActionEntered,
      setAction,
      setClickBaodaozaiAction,
    })
    onDialogPropsChange({ isOpen: false })
  }, [
    confirmAction,
    setHide,
    setIsActionEntered,
    setAction,
    setClickBaodaozaiAction,
    onDialogPropsChange,
  ])

  const handleCancel = useCallback(() => {
    cancelAction({
      setHide,
      setIsActionEntered,
      setAction,
      setClickBaodaozaiAction,
    })
    onDialogPropsChange({ isOpen: false })
  }, [
    cancelAction,
    setHide,
    setIsActionEntered,
    setAction,
    onDialogPropsChange,
    setClickBaodaozaiAction,
  ])

  const handleOpenDialog = useCallback(() => {
    onDialogPropsChange({ isOpen: true })
    if (clickBaodaozaiAction) {
      setAction(clickBaodaozaiAction)
      return
    }
    setIsActionEntered(true)
  }, [onDialogPropsChange, setAction, setIsActionEntered, clickBaodaozaiAction])

  const refDialogBoxContainerRef = useRef<HTMLDivElement>(null)
  const [dialogBoxHeight, setDialogBoxHeight] = useState(0)

  const isMobile = useMediaQuery('(max-width: 767px)')
  const isTablet = useMediaQuery('(max-width: 1023px)')

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

  const [baodaozaiBottom, setBaodaozaiBottom] = useState('12px')
  useEffect(() => {
    let bottomValue
    if (isMobile) {
      bottomValue = dialogProps.isOpen
        ? `calc(${dialogBoxHeight}px - 52px)`
        : '-22px'
    } else {
      if (dialogProps.isOpen) {
        bottomValue = '-24px'
      } else if (isTablet) {
        bottomValue = '-16px'
      } else {
        bottomValue = '-12px'
      }
    }
    setBaodaozaiBottom(bottomValue)
  }, [isMobile, dialogProps.isOpen, dialogBoxHeight, isTablet])

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
          'absolute -right-50 z-12 transition-all duration-1000 tablet:-right-48',
          !dialogProps.isOpen && 'cursor-pointer',
          dialogProps.isOpen && '-right-42 z-10'
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
