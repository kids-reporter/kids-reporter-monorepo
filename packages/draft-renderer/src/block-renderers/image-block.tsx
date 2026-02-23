import debounce from 'lodash/debounce'
import { useEffect, useState } from 'react'
import styled, { ThemeProvider, useTheme } from 'styled-components'

import { DEBOUNCE_THRESHOLD } from '../utils/constants'
import { breakpoints, mediaQuery } from '../utils/media-query'

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
            transform: translateX(160px);
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
            margin-left: auto;
            margin-right: 32px;
          }

          ${mediaQuery.desktopAbove} {
            max-width: calc(100% - 640px);
          }

          ${mediaQuery.largeOnly} {
            max-width: 240px;
          }
        `
      case 'paragraph-width':
        return `
          ${mediaQuery.smallOnly} {
            width: 100%;
            text-align: left;
          }
          ${mediaQuery.mediumAbove} {
            width: 100%;
            text-align: left;
          }
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
            margin-left: 0px;
            margin-right: 0px;
          }

          ${mediaQuery.desktopAbove} {
            max-width: 128px;
            position: absolute;
            right: 0;
            top: 100%;
            margin-right: 0px;
          }

          ${mediaQuery.largeOnly} {
            max-width: 240px;
            position: absolute;
            right: 0;
            top: 100%;
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
  height: 100%;
  display: block;
  object-fit: cover;
  ${(props) => (props.$isDesktopAndAbove ? 'cursor: zoom-in;' : '')};
`

type ImageBlockProps = {
  className?: string
  data: {
    alignment?: string
    desc?: string
    imageFile: {
      url: string
      width: number
      height: number
    }
    resized?: {
      original: string
      small: string
      medium: string
      large: string
    }
  }
}

function ImageBlockInner({ className = '', data }: ImageBlockProps) {
  const theme = useTheme()
  const { desc, imageFile, resized } = data || {}
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

  const aspectRatio =
    imageFile?.width && imageFile?.height
      ? `${imageFile.width}/${imageFile.height}`
      : '16/9'

  const imgSrcSetArr: string[] = []
  if (resized?.medium) {
    imgSrcSetArr.push(`${resized.medium} 500w`)
  }
  if (resized?.large) {
    imgSrcSetArr.push(`${resized.large} 1000w`)
  }

  const commonImgProps = {
    src: resized?.original ?? resized?.medium,
    sizes: '(min-width: 1200px) 1000px, 100vw',
    srcSet: imgSrcSetArr.join(','),
  }

  const imgBlock = (
    <Figure className={className} $alignment={data.alignment}>
      <Img
        alt={desc}
        {...commonImgProps}
        style={{ aspectRatio: aspectRatio }}
        $isDesktopAndAbove={isDesktopAndAbove}
        onClick={() =>
          isDesktopAndAbove &&
          (theme as any)?.onImageModalOpen?.(commonImgProps)
        }
      />
      {desc && (
        <FigureCaption
          data-image-block-caption="true"
          data-image-block-caption-alignment={data.alignment}
          $alignment={data.alignment}
        >
          {desc}
        </FigureCaption>
      )}
    </Figure>
  )

  return imgBlock
}

export function ImageBlock({ className = '', data }: ImageBlockProps) {
  return (
    <ThemeProvider theme={{}}>
      <ImageBlockInner className={className} data={data} />
    </ThemeProvider>
  )
}

type ImageBlockInArticleBodyProps = ImageBlockProps

const ArticleBodyContainer = styled.div<{ $alignment?: string }>`
  /* reset browser default styles */
  figure {
    margin: 0;
  }

  margin: 0 auto 40px auto;

  ${mediaQuery.mediumAbove} {
    margin: 0 auto 60px auto;
  }

  ${mediaQuery.smallOnly} {
    max-width: 100%;
  }

  ${mediaQuery.largeOnly} {
    max-width: 1000px;
  }

  ${(props) => {
    switch (props.$alignment) {
      case 'default':
        return `
          ${mediaQuery.desktopAbove} {
            max-width: 768px;
          }
          ${mediaQuery.largeOnly} {
            max-width: 1000px;
          }

        `
      case 'paragraph-width':
        return `
          ${mediaQuery.smallOnly} {
            max-width: 512px;
            padding: 0 24px;
          }

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
            margin: 0px 32px 20px 24px;
          }

          ${mediaQuery.desktopAbove} {
            width: 368px;
            float: right;
            margin: 0px 0px 0px 32px;
          }

          ${mediaQuery.largeOnly} {
            width: 451px;
            float: right;
            margin: 0px 0px 0px 40px;
          }
        `
      default:
        return ''
    }
  }}
`

export function ImageInArticleBody({
  className = '',
  data,
}: ImageBlockInArticleBodyProps) {
  return (
    <ArticleBodyContainer
      data-image-block-container="true"
      $alignment={data.alignment}
      className={className}
    >
      <ImageBlock data={data} />
    </ArticleBodyContainer>
  )
}

export const InfoBoxContainer = styled.div<{ $alignment?: string }>`
  /* reset browser default styles */
  figure {
    margin: 20px 0;
    transform: translateX(0);
  }

  figcaption {
    width: fit-content;
    max-width: none;
    position: relative;
    margin-right: auto;
  }

  ${mediaQuery.mediumAbove} {
    figure {
      margin: 32px 0;
    }
  }

  ${(props) => {
    switch (props.$alignment) {
      case 'right': {
        return `
          width: 200px;
          float: right;
          margin: 20px 32px 20px 24px;
        `
      }
      case 'paragraph-width':
      default: {
        return `
        width: fit-content;
        margin-left: auto; 
        margin-right: auto;
        `
      }
    }
  }}
`

export function ImageInInfoBox({
  className = '',
  data,
}: ImageBlockInArticleBodyProps) {
  return (
    <InfoBoxContainer $alignment={data.alignment} className={className}>
      <ImageBlock data={data} />
    </InfoBoxContainer>
  )
}
