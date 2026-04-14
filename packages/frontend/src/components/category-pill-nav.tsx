import { cn } from '@kids-reporter/routing-ui'
import Link from 'next/link'

export type CategoryPillNavItem = {
  name: string
  path: string
  active?: boolean
}

type CategoryPillNavProps = {
  items: CategoryPillNavItem[]
}

function CategoryPillNav({ items }: CategoryPillNavProps) {
  return (
    <nav
      className="flex w-full flex-row flex-wrap items-center gap-4"
      aria-label="子分類"
    >
      {items.map((item, index) => (
        <Link
          key={`category-pill-${item.path}-${index}`}
          href={item.path}
          className={cn(
            'inline-flex shrink-0 items-center rounded-[30px] px-3 py-1 prose-p1-bold transition-all duration-300 hover:bg-neutral-200 hover:text-neutral-900',
            item.active
              ? 'bg-red-400 text-neutral-white hover:bg-red-400 hover:text-neutral-white'
              : 'text-neutral-900'
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}

export default CategoryPillNav
