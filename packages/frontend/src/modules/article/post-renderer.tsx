'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ArticleBodyDraftRenderer } from '@kids-reporter/draft-renderer'
import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'

import { STICKY_HEADER_HEIGHT, Theme } from '@/constants'

import { useArticleContext } from './context'

type PostProp = {
  post: any
  theme: Theme
}

const SkeletonContainer = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 40px;
  line-height: 200%;
`

export const PostRenderer = (props: PostProp) => {
  const content = props.post?.content
  const theme = props.theme
  const { fontSize, handleImgModalOpen } = useArticleContext()

  return content && theme ? (
    <ArticleBodyDraftRenderer
      rawContentState={content}
      themeColor={theme}
      fontSizeLevel={fontSize}
      handleImgModalOpen={handleImgModalOpen}
      initiallyScrollTo={
        typeof window !== 'undefined' ? window.location.hash : undefined
      }
      offsetTop={STICKY_HEADER_HEIGHT}
    />
  ) : (
    <SkeletonContainer>
      <Skeleton width={'80%'} count={5} />
    </SkeletonContainer>
  )
}

export default PostRenderer
