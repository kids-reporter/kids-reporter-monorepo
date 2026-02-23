'use client'

import { PostSummary } from '@/components/types'

import CategoryPostCards from './components/category-post-cards'
import EditorRecommendation from './components/editor-recommendation'
import LatestArticles from './components/latest-articles'
import SubcategoriesMarquee from './components/subcategories-marquee'
import TopicSlider from './components/topic-slider'
import { CATEGORY_CONFIG } from './constants'

type HomeModuleProps = {
  topics: { url: string; image: string; title: string; subtitle: string }[]
  latestPosts: PostSummary[]
  featuredPosts: PostSummary[]
}

function HomeModule({ topics, latestPosts, featuredPosts }: HomeModuleProps) {
  return (
    <>
      <TopicSlider topics={topics} />
      <EditorRecommendation posts={featuredPosts} />
      <LatestArticles posts={latestPosts} />
      <SubcategoriesMarquee />
      <div className="w-full bg-yellow-100 pt-10 pb-14 tablet:pt-12 tablet:pb-16 desktop:pt-18 desktop:pb-24 hd:pt-24 hd:pb-30">
        {CATEGORY_CONFIG.map((category, index) => (
          <CategoryPostCards
            key={category.slug}
            category={category.slug}
            categoryName={category.name}
            isLast={index === CATEGORY_CONFIG.length - 1}
          />
        ))}
      </div>
    </>
  )
}

export default HomeModule
