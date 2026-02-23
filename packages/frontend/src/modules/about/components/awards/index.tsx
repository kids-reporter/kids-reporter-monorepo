'use client'

import { cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import { useMemo, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/select'

import AwardCard from './award-card'
import { AWARDS_BY_YEAR } from './constants'

function Awards() {
  const [selectedYear, setSelectedYear] = useState(AWARDS_BY_YEAR[0].year)

  const currentCards = useMemo(
    () => AWARDS_BY_YEAR.find((y) => y.year === selectedYear)?.cards ?? [],
    [selectedYear]
  )

  return (
    <section
      id="awards"
      className="mx-auto flex w-full max-w-300 scroll-margin-anchor flex-col px-6 pt-10 pb-14 tablet:px-17 tablet:pt-12 tablet:pb-16 desktop:px-24 desktop:pt-18 desktop:pb-24 hd:px-26 hd:pt-24 hd:pb-30"
    >
      <h2 className="mb-6 flex items-center gap-2 self-start prose-h2-small !font-swei text-neutral-900 tablet:mx-auto tablet:mb-8 desktop:mb-10 desktop:prose-h2-large">
        <Image
          src="/assets/images/about/awards/icon.svg"
          alt="外界肯定"
          className="size-11 desktop:size-16"
          width={64}
          height={64}
        />
        外界肯定
      </h2>

      <div className="flex flex-col gap-6 tablet:hidden">
        <Select
          value={selectedYear}
          onValueChange={(value) => setSelectedYear(value)}
        >
          <SelectTrigger className="w-full min-w-0">
            <SelectValue placeholder="選擇年份" />
          </SelectTrigger>
          <SelectContent>
            {AWARDS_BY_YEAR.map(({ year }) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex flex-col gap-6">
          {currentCards.map((card) => (
            <AwardCard key={card.id} card={card} />
          ))}
        </div>
      </div>

      <div className="hidden tablet:flex tablet:gap-8 desktop:gap-10">
        <nav
          className="mt-3 flex shrink-0 flex-col gap-4"
          aria-label="選擇年份"
        >
          {AWARDS_BY_YEAR.map(({ year }) => (
            <button
              key={year}
              type="button"
              onClick={() => setSelectedYear(year)}
              className={cn(
                'w-27 cursor-pointer text-left prose-h5-small font-bold transition-colors hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-neutral-500 focus-visible:ring-offset-2 desktop:w-35 desktop:prose-h5-large hd:w-44',
                selectedYear === year ? 'text-neutral-900' : 'text-neutral-500'
              )}
              aria-current={selectedYear === year ? 'true' : undefined}
            >
              {year}
            </button>
          ))}
        </nav>
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {currentCards.map((card) => (
            <AwardCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Awards
