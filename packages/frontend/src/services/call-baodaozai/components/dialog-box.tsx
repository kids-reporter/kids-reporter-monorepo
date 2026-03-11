'use client'

import { Button, cn } from '@kids-reporter/routing-ui'
import { ReactNode } from 'react'

const DialogArrow = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="62"
    height="64"
    viewBox="0 0 62 64"
    fill="none"
  >
    <defs>
      <filter id="shadowBox">
        {/* Left shadow */}
        <feDropShadow dx="-3" dy="0" stdDeviation="2" floodOpacity="0.025" />

        {/* Bottom shadow - layered for depth */}
        <feDropShadow dx="0" dy="3" stdDeviation="2" floodOpacity="0.02" />
        <feDropShadow dx="0" dy="6" stdDeviation="4" floodOpacity="0.015" />
        <feDropShadow dx="0" dy="10" stdDeviation="6" floodOpacity="0.01" />

        {/* Right shadow - layered for depth */}
        <feDropShadow dx="3" dy="0" stdDeviation="2" floodOpacity="0.002" />
        <feDropShadow dx="6" dy="0" stdDeviation="4" floodOpacity="0.0015" />
        <feDropShadow dx="10" dy="0" stdDeviation="6" floodOpacity="0.001" />
      </filter>
    </defs>
    <path
      data-figma-bg-blur-radius="16"
      d="M0 2.72773e-05L32 44L32 -1.39876e-06L0 2.72773e-05Z"
      fill="white"
      filter="url(#shadowBox)"
    />
  </svg>
)

export type DialogBoxProps = {
  content: ReactNode
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  confirmText: string
  cancelText: string
  hideCancelButton?: boolean
}

function DialogBox({
  content,
  isOpen,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  hideCancelButton = false,
}: DialogBoxProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center transition-opacity duration-1000',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      )}
    >
      <div
        className={cn(
          'relative z-10 flex w-full flex-col items-center justify-center tablet:w-75',
          'transform transition-all duration-300 ease-out',
          isOpen
            ? 'translate-y-0 scale-100 opacity-100'
            : 'translate-y-4 scale-95 opacity-0'
        )}
      >
        <div className="w-full rounded-t-[30px] rounded-b-none bg-neutral-white p-6 shadow-baodaozai-card tablet:rounded-b-[30px]">
          <p className="prose-p1-bold text-neutral-900">{content}</p>
          <div className="mt-5 flex items-center justify-center gap-4">
            {!hideCancelButton && (
              <Button
                variant="secondary"
                className="flex-1"
                size={36}
                onClick={onCancel}
              >
                {cancelText}
              </Button>
            )}
            <Button
              variant="primary"
              className="flex-1"
              size={36}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
        <div className="hidden translate-x-10 translate-y-0 transition-all duration-300 ease-out tablet:block">
          <DialogArrow />
        </div>
      </div>
    </div>
  )
}

export default DialogBox
