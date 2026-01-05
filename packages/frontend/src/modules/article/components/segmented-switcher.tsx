'use client'

import { cn } from '@kids-reporter/routing-ui'

import { KidsReporterIcon, ReporterIcon } from '@/icons/miscellaneous'

type SegmentedSwitcherProps = {
  onSegmentChange: (segment: 'kids' | 'reporter') => void
  selectedSegment: 'kids' | 'reporter'
}

function SegmentedSwitcher({
  onSegmentChange,
  selectedSegment = 'kids',
}: SegmentedSwitcherProps) {
  return (
    <div className="flex w-full items-center gap-1 rounded-[40px] bg-neutral-200 p-1 tablet:w-auto">
      <button
        onClick={() => onSegmentChange('kids')}
        className={cn(
          'flex min-w-40 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[20px] px-4 py-[5px] transition-all duration-200',
          selectedSegment === 'kids' && 'bg-neutral-white shadow-sm',
          selectedSegment !== 'kids' && 'bg-transparent hover:bg-neutral-300'
        )}
      >
        <KidsReporterIcon />
        <span className="prose-p2-bold text-nowrap">少年報導者</span>
      </button>
      <button
        onClick={() => onSegmentChange('reporter')}
        className={cn(
          'flex min-w-40 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[20px] px-4 py-[5px] transition-all duration-200',
          selectedSegment === 'reporter' && 'bg-neutral-white shadow-sm',
          selectedSegment !== 'reporter' &&
            'bg-transparent hover:bg-neutral-300'
        )}
      >
        <ReporterIcon />
        <span className="prose-p2-bold text-nowrap">報導者</span>
      </button>
    </div>
  )
}

export default SegmentedSwitcher
