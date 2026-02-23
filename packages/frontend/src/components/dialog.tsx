'use client'

import { cn } from '@kids-reporter/routing-ui'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import * as React from 'react'

import { XIcon } from '@/icons/miscellaneous'

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-modal bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
        className
      )}
      {...props}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'bg-background fixed z-modal flex flex-col gap-4 duration-200',
          // Mobile: full screen with 16px from top, extends to bottom for safe area insets
          'top-4 right-0 bottom-0 left-0 w-screen',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-bottom',
          // Tablet: w-[calc(100vw-64px)] h-[calc(100vh-112px)] (32px padding each side, 56px padding top/bottom)
          'right-auto rounded-t-[30px] tablet:top-[50%] tablet:bottom-auto tablet:left-[50%] tablet:h-[calc(100vh-112px)] tablet:w-[calc(100vw-64px)] tablet:translate-x-[-50%] tablet:translate-y-[-50%] tablet:rounded-[30px] tablet:data-[state=closed]:zoom-out-95 tablet:data-[state=open]:zoom-in-95',
          // Desktop: w-[calc(100vw-96px)] h-[calc(100vh-112px)] (48px padding each side, 56px padding top/bottom)
          'tablet:h-[calc(100vh-112px)] desktop:w-[calc(100vw-96px)]',
          // HD: max width 1200px, h-[calc(100vh-112px)] (56px padding top/bottom)
          'tablet:h-[calc(100vh-112px)] hd:max-w-[1200px]',
          // Remove all focus/active borders inside dialog
          '[&_*]:focus:!ring-0 [&_*]:focus:!outline-none [&_*]:focus-visible:!ring-0 [&_*]:focus-visible:!outline-none [&_*]:active:!ring-0 [&_*]:active:!outline-none',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-6 right-6 flex size-8 cursor-pointer items-center justify-center rounded-xs opacity-70 transition-opacity hover:opacity-100 disabled:pointer-events-none desktop:top-12 desktop:right-12 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 tablet:flex-row tablet:justify-end',
        className
      )}
      {...props}
    />
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-lg leading-tight font-semibold', className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm leading-relaxed', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
