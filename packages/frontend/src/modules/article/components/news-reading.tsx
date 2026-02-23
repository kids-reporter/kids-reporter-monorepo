'use client'

import { GetPostQuery } from '__generated__/operations/content.generated'
import { cn } from '@kids-reporter/routing-ui'
import { memo, useMemo, useState } from 'react'

import Divider from '@/components/divider'
import { RecursiveNonNullable } from '@/types/utils'

type NewsReadingProps = {
  className?: string
  items: RecursiveNonNullable<GetPostQuery['post']>['newsReadingGroup']['items']
}

function NewsReading({ className, items }: NewsReadingProps) {
  const options = useMemo(
    () =>
      items.map((item) => {
        return {
          name: item.name,
          value: item.name,
          code: item.embedCode,
        }
      }),
    [items]
  )

  const [selectedOption, setSelectedOption] = useState(options[0])

  const renderButtons = useMemo(
    () =>
      options.map((option) => {
        const isActive = option.value === selectedOption.value
        return (
          <button
            key={option.name}
            onClick={() => setSelectedOption(option)}
            className={cn(
              'w-[75px] cursor-pointer rounded-[30px] border-[2.5px] border-solid text-center prose-p2 transition-colors',
              isActive
                ? 'border-blue-400 bg-blue-400 text-neutral-white hover:border-blue-500 hover:bg-blue-500 hover:text-neutral-white'
                : 'border-blue-400 text-neutral-900 hover:border-blue-500 hover:bg-blue-500 hover:text-neutral-white'
            )}
          >
            {option.name}
          </button>
        )
      }),
    [options, selectedOption]
  )

  if (items.length === 0) {
    return null
  }

  return (
    <div className="w-full px-4">
      <div
        className={cn(
          'mx-auto mt-10 flex max-w-[512px] flex-col rounded-[20px] border border-neutral-200 p-6 tablet:mt-20 tablet:max-w-[584px] tablet:p-9 hd:max-w-[656px]',
          className
        )}
      >
        <div className="flex flex-col items-center">
          <div className="mx-auto flex w-full flex-wrap justify-center gap-2.5">
            {renderButtons}
          </div>
        </div>

        <Divider className="my-6 tablet:my-9" />
        <div
          dangerouslySetInnerHTML={{
            __html: selectedOption.code,
          }}
        />
      </div>
    </div>
  )
}

export default memo(NewsReading)
