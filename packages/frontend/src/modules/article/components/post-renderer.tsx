'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ArticleBodyDraftRenderer } from '@kids-reporter/draft-renderer'
import { cn } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'

import { FontSizeLevel, STICKY_HEADER_HEIGHT } from '@/constants'

import {
  ARTICLE_FONT_SIZE_CLASSNAMES,
  ARTICLE_FONT_SIZE_CLASSNAMES_LARGE,
} from '../constants'
import { useArticleContext } from '../context'

function trimEmptyBlocks(raw: RawDraftContentState): RawDraftContentState {
  const { blocks, entityMap } = raw
  if (blocks.length === 0) return raw

  const filtered = blocks.filter(
    (block) => !(block.type === 'unstyled' && block.text.trim() === '')
  )
  if (filtered.length === blocks.length) return raw

  return { blocks: filtered, entityMap }
}

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
