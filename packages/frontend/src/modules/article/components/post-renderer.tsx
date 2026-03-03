'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ArticleBodyDraftRenderer } from '@kids-reporter/draft-renderer'
import { cn } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'

import { FontSizeLevel, STICKY_HEADER_HEIGHT } from '@/constants'

import {
  ARTICLE_FONT_SIZE_CLASSNAMES,
  ARTICLE_FONT_SIZE_CLASSNAMES_LARGE,
  ARTICLE_LARGE_FONT_BASE_CLASSNAME,
} from '../constants'
import { useArticleContext } from '../context'
import trimEmptyBlocks from '../utils/trim-empty-blocks'

type PostProp = {
  content: RawDraftContentState
  shouldMount?: boolean
}

function PostRenderer({ content, shouldMount }: PostProp) {
  const { onImageModalOpen, fontSize } = useArticleContext()

  return (
    <div
      className={cn(
        'mb-10 prose-article text-neutral-900 tablet:mb-15',
        ...ARTICLE_FONT_SIZE_CLASSNAMES,
        fontSize === FontSizeLevel.LARGE && [
          ARTICLE_LARGE_FONT_BASE_CLASSNAME,
          ...ARTICLE_FONT_SIZE_CLASSNAMES_LARGE,
        ]
      )}
    >
      {shouldMount && (
        <ArticleBodyDraftRenderer
          rawContentState={trimEmptyBlocks(content)}
          onImageModalOpen={onImageModalOpen}
          initiallyScrollTo={
            typeof window !== 'undefined' ? window.location.hash : undefined
          }
          offsetTop={STICKY_HEADER_HEIGHT}
        />
      )}
    </div>
  )
}

export default PostRenderer
