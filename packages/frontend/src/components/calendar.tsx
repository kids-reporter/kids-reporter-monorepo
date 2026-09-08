'use client'

import { cn } from '@kids-reporter/routing-ui'
import * as React from 'react'
import {
  DayButton,
  DayPicker,
  getDefaultClassNames,
  type Locale,
} from 'react-day-picker'
import { zhTW } from 'react-day-picker/locale'

import { ArrowDown, ArrowLeft, ArrowRight } from '@/icons'

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  locale = zhTW,
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  locale?: Partial<Locale>
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn(
        'group/calendar bg-white p-3 [--cell-size:2.5rem]',
        String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
        className
      )}
      captionLayout={captionLayout}
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString(locale?.code, { month: 'short' }),
        ...formatters,
      }}
      classNames={{
        root: cn('w-full', defaultClassNames.root),
        months: cn(
          'relative flex flex-col gap-4 md:flex-row',
          defaultClassNames.months
        ),
        month: cn('flex w-full flex-col gap-4', defaultClassNames.month),
        nav: cn(
          'absolute inset-x-0 top-0 flex w-full items-center justify-between gap-1',
          defaultClassNames.nav
        ),
        button_previous: cn(
          'flex size-(--cell-size) cursor-pointer items-center justify-center rounded-md text-neutral-700 select-none hover:bg-neutral-100 aria-disabled:opacity-50',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          'flex size-(--cell-size) cursor-pointer items-center justify-center rounded-md text-neutral-700 select-none hover:bg-neutral-100 aria-disabled:opacity-50',
          defaultClassNames.button_next
        ),
        month_caption: cn(
          'flex h-(--cell-size) w-full items-center justify-center px-(--cell-size)',
          defaultClassNames.month_caption
        ),
        dropdowns: cn(
          'flex h-(--cell-size) w-full items-center justify-center gap-1.5 text-sm font-medium',
          defaultClassNames.dropdowns
        ),
        dropdown_root: cn(
          'relative flex h-8 items-center rounded-md border border-neutral-300 shadow-xs focus-within:border-neutral-600 focus-within:ring-[3px] focus-within:ring-neutral-400/30',
          defaultClassNames.dropdown_root
        ),
        dropdown: cn(
          'absolute inset-0 cursor-pointer opacity-0',
          defaultClassNames.dropdown
        ),
        caption_label: cn(
          'font-medium text-neutral-900 select-none',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex h-8 items-center gap-1 rounded-md pr-1 pl-2 text-sm leading-none [&>svg]:size-3.5 [&>svg]:text-neutral-600',
          defaultClassNames.caption_label
        ),
        month_grid: cn('w-full border-collapse', defaultClassNames.month_grid),
        weekdays: cn('flex w-full', defaultClassNames.weekdays),
        weekday: cn(
          'flex flex-1 items-center justify-center rounded-md text-[0.8rem] font-normal text-neutral-600 select-none',
          defaultClassNames.weekday
        ),
        week: cn('mt-2 flex w-full', defaultClassNames.week),
        week_number_header: cn(
          'w-(--cell-size) select-none',
          defaultClassNames.week_number_header
        ),
        week_number: cn(
          'text-[0.8rem] text-neutral-600 select-none',
          defaultClassNames.week_number
        ),
        day: cn(
          'group/day relative flex h-(--cell-size) flex-1 items-center justify-center p-0 text-center select-none [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md',
          defaultClassNames.day
        ),
        range_start: cn(
          'rounded-l-md bg-red-100',
          defaultClassNames.range_start
        ),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-md bg-red-100', defaultClassNames.range_end),
        today: cn(
          'rounded-md bg-neutral-100 text-neutral-900 data-[selected=true]:rounded-none',
          defaultClassNames.today
        ),
        outside: cn(
          'text-neutral-400 aria-selected:text-neutral-400',
          defaultClassNames.outside
        ),
        disabled: cn('text-neutral-400 opacity-50', defaultClassNames.disabled),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Root: ({ className, rootRef, ...props }) => {
          return (
            <div
              data-slot="calendar"
              ref={rootRef}
              className={cn(className)}
              {...props}
            />
          )
        },
        Chevron: ({ className, orientation }) => {
          if (orientation === 'left') {
            return <ArrowLeft className={cn('size-4', className)} />
          }

          if (orientation === 'right') {
            return <ArrowRight className={cn('size-4', className)} />
          }

          return <ArrowDown className={cn('size-3.5', className)} />
        },
        DayButton: ({ ...props }) => (
          <CalendarDayButton locale={locale} {...props} />
        ),
        WeekNumber: ({ children, ...props }) => {
          return (
            <td {...props}>
              <div className="flex size-(--cell-size) items-center justify-center text-center">
                {children}
              </div>
            </td>
          )
        },
        ...components,
      }}
      {...props}
    />
  )
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <button
      ref={ref}
      type="button"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'flex h-full w-full min-w-(--cell-size) cursor-pointer items-center justify-center rounded-md leading-none font-normal',
        'hover:bg-red-100',
        'data-[selected-single=true]:bg-red-400 data-[selected-single=true]:text-white data-[selected-single=true]:hover:bg-red-500',
        'data-[range-start=true]:rounded-md data-[range-start=true]:bg-red-400 data-[range-start=true]:text-white',
        'data-[range-end=true]:rounded-md data-[range-end=true]:bg-red-400 data-[range-end=true]:text-white',
        'data-[range-middle=true]:rounded-none data-[range-middle=true]:bg-red-100 data-[range-middle=true]:text-neutral-900',
        'group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:ring-neutral-400/40',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '[&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
