'use client'

import { GetPostQuery } from '__generated__/operations/post.generated'
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
              'w-[75px] cursor-pointer rounded-[30px] border-[2.5px] border-solid text-center prose-p2 transition-colors tablet:w-[90px]',
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
    <div className="w-full px-4 tablet:px-[93px]">
      <div
        className={cn(
          'mx-auto flex max-w-[584px] flex-col rounded-[20px] border border-neutral-200 p-6 tablet:flex-row tablet:items-stretch tablet:p-9 desktop:p-12 hd:max-w-[656px]',
          className
        )}
      >
        <div className="flex flex-col items-center tablet:items-start">
          <h3 className="mb-2 text-center prose-h6-small text-neutral-900 tablet:mb-4 tablet:prose-h6-large">
            讀報
          </h3>
          <div className="mx-auto flex w-full flex-wrap justify-center gap-2.5 tablet:flex-col">
            {renderButtons}
          </div>
        </div>

        <Divider className="my-4 tablet:hidden" />
        <Divider
          className="mx-6 hidden h-auto self-stretch tablet:block"
          direction="vertical"
        />
        <div className="tablet:flex-1">
          <div dangerouslySetInnerHTML={{ __html: selectedOption.code }} />
        </div>
      </div>
    </div>
  )
}

export default memo(NewsReading)
