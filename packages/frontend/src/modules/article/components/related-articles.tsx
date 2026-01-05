'use client'
import { useCallback, useMemo, useState } from 'react'

import ArticleGrid from '@/components/article-grid'
import { PostSummary } from '@/components/types'
import { RelatedPostsIcon, RelatedPostsIconLarge } from '@/icons'

import SegmentedSwitcher from './segmented-switcher'

type RelatedArticlesProps = {
  articles: PostSummary[]
  twReporterArticles: PostSummary[]
}

function RelatedArticles({
  articles,
  twReporterArticles,
}: RelatedArticlesProps) {
  const [selectedSegment, setSelectedSegment] = useState<'kids' | 'reporter'>(
    'kids'
  )

  const visibleArticles = useMemo(() => {
    return selectedSegment === 'kids' ? articles : twReporterArticles
  }, [articles, twReporterArticles, selectedSegment])

  const handleSegmentChange = useCallback(
    (segment: 'kids' | 'reporter') => {
      setSelectedSegment(segment)
    },
    [setSelectedSegment]
  )

  const renderContent = useMemo(() => {
    if (visibleArticles.length === 0) {
      return (
        <div className="flex min-h-50 w-full items-center justify-center prose-p2">
          <span>相關報導持續整理中，歡迎之後再來探索。</span>
        </div>
      )
    }
    return (
      <ArticleGrid
        articles={visibleArticles}
        showOverImageCover={selectedSegment === 'reporter'}
      />
    )
  }, [visibleArticles, selectedSegment])

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col items-center justify-center px-6 py-10 tablet:px-8 tablet:py-12 desktop:px-12 desktop:py-18 hd:px-16 hd:py-24">
      <div className="mb-6 flex w-full flex-col items-start justify-between gap-6 tablet:flex-row tablet:items-center">
        <div className="flex items-center gap-2">
          <div className="flex size-11 items-center justify-center desktop:size-16">
            <RelatedPostsIcon className="desktop:hidden" />
            <RelatedPostsIconLarge className="hidden desktop:block" />
          </div>
          <span className="prose-h2-small font-swei text-neutral-900 desktop:prose-h2-large">
            相關文章
          </span>
        </div>
        <SegmentedSwitcher
          selectedSegment={selectedSegment}
          onSegmentChange={handleSegmentChange}
        />
      </div>
      {renderContent}
    </div>
  )
}

export default RelatedArticles
