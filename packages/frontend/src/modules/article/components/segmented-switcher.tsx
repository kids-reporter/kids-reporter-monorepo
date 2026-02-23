'use client'

import { cn } from '@kids-reporter/routing-ui'

type SegmentedSwitcherItem<TValue extends string> = {
  icon?: React.ReactNode
  label: string
  value: TValue
  className?: string
}

type SegmentedSwitcherProps<TValue extends string> = {
  onSegmentChange: (segment: TValue) => void
  selectedSegment: TValue
  items: SegmentedSwitcherItem<TValue>[]
}

function SegmentedSwitcher<TValue extends string>({
  onSegmentChange,
  selectedSegment,
  items,
}: SegmentedSwitcherProps<TValue>) {
  return (
    <div className="flex w-full items-center gap-1 rounded-[40px] bg-neutral-200 p-1 tablet:w-auto">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onSegmentChange(item.value)}
          className={cn(
            'flex min-w-40 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[20px] px-4 py-[5px] prose-p2-bold transition-all duration-200',
            selectedSegment === item.value && 'bg-neutral-white shadow-sm',
            selectedSegment !== item.value &&
              'bg-transparent hover:bg-neutral-300',
            item.className
          )}
          type="button"
        >
          {item.icon ?? null}
          <span className="text-nowrap">{item.label}</span>
        </button>
      ))}
    </div>
  )
}

export default SegmentedSwitcher
