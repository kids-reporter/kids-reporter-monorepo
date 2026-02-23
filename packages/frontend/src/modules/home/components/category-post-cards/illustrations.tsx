import { cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'

import { CategorySlug } from '@/types'

type CategoryPostCardsIllustrationsProps = {
  category: CategorySlug
}

const ADDITIONAL_CLASSNAMES: Record<CategorySlug, string> = {
  storytelling: 'left-0 hd:left-[calc(50vw-650px)]',
  campus: 'right-0 hd:right-[calc(50vw-650px)]',
  'listening-news': 'left-0 hd:left-[calc(50vw-650px)]',
  classroom: 'right-0 hd:right-[calc(50vw-650px)]',
  news: 'right-0 hd:right-[calc(50vw-650px)]',
}

function CategoryPostCardsIllustrations({
  category,
}: CategoryPostCardsIllustrationsProps) {
  return (
    <div className={cn('absolute top-0 z-1', ADDITIONAL_CLASSNAMES[category])}>
      <Image
        src={`/assets/images/home/category/${category.replace('-', '_')}_illustration_s.svg`}
        alt={`${category} illustration`}
        width={160}
        height={160}
        className={cn('h-40 w-40 tablet:hidden')}
      />
      <Image
        src={`/assets/images/home/category/${category.replace('-', '_')}_illustration_m.svg`}
        alt={`${category} illustration`}
        width={176}
        height={176}
        className={cn('hidden h-48 w-48 tablet:block desktop:hidden')}
      />
      <Image
        src={`/assets/images/home/category/${category.replace('-', '_')}_illustration_l.svg`}
        alt={`${category} illustration`}
        width={240}
        height={240}
        className={cn('hidden h-60 w-60 desktop:block hd:hidden')}
      />
      <Image
        src={`/assets/images/home/category/${category.replace('-', '_')}_illustration_xl.svg`}
        alt={`${category} illustration`}
        width={240}
        height={240}
        className={cn('hidden h-60 w-60 hd:block')}
      />
    </div>
  )
}

export default CategoryPostCardsIllustrations
