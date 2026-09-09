'use client'

import AllSiteBaodaozaiEventTrigger from '@/components/all-site-baodaozai-event-trigger'
import CategoryPillNav from '@/components/category-pill-nav'
import CommonCollection from '@/components/common-collection'
import { PostSummary } from '@/components/types'
import { CATEGORY_COLLECTION_ILLUSTRATIONS } from '@/constants'
import useAllSiteBaodaozaiIdleTimer from '@/hooks/use-site-baodaozai-idle-timer'
import {
  BaodaozaiInitializer,
  BaodaozaiVisibilitySetter,
} from '@/services/call-baodaozai'
import { CategorySlug } from '@/types'
import type { CallBaodaozaiIntro } from '@/types/api'

export type CategoryCollectionNavItem = {
  name: string
  path: string
  active: boolean
}

type CategoryCollectionModuleProps = {
  categorySlug: CategorySlug
  title: string
  intro: Pick<
    CallBaodaozaiIntro,
    'content' | 'buttonStatus' | 'buttonText' | 'buttonUrl'
  >
  showIntro: boolean
  posts: PostSummary[]
  navigationItems: CategoryCollectionNavItem[]
  totalPages: number
  currentPage: number
  routingPrefix: string
}

function CategoryCollectionModule({
  categorySlug,
  title,
  intro,
  showIntro,
  posts,
  navigationItems,
  totalPages,
  currentPage,
  routingPrefix,
}: CategoryCollectionModuleProps) {
  const { isIdle: isAllSiteBaodaozaiIdle } = useAllSiteBaodaozaiIdleTimer()
  const illustrations = CATEGORY_COLLECTION_ILLUSTRATIONS[categorySlug]
  const showSubcategoryNav =
    categorySlug !== 'classroom' && navigationItems.length > 0
  return (
    <main>
      {showIntro && (
        <>
          <BaodaozaiVisibilitySetter show={true} />
          <BaodaozaiInitializer intro={intro} />
          <AllSiteBaodaozaiEventTrigger
            id="show-intro"
            intro={intro}
            isIdle={isAllSiteBaodaozaiIdle}
          />
          <div className="relative">
            <div className="absolute top-[150vh]">
              <AllSiteBaodaozaiEventTrigger
                id="hide-intro"
                isIdle={isAllSiteBaodaozaiIdle}
                intro={intro}
              />
            </div>
          </div>
        </>
      )}
      <CommonCollection
        hero={{
          type: 'illustrated',
          title,
          illustration: illustrations.illustration,
          illustrationSmall: illustrations.illustrationSmall,
        }}
        morePostsMode="pagination"
        totalPages={totalPages}
        currentPage={currentPage}
        routingPrefix={routingPrefix}
        posts={posts}
        subcategoryNav={
          showSubcategoryNav ? (
            <CategoryPillNav items={navigationItems} />
          ) : null
        }
      />
    </main>
  )
}

export default CategoryCollectionModule
