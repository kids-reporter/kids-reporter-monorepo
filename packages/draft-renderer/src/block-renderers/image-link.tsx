import {
  convertFromRaw,
  Editor,
  EditorState,
  RawDraftContentState,
} from 'draft-js'
import debounce from 'lodash/debounce'
import { useEffect, useMemo, useState } from 'react'
import styled, { ThemeProvider, useTheme } from 'styled-components'

import blockRenderMaps from '../block-render-maps/index'
import { decorator } from '../entity-decorators/index'
import { DEBOUNCE_THRESHOLD } from '../utils/constants'
import { breakpoints, mediaQuery } from '../utils/media-query'
import { InfoBoxContainer } from './image-block'

const fallbackImg = '/assets/images/image_placeholder.png'

const Figure = styled.figure<{ $alignment?: string }>`
  width: 100%;
  position: relative;

  ${(props) => {
    switch (props.$alignment) {
      case 'default':
        return `
          ${mediaQuery.desktopAbove} {
            transform: translateX(calc(50% - 304px));
          }

          ${mediaQuery.largeOnly} {
            transform: translateX(174px);
          }
        `
      default:
        return ''
    }
  }}
`

const FigureCaption = styled.figcaption<{ $alignment?: string }>`
  width: fit-content;
  max-width: 100%;
  font-size: ${({ theme }) =>
    theme?.fontSizeLevel === 'large' ? '18px' : '14px'};
  margin-left: auto;
  margin-right: auto;
  color: #575757;
  letter-spacing: 0.7px;
  line-height: 28px;
  text-align: center;
  padding: 16px 0 20px 0;
  border-bottom: 2px solid #c6c6c6;

  ${mediaQuery.mediumAbove} {
    padding: 20px 0;
  }

  ${(props) => {
    switch (props.$alignment) {
      case 'default':
        return `
          text-align: left;
          ${mediaQuery.smallOnly} {
            max-width: 240px;
            margin-right: 16px;
          }

          ${mediaQuery.mediumAbove} {
            max-width: 340px;
            margin-right: 32px;
          }

          ${mediaQuery.desktopAbove} {
            max-width: calc(100% - 640px);
            position: absolute;
            right: 0;
            top: calc(100% + 20px);
            margin-right: 0px;
          }

          ${mediaQuery.largeOnly} {
            max-width: 240px;
            position: absolute;
            right: 0;
            top: calc(100% + 20px);
            margin-right: 0px;
          }
        `
      case 'paragraph-width':
        return `
          ${mediaQuery.desktopAbove} {
            position: absolute;
            left: calc(100% + 32px);
            width: 128px;
            bottom: 0;
            text-align: left;
          }

          ${mediaQuery.largeOnly} {
            position: absolute;
            left: calc(100% + 40px);
            width: 240px;
            bottom: 0;
            text-align: left;
          }
        `
      case 'right':
        return `
          text-align: left;
          ${mediaQuery.smallOnly} {
            max-width: 240px;
            margin-right: 16px;
          }

          ${mediaQuery.mediumAbove} {
            max-width: 340px;
            margin-right: 32px;
          }

          ${mediaQuery.desktopAbove} {
            max-width: 128px;
            position: absolute;
            right: 0;
            top: calc(100% + 20px);
            margin-right: 0px;
          }

          ${mediaQuery.largeOnly} {
            max-width: 240px;
            position: absolute;
            right: 0;
            top: calc(100% + 20px);
            margin-right: 0px;
          }
        `
      default:
        return ''
    }
  }}
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

  const handleWindowResize = useMemo(
    () =>
      debounce(() => {
        setIsDesktopAndAbove(window.innerWidth > breakpoints.desktop)
      }, DEBOUNCE_THRESHOLD),
    []
  )

  useEffect(() => {
    setIsDesktopAndAbove(window.innerWidth > breakpoints.desktop)
    window.addEventListener('resize', handleWindowResize)
    return () => {
      window.removeEventListener('resize', handleWindowResize)
    }
  }, [handleWindowResize])

  const contentState = convertFromRaw(rawContentState)
  const editorState = EditorState.createWithContent(contentState, decorator)
  const blockRenderMap = blockRenderMaps.imageLink

  const commonImgProps = {
    src: url ?? fallbackImg,
  }

  const imgBlock = (
    <Figure className={className} $alignment={data.alignment}>
      <Img
        {...commonImgProps}
        $isDesktopAndAbove={isDesktopAndAbove}
        onClick={() =>
          isDesktopAndAbove &&
          (theme as any)?.onImageModalOpen?.(commonImgProps)
        }
      />
      <FigureCaption $alignment={data.alignment}>
        <Editor
          blockRenderMap={blockRenderMap}
          editorState={editorState}
          readOnly
          onChange={() => {}}
        />
      </FigureCaption>
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
  margin: 40px auto;

  ${mediaQuery.mediumAbove} {
    margin: 60px auto;
  }

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
            max-width: 584px;
          }

          ${mediaQuery.desktopAbove} {
            max-width: 608px;
          }

          ${mediaQuery.largeOnly} {
            max-width: 680px;
          }
        `
      case 'right':
        return `
        ${mediaQuery.mediumAbove} {
            width: 361px;
            float: right;
            margin: 20px 32px 20px 24px;
          }

          ${mediaQuery.desktopAbove} {
            width: 368px;
            float: right;
            margin: 20px 0px 0px 32px;
          }

          ${mediaQuery.largeOnly} {
            width: 451px;
            float: right;
            margin: 20px 0px 0px 40px;
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
