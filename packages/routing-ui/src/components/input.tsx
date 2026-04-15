'use client'

import { cva } from 'class-variance-authority'
import { forwardRef, useMemo, useRef, useState } from 'react'

import { SearchIconSmall } from '../icons'
import { cn } from '../utils/cn'

// Close icon component
const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="10" cy="10" r="10" fill="currentColor" />
    <path
      d="M7 7l6 6M13 7l-6 6"
      stroke="white"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const inputVariants = cva(
  // Base styles
  'px-4 py-1.5 h-11 relative flex items-center border prose-p1 transition-colors duration-200 hover:border-neutral-600 desktop:bg-neutral-white',
  {
    variants: {
      state: {
        default: 'border-transparent',
        focus: '',
        active: '',
        error: '',
        disabled:
          'bg-neutral-100 hover:border-neutral-400 desktop:bg-neutral-100',
      },
      mode: {
        default: 'rounded-[12px] border-neutral-400 bg-neutral-100',
        search: 'rounded-full border-transparent desktop:border-neutral-400',
      },
    },
    compoundVariants: [
      {
        state: 'error',
        mode: 'default',
        className: 'border-semantic-danger hover:border-semantic-danger',
      },
      {
        state: 'default',
        mode: 'default',
        className: 'border-neutral-400',
      },
      {
        state: 'focus',
        mode: 'default',
        className: 'border-neutral-600',
      },
      {
        state: 'active',
        mode: 'default',
        className: 'border-neutral-600',
      },

      {
        state: 'default',
        mode: 'search',
        className: 'bg-neutral-100 desktop:border-neutral-400',
      },
      {
        state: 'focus',
        mode: 'search',
        className:
          'border-neutral-600 bg-neutral-100 desktop:border-neutral-600 desktop:bg-transparent',
      },
      {
        state: 'active',
        mode: 'search',
        className: 'border-neutral-600 desktop:border-neutral-600',
      },
    ],
    defaultVariants: {
      state: 'default',
      mode: 'default',
    },
  }
)

export type InputProps = {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onClear?: () => void
  children?: React.ReactNode
  inputRef?: React.RefObject<HTMLInputElement>
  error?: boolean
  errorMessage?: string
  mode?: 'default' | 'search'
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'>

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      placeholder = '搜尋更多新聞、議題',
      value,
      onChange,
      onClear,
      className,
      onFocus,
      onBlur,
      inputRef,
      error,
      errorMessage,
      mode = 'default',
      disabled,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState('')
    const [isFocused, setIsFocused] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const innerInputRef = useRef<HTMLInputElement>(null)
    const currentValue = value !== undefined ? value : internalValue
    const hasValue = currentValue.length > 0

    // Determine current state
    const currentState = useMemo(() => {
      if (error) return 'error'
      if (disabled) return 'disabled'
      if (isFocused) return 'focus'
      if (hasValue) return isActive ? 'active' : 'default'
      return 'default'
    }, [error, disabled, isFocused, hasValue, isActive])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (onChange) {
        onChange(newValue)
      } else {
        setInternalValue(newValue)
      }
      setIsActive(true)
    }

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onFocus) {
        onFocus(e)
      }
      setIsFocused(true)
      setIsActive(true)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onBlur) {
        onBlur(e)
      }
      setIsFocused(false)
      setIsActive(false)
    }

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (onChange) {
        onChange('')
      } else {
        setInternalValue('')
      }
      if (onClear) {
        onClear()
      }

      const currentRef = inputRef ?? innerInputRef
      currentRef.current?.focus()
    }

    const inputClasses = cn(
      inputVariants({ state: currentState, mode }),
      className
    )

    const isSearchMode = mode === 'search'

    return (
      <div className="gap-2 flex flex-col">
        <div
          className={inputClasses}
          ref={ref}
          data-input-state={currentState}
          data-input-mode={mode}
        >
          <div className="text-neutral-600">
            {isSearchMode && <SearchIconSmall />}
          </div>
          <input
            type="text"
            value={currentValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              'flex-1 shrink bg-transparent text-neutral-900 placeholder:prose-p1 placeholder:text-neutral-400 focus:outline-none disabled:text-neutral-400',
              isSearchMode && 'ml-2 max-w-[72%]'
            )}
            aria-describedby={
              errorMessage ? `${props.id ?? 'input'}-error` : undefined
            }
            aria-invalid={!!errorMessage}
            ref={inputRef ?? innerInputRef}
            disabled={disabled}
            {...props}
          />
          {errorMessage && (
            <p
              className="-bottom-5 left-0 absolute prose-p3 text-semantic-danger"
              id={`${props.id ?? 'input'}-error`}
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          {isSearchMode && hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1/2 ml-auto shrink-0 cursor-pointer rounded-full text-neutral-400 transition-colors hover:text-neutral-600 active:bg-neutral-200"
              aria-label="Clear input"
            >
              <CloseIcon />
            </button>
          )}
        </div>
      </div>
    )
  }
)

export default Input
