'use client'
import 'react-loading-skeleton/dist/skeleton.css'

import { ProjectContentDraftRenderer } from '@kids-reporter/draft-renderer'
import { cn } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'
import { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton'
import styled from 'styled-components'

import { Theme } from '@/constants'
import { ARTICLE_FONT_SIZE_CLASSNAMES } from '@/modules/article/constants'

const SkeletonContainer = styled.div`
  width: 100%;
  text-align: center;
  line-height: 200%;
`

export type DraftRendererProp = {
  rawContentState: RawDraftContentState
  theme: Theme
}

export const DraftRenderer = ({
  rawContentState,
  theme = Theme.BLUE,
}: DraftRendererProp) => {
  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted && rawContentState && theme ? (
    <div
      className={cn(
        'mb-10 prose-article text-neutral-900 tablet:mb-15',
        ...ARTICLE_FONT_SIZE_CLASSNAMES
      )}
    >
      <ProjectContentDraftRenderer
        rawContentState={rawContentState}
        themeColor={theme}
      />
    </div>
  ) : (
    <SkeletonContainer>
      <Skeleton width={'80%'} count={5} />
    </SkeletonContainer>
  )
}

export default DraftRenderer
