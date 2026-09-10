'use client'

import { cn } from '@kids-reporter/routing-ui'
import * as React from 'react'

import { Calendar } from '@/components/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover'

type DatePickerProps = {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  error?: boolean
  id?: string
  className?: string
}

const parseLocalDate = (value?: string): Date | undefined => {
  if (!value) return undefined
  const normalized = value.replaceAll('/', '-')
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized)
  if (!match) return undefined
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  if (
    isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined
  }
  return date
}

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatDisplayDate = (value?: string) => {
  if (!value) return ''
  return value.replaceAll('-', '/')
}

function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder = '請選擇日期',
  error,
  id,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [timeZone, setTimeZone] = React.useState<string>()

  const selectedDate = React.useMemo(() => parseLocalDate(value), [value])

  const today = React.useMemo(() => new Date(), [])
  const startMonth = React.useMemo(
    () => new Date(today.getFullYear() - 100, 0, 1),
    [today]
  )
  const endMonth = React.useMemo(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
    [today]
  )

  React.useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const displayValue = formatDisplayDate(value)

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (!nextOpen) onBlur?.()
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          data-empty={!displayValue}
          aria-invalid={error || undefined}
          className={cn(
            'flex h-11 w-full items-center rounded-xl border border-neutral-400 bg-white px-4 py-1.5 text-left prose-p1 leading-none transition-colors',
            'hover:border-neutral-600',
            'data-[empty=true]:text-neutral-600',
            'focus-visible:border-neutral-600 focus-visible:outline-none',
            error && 'border-semantic-danger hover:border-semantic-danger',
            className
          )}
        >
          <span className="flex h-full items-center">
            {displayValue || placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) max-w-[375px] overflow-hidden rounded-[20px] p-0"
        align="start"
      >
        <Calendar
          mode="single"
          captionLayout="dropdown"
          className="w-full"
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) {
              onChange('')
              return
            }
            onChange(formatLocalDate(date))
            setOpen(false)
            onBlur?.()
          }}
          defaultMonth={selectedDate ?? endMonth}
          startMonth={startMonth}
          endMonth={endMonth}
          disabled={{ after: today }}
          timeZone={timeZone}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
