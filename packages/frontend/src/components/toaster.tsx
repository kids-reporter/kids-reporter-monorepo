'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

/**
 * Clears article mobile/tablet toolbar (bottom-6/8 + h-14) + 16px.
 * Lift is relative to the toaster (mobile offset 16 / desktop 24).
 */
export const aboveToolbarToastOptions = {
  className: 'bottom-20! tablet:bottom-20! desktop:bottom-0!',
} as const

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group flex justify-center! [--mobile-offset-left:0px]! [--mobile-offset-right:0px]!"
      style={
        {
          '--normal-bg': 'var(--color-neutral-900)',
          '--normal-text': 'var(--color-neutral-white)',
          '--border-radius': '8px',
          '--width': 'fit-content',
        } as React.CSSProperties
      }
      icons={{
        success: null,
      }}
      position="bottom-center"
      toastOptions={{
        className:
          'px-4! prose-p2! text-nowrap py-2! w-fit! mx-auto! max-w-[300px]! desktop:max-w-[440px]! [&>div]:overflow-hidden! [&>div>div]:truncate!',
      }}
      {...props}
    />
  )
}

export { Toaster }
