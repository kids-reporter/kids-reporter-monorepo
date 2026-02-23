'use client'
import { Button } from '@kids-reporter/routing-ui'
import { useState } from 'react'

import ArticleCard from './article-card'
import { PostSummary } from './types'

type ArticleGridProps = {
  articles: PostSummary[]
  showOverImageCover?: boolean
}

function ArticleGrid({
  articles,
  showOverImageCover = false,
}: ArticleGridProps) {
  const [showMore, setShowMore] = useState(false)
  const displayedArticles = showMore ? articles : articles.slice(0, 6)

  return (
    <>
      <div className="grid w-full grid-cols-1 gap-6 tablet:grid-cols-2 tablet:gap-x-8 desktop:gap-x-12 hd:gap-x-14">
        {displayedArticles.map((article) => (
          <ArticleCard
            key={article.title}
            article={article}
            showOverImageCover={showOverImageCover}
          />
        ))}
      </div>
      {articles.length > 6 && !showMore && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="secondary"
            onClick={() => setShowMore(!showMore)}
            size={44}
          >
            {'看更多'}
          </Button>
        </div>
      )}
    </>
  )
}

export default ArticleGrid
