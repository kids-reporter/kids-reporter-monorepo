'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ArticleBodyDraftRenderer } from '@kids-reporter/draft-renderer'
import { cn } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'

import { FontSizeLevel, STICKY_HEADER_HEIGHT } from '@/constants'

import { useArticleContext } from './context'

type PostProp = {
  content: RawDraftContentState
}

function PostRenderer({ content }: PostProp) {
  const { onImageModalOpen, fontSize } = useArticleContext()
  return (
    <div
      className={cn(
        'prose-article',
        fontSize === FontSizeLevel.LARGE && 'text-[22.5px]'
      )}
    >
      <ArticleBodyDraftRenderer
        rawContentState={content}
        onImageModalOpen={onImageModalOpen}
        initiallyScrollTo={
          typeof window !== 'undefined' ? window.location.hash : undefined
        }
        offsetTop={STICKY_HEADER_HEIGHT}
      />
    </div>
  )
}

export default PostRenderer
