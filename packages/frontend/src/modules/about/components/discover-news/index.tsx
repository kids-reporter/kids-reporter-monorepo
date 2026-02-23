'use client'

import { cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import { useCallback, useMemo, useState } from 'react'

import SegmentedSwitcher from '@/modules/article/components/segmented-switcher'

import { FACETS, PATHS } from './constants'

type SegmentType = 'facets' | 'paths'

function DiscoverNews() {
  const [selectedSegment, setSelectedSegment] = useState<SegmentType>('facets')

  const handleSegmentChange = useCallback((segment: SegmentType) => {
    setSelectedSegment(segment)
  }, [])

  const items = useMemo(() => {
    return selectedSegment === 'facets' ? FACETS : PATHS
  }, [selectedSegment])

  return (
    <div
      id="explore"
      className="flex w-full scroll-margin-anchor flex-col items-center justify-center bg-yellow-100 px-6 pt-10 pb-14 tablet:px-8 tablet:pt-12 tablet:pb-16 desktop:px-12 desktop:pt-18 desktop:pb-24 hd:px-14 hd:pt-24 hd:pb-30"
    >
      <h2 className="mb-4 flex items-center gap-1 prose-h2-small !font-swei text-neutral-900 desktop:mb-6 desktop:prose-h2-large">
        <Image
          src="/assets/images/about/discover-news/icon.svg"
          alt="Discover News"
          className="size-11 desktop:size-16"
          width={64}
          height={64}
        />
        探索新聞
      </h2>
      <span className="mb-6 text-center prose-h6-small !font-swei text-neutral-900 desktop:mb-10 desktop:prose-h6-large">
        在這裡，可以看見多元世界與文化，
        <br />
        也可以用不同方式參與其中。
      </span>

      <div className="mb-8 w-full tablet:w-103 desktop:mb-12 desktop:w-151">
        <SegmentedSwitcher
          selectedSegment={selectedSegment}
          onSegmentChange={handleSegmentChange}
          items={[
            {
              label: '新聞的多種面貌',
              value: 'facets',
              className:
                'prose-p2-bold tablet:prose-p1-bold desktop:prose-h6-large',
            },
            {
              label: '5種走進新聞的路徑',
              value: 'paths',
              className:
                'prose-p2-bold tablet:prose-p1-bold desktop:prose-h6-large',
            },
          ]}
        />
      </div>

      <div className="flex max-w-124 flex-wrap justify-center gap-6 tablet:max-w-132 desktop:max-w-160 desktop:gap-8 hd:max-w-300">
        {items.map(({ element, name, image }) => {
          return (
            <div
              key={name}
              className="relative flex flex-col items-center justify-center gap-3"
            >
              <div className="flex size-[151px] items-center justify-center desktop:size-[192px]">
                <Image
                  src={`/assets/images/about/discover-news/${image}`}
                  alt={name}
                  className="h-full w-full object-contain"
                  loading="lazy"
                  height={151}
                  width={151}
                />
              </div>
              <p
                className={cn(
                  'text-center prose-p1-bold text-neutral-900 tablet:prose-h6-small desktop:prose-h5-large',
                  selectedSegment === 'facets' &&
                    'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-neutral-white',
                  selectedSegment === 'paths' &&
                    'prose-p1-bold desktop:prose-h6-large'
                )}
              >
                {element}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default DiscoverNews
