import {
  convertFromRaw,
  Editor,
  EditorState,
  RawDraftContentState,
} from 'draft-js'
import debounce from 'lodash/debounce'
import { useEffect, useState } from 'react'
import styled, { ThemeProvider, useTheme } from 'styled-components'

import blockRenderMaps from '../block-render-maps/index'
import { decorator } from '../entity-decorators/index'
import { DEBOUNCE_THRESHOLD } from '../utils/constants'
import { breakpoints, mediaQuery } from '../utils/media-query'
import { InfoBoxContainer } from './image-block'

const fallbackImg = '/assets/images/image_placeholder.png'

const Figure = styled.figure`
  width: 100%;
`

const Img = styled.img<{ $isDesktopAndAbove: boolean }>`
  width: 100%;
  object-fit: contain;
  ${(props) => (props.$isDesktopAndAbove ? 'cursor: zoom-in;' : '')};
`

type ImageLinkBlockProps = {
  className?: string
  data: {
    url: string
    alignment: string
    rawContentState: RawDraftContentState
  }
}

function ImageLinkBlockInner({ className = '', data }: ImageLinkBlockProps) {
  const theme = useTheme()
  const { url, rawContentState } = data
  const [isDesktopAndAbove, setIsDesktopAndAbove] = useState(false)

  const handleWindowResize = debounce(() => {
    setIsDesktopAndAbove(window.innerWidth > breakpoints.desktop)
  }, DEBOUNCE_THRESHOLD)

  useEffect(() => {
    setIsDesktopAndAbove(window.innerWidth > breakpoints.desktop)
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  const contentState = convertFromRaw(rawContentState)
  const editorState = EditorState.createWithContent(contentState, decorator)
  const blockRenderMap = blockRenderMaps.imageLink

  const commonImgProps = {
    src: url ?? fallbackImg,
  }

  const imgBlock = (
    <Figure className={className}>
      <Img
        {...commonImgProps}
        $isDesktopAndAbove={isDesktopAndAbove}
        onClick={() =>
          isDesktopAndAbove &&
          (theme as any)?.onImageModalOpen?.(commonImgProps)
        }
      />
      <Editor
        blockRenderMap={blockRenderMap}
        editorState={editorState}
        readOnly
        onChange={() => {}}
      />
    </Figure>
  )

  return imgBlock
}

export const ImageLinkBlock = ({
  className = '',
  data,
}: ImageLinkBlockProps) => {
  return (
    <ThemeProvider theme={{}}>
      <ImageLinkBlockInner className={className} data={data} />
    </ThemeProvider>
  )
}

type ImageBlockInArticleBodyProps = ImageLinkBlockProps

const ArticleBodyContainer = styled.div<{ $alignment?: string }>`
  /* reset browser default styles */
  figure {
    margin: 0;
  }

  max-width: 72vw;
  margin: 0 auto 27px auto;

  ${mediaQuery.smallOnly} {
    max-width: 100%;
  }

  ${mediaQuery.largeOnly} {
    max-width: 1000px;
  }

  ${(props) => {
    switch (props.$alignment) {
      case 'paragraph-width':
        return `
          ${mediaQuery.mediumAbove} {
            max-width: 512px;
          }

          ${mediaQuery.largeOnly} {
            max-width: 584px;
          }
        `
      case 'right':
        return `
          ${mediaQuery.mediumAbove} {
            width: 361px;
            float: right;
            margin: 5px 0px 5px 27px;
          }
        `
      case 'left':
        return `
          ${mediaQuery.mediumAbove} {
            width: 361px;
            float: left;
            margin: 5px 27px 5px 0px;
          }
        `
      default:
        return ''
    }
  }}
`

export const ImageLinkInArticleBody = ({
  className = '',
  data,
}: ImageBlockInArticleBodyProps) => {
  return (
    <ArticleBodyContainer $alignment={data.alignment} className={className}>
      <ImageLinkBlock data={data} />
    </ArticleBodyContainer>
  )
}

export const ImageLinkInInfoBox = ({
  className = '',
  data,
}: ImageBlockInArticleBodyProps) => {
  return (
    <InfoBoxContainer $alignment={data.alignment} className={className}>
      <ImageLinkBlock data={data} />
    </InfoBoxContainer>
  )
}
