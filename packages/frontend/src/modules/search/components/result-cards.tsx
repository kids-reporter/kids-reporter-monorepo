import type { SearchCardItem } from '../types'
import ResultCard from './result-card'

function ResultCards({ items }: { items: SearchCardItem[] }) {
  return (
    <ul className="flex w-full list-none flex-col gap-10 py-6 tablet:gap-8 tablet:py-10 desktop:py-12">
      {items.map((item, idx) => {
        if (!item?.content?.url) {
          return null
        }
        return (
          <li
            key={`${item.content.url ?? 'item'}-${idx}`}
            className="animate-in duration-500 fade-in"
          >
            <ResultCard content={item.content} />
          </li>
        )
      })}
    </ul>
  )
}

export default ResultCards
