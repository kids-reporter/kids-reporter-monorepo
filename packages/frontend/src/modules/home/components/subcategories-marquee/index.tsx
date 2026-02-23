import Link from 'next/link'
import { useMemo } from 'react'
import Marquee from 'react-fast-marquee'

import { useSubcategoriesQuery } from '@/api-utils/react-query/hooks/subcategory'

import Illustrations from './illustrations'
function SubcategoriesMarquee() {
  const { data: subcategories, isLoading } = useSubcategoriesQuery()

  const subcategoriesWithLinks = useMemo(
    () =>
      subcategories?.map((subcategory) => ({
        id: subcategory.id,
        name: subcategory.name ?? '',
        link: `/category/${subcategory.category?.slug ?? ''}/${subcategory.slug ?? ''}`,
      })) ?? [],
    [subcategories]
  )

  return (
    <div className="mt-4 w-screen tablet:mt-6 desktop:mt-8 hd:mt-10">
      {!isLoading && subcategoriesWithLinks.length > 0 && (
        <Marquee pauseOnHover pauseOnClick autoFill className="pb-4">
          {subcategoriesWithLinks?.map((subcategory) => (
            <Link
              key={subcategory.id}
              href={subcategory.link}
              className="px-4 py-4 prose-h3-small font-normal! text-neutral-900 hover:text-red-400 hover:underline desktop:px-5 desktop:prose-h2-small desktop:font-normal!"
            >
              #{subcategory.name}
            </Link>
          ))}
        </Marquee>
      )}
      {isLoading && <div className="h-[38px] w-full desktop:h-[45px]" />}
      <Illustrations />
    </div>
  )
}

export default SubcategoriesMarquee
