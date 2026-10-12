'use client'

import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import React from 'react'

import { cn } from '../utils/cn'

const buttonVariants = cva(
  // Base styles
  'font-noto gap-1 font-bold inline-flex cursor-pointer items-center justify-center rounded-full transition-colors duration-200',
  {
    variants: {
      variant: {
        primary: [
          'text-white border-0 bg-red-400',
          'hover:bg-red-500',
          'active:bg-red-600',
          'disabled:text-white disabled:cursor-default disabled:bg-neutral-400',
        ],
        secondary: [
          'bg-white text-gray-900 border-2 border-red-400',
          'hover:text-white hover:border-red-500 hover:bg-red-500',
          'active:text-white active:border-red-600 active:bg-red-600',
          'disabled:bg-white disabled:cursor-default disabled:border-neutral-400 disabled:text-neutral-400',
        ],
        neutral: [
          'bg-white border-2 border-neutral-400 text-neutral-900',
          'hover:text-white hover:border-neutral-500 hover:bg-neutral-500',
          'active:text-white active:border-neutral-600 active:bg-neutral-600',
          'disabled:bg-white disabled:cursor-default disabled:border-neutral-400 disabled:text-neutral-400',
        ],
      },
      size: {
        44: 'h-11 px-5 py-2 text-base', // 44px height, 16px font size
        36: 'h-9 px-4 py-2 text-sm', // 36px height, 14px font size
        32: 'h-8 px-3 py-1 text-sm', // 32px height, 14px font size
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 44,
    },
  }
)

// Loading spinner icon component
const LoadingSpinner = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 25 24"
    fill="none"
    className="animate-spin"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      opacity="0.5"
      d="M12.5 2C10.5222 2 8.58879 2.58649 6.9443 3.6853C5.29981 4.78412 4.01809 6.3459 3.26121 8.17317C2.50433 10.0004 2.3063 12.0111 2.69215 13.9509C3.078 15.8907 4.03041 17.6725 5.42894 19.0711C6.82746 20.4696 8.60929 21.422 10.5491 21.8079C12.4889 22.1937 14.4996 21.9957 16.3268 21.2388C18.1541 20.4819 19.7159 19.2002 20.8147 17.5557C21.9135 15.9112 22.5 13.9778 22.5 12C22.5 10.6868 22.2413 9.38642 21.7388 8.17317C21.2363 6.95991 20.4997 5.85752 19.5711 4.92893C18.6425 4.00035 17.5401 3.26375 16.3268 2.7612C15.1136 2.25866 13.8132 2 12.5 2ZM12.5 20C10.9178 20 9.37104 19.5308 8.05544 18.6518C6.73985 17.7727 5.71447 16.5233 5.10897 15.0615C4.50347 13.5997 4.34504 11.9911 4.65372 10.4393C4.9624 8.88743 5.72433 7.46197 6.84315 6.34315C7.96197 5.22433 9.38743 4.4624 10.9393 4.15372C12.4911 3.84504 14.0997 4.00346 15.5615 4.60896C17.0233 5.21447 18.2727 6.23984 19.1518 7.55544C20.0308 8.87103 20.5 10.4177 20.5 12C20.5 14.1217 19.6572 16.1566 18.1569 17.6569C16.6566 19.1571 14.6217 20 12.5 20Z"
      fill="currentColor"
    />
    <path
      d="M20.5 12H22.5C22.5 10.6868 22.2413 9.38642 21.7388 8.17317C21.2362 6.95991 20.4997 5.85752 19.5711 4.92893C18.6425 4.00035 17.5401 3.26375 16.3268 2.7612C15.1136 2.25866 13.8132 2 12.5 2V4C14.6217 4 16.6566 4.84285 18.1569 6.34315C19.6571 7.84344 20.5 9.87827 20.5 12Z"
      fill="currentColor"
    />
  </svg>
)

export type ButtonProps = {
  isLoading?: boolean
  disabled?: boolean
  asChild?: boolean
  children: React.ReactNode
} & VariantProps<typeof buttonVariants> &
  React.ButtonHTMLAttributes<HTMLButtonElement>

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      isLoading = false,
      disabled = false,
      asChild = false,
      size,
      variant,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    const buttonClasses = cn(buttonVariants({ variant, size }), className)

    const Comp = asChild ? Slot : 'button'

    return (
      <Comp
        ref={ref}
        className={buttonClasses}
        disabled={isDisabled}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size === 32 ? 16 : size === 36 ? 18 : 20} />
        ) : (
          children
        )}
      </Comp>
    )
  }
)

export default Button
