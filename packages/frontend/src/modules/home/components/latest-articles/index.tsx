'use client'
import { Button } from '@kids-reporter/routing-ui'
import { useRouter } from 'next/navigation'

import ArticleGrid from '@/components/article-grid'
import { PostSummary } from '@/components/types'
import { LatestArticlesIcon, LatestArticlesIconLarge } from '@/icons'

type LatestArticlesProps = {
  posts: PostSummary[]
}

function LatestArticles({ posts }: LatestArticlesProps) {
  const router = useRouter()
  const handleButtonClick = () => {
    router.push('/all')
  }

  return (
    <div className="mx-auto flex w-full max-w-300 flex-col items-center justify-center px-6 py-10 pb-14 tablet:px-8 tablet:py-12 tablet:pb-16 desktop:px-12 desktop:py-18 desktop:pb-24 hd:px-14 hd:py-24 hd:pb-30">
      <div className="mb-6 flex w-full flex-col items-start justify-between gap-6 tablet:mb-8 tablet:flex-row tablet:items-center desktop:mb-10">
        <div className="flex items-center gap-2">
          <div className="flex size-11 items-center justify-center desktop:size-16">
            <LatestArticlesIcon className="desktop:hidden" />
            <LatestArticlesIconLarge className="hidden desktop:block" />
          </div>
          <span className="prose-h2-small font-swei! text-neutral-900 desktop:prose-h2-large">
            最新文章
          </span>
        </div>
        <Button
          variant="secondary"
          onClick={handleButtonClick}
          size={44}
          className="hidden tablet:flex"
        >
          看全部
        </Button>
      </div>
      <ArticleGrid articles={posts} />
      <div className="mt-6 flex justify-center tablet:hidden">
        <Button variant="secondary" onClick={handleButtonClick} size={44}>
          看全部
        </Button>
      </div>
    </div>
  )
}

export default LatestArticles
