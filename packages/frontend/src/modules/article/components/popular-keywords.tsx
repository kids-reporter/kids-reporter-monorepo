import Link from 'next/link'

import { PopularKeywordsIcon } from '@/icons'

import { Keyword } from '../types'

type PopularKeywordsProp = {
  keywords: Keyword[]
}

function PopularKeywords({ keywords }: PopularKeywordsProp) {
  return (
    <div className="mt-4 flex w-[min(100vw,512px)] flex-col items-start gap-5 px-6 tablet:px-0 desktop:mt-5 hd:w-[584px]">
      <div className="flex flex-row items-center gap-2">
        <PopularKeywordsIcon />
        <h5 className="prose-h5-small desktop:prose-h5-large">常用關鍵字</h5>
      </div>
      <ul className="flex flex-wrap gap-x-2.5 gap-y-3.5">
        {keywords.map((keyword) => (
          <li key={keyword.name} className="h-max list-none">
            <Link
              href={`/search?q=${encodeURIComponent(keyword.name)}`}
              className="cursor-pointer rounded-full bg-neutral-200 px-3 py-1 prose-p2 font-bold text-neutral-900 transition-colors duration-200 hover:bg-red-500 hover:text-neutral-white"
            >
              #{keyword.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PopularKeywords
