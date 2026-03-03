import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { mediaQuery } from '../utils/media-query'
import Multimedia from './multimedia'

const mockup = {
  mobile: {
    container: {
      width: 375, // px
    },
    slide: {
      width: 339, // px
      height: 189, // px
      paddingRight: 2, // px
    },
    offset: {
      left: 18, // px
    },
  },
  tablet: {
    container: {
      width: 768, // px
    },
    slide: {
      width: 687, // px
      height: 387, // px
      paddingRight: 4, // px
    },
    offset: {
      left: 41, // px
    },
  },
  desktop: {
    container: {
      width: 768, // px
    },
    slide: {
      width: 676, // px
      height: 370, // px
      paddingRight: 4, // px
    },
    offset: {
      left: 48, // px
    },
  },
  hd: {
    container: {
      width: 1000, // px
    },
    slide: {
      width: 910, // px
      height: 500, // px
      paddingRight: 4, // px
    },
    offset: {
      left: 45, // px
    },
  },
}

// Assuming there are three images [ A, B, C ] for slideshow.
// If image B is rendered in the center,
// users can see part of image A(left side) and image C(right side) with masks.
// When users click right button to see image C, which means, C is in the center,
// users still can see part of image B(left side) and image A(right side) with masks.
//
// Hence, there are four images rendered arround B at the beginning.
// The image array should be [ C, A, B, C, A ].
//
// `slidesOffset` indicates how many slides rendered before/after image B, which is, 2 (A and C).
//
const slidesOffset = 2

// duration of transition of transform(translateX(?px))
const duration = 300

// current index to indicate which image should be rendered in the center
const defaultCurIndex = 0

const SlidesSection = styled.div`
  flex-shrink: 0;
  flex-basis: 100%;
  overflow: hidden;
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
`

const PrevNextSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 0;
`

const IconButton = styled.div`
  cursor: pointer;
  width: 56px;
  height: 56px;
  display: inline-flex;

  > svg {
    margin: auto;
    width: 56px;
    height: 56px;
  }

  ${mediaQuery.largeOnly} {
    width: 64px;
    height: 64px;

    > svg {
      width: 64px;
      height: 64px;
    }
  }

  &:hover {
    > svg {
      & path:first-child {
        fill: #a3a3a3;

        stroke: #a3a3a3;
      }
      & path:last-child {
        transition: stroke 0.3s ease;
        fill: #a3a3a3;

        stroke: white;
      }
    }
  }
`

const ImageSequenceNumber = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

const ImageNumber = styled.span`
  font-size: 18px;
  font-weight: 700;
  line-height: 1.6;
  letter-spacing: 0.9px;
  color: #232323;
`

const ImageTotal = styled(ImageNumber)`
  /* Same styling as ImageNumber */
`

const CaptionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 20px;
  flex: 1;
  ${mediaQuery.desktopAbove} {
    position: absolute;
    right: 0;
  }
`

const SequenceNumberContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Desc = styled(Multimedia.Caption)`
  display: inline-block;
  text-align: left;

  /* overwrite Multimedia.Caption styles */
  margin-bottom: 0;

  ${mediaQuery.smallOnly} {
    width: auto;
    max-width: 240px;
  }

  ${mediaQuery.mediumOnly} {
    width: 340px;
  }

  ${mediaQuery.desktopAbove} {
    width: 128px;
  }

  ${mediaQuery.largeOnly} {
    width: 240px;
  }
`

const EmptyDesc = styled.div`
  width: 240px;
  height: 0;
  border-top: 2px solid #c6c6c6;
  margin-top: 20px;

  ${mediaQuery.smallOnly} {
    width: 240px;
  }
`

const SlidesFlexBox = styled.div<{
  $isSliding: boolean
  $duration: number
  $translateXUnit: number
}>`
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  flex-wrap: nowrap;
  width: 100%;
  height: 100%;
  ${({ $isSliding, $duration }) =>
    $isSliding ? `transition: transform ${$duration}ms ease-in-out;` : ''}

  ${({ $translateXUnit }) => {
    const mobileTranslateX = getTranslateX(mockup.mobile, $translateXUnit)
    const mobileContainerWidth = getContainerWidth(mockup.mobile)
    const mobilePercent = (mobileTranslateX / mobileContainerWidth) * 100

    const tabletTranslateX = getTranslateX(mockup.tablet, $translateXUnit)
    const tabletContainerWidth = getContainerWidth(mockup.tablet)
    const tabletPercent = (tabletTranslateX / tabletContainerWidth) * 100

    const desktopTranslateX = getTranslateX(mockup.desktop, $translateXUnit)
    const desktopContainerWidth = getContainerWidth(mockup.desktop)
    const desktopPercent = (desktopTranslateX / desktopContainerWidth) * 100

    const hdTranslateX = getTranslateX(mockup.hd, $translateXUnit)
    const hdContainerWidth = getContainerWidth(mockup.hd)
    const hdPercent = (hdTranslateX / hdContainerWidth) * 100

    return `
      ${mediaQuery.smallOnly} {
        transform: translateX(${mobilePercent}%);
      }
      ${mediaQuery.mediumOnly} {
        transform: translateX(${tabletPercent}%);
      }
      ${mediaQuery.desktopAbove} {
        transform: translateX(${desktopPercent}%);
      }
      ${mediaQuery.largeOnly} {
        transform: translateX(${hdPercent}%);
      }
    `
  }}
`

const SlideFlexItem = styled.div`
  height: 100%;
  flex-shrink: 0;

  ${mediaQuery.smallOnly} {
    flex-basis: ${() =>
      `calc(${getSlideWidth(mockup.mobile)} / ${getContainerWidth(mockup.mobile)}*100%)`};
    padding-right: ${() =>
      `calc(${mockup.mobile.slide.paddingRight} / ${getContainerWidth(mockup.mobile)}*100%)`};
  }

  ${mediaQuery.mediumOnly} {
    flex-basis: ${() =>
      `calc(${getSlideWidth(mockup.tablet)} / ${getContainerWidth(mockup.tablet)}*100%)`};
    padding-right: ${() =>
      `calc(${mockup.tablet.slide.paddingRight} / ${getContainerWidth(mockup.tablet)}*100%)`};
  }

  ${mediaQuery.desktopAbove} {
    flex-basis: ${getSlideWidth(mockup.desktop)}px;
    padding-right: ${mockup.desktop.slide.paddingRight}px;
  }

  ${mediaQuery.largeOnly} {
    flex-basis: ${getSlideWidth(mockup.hd)}px;
    padding-right: ${mockup.hd.slide.paddingRight}px;
  }
`

const SlideshowFlexBox = styled.div`
  width: 100%;
  margin: 0 auto;
  display: flex;
  position: relative;
  flex-direction: column;

  ${mediaQuery.smallOnly} {
    width: 100%;
  }

  ${mediaQuery.mediumOnly} {
    width: 100%;
  }

  ${mediaQuery.desktopAbove} {
    width: ${mockup.desktop.container.width}px;
    transform: translateX(80px);
  }

  ${mediaQuery.largeOnly} {
    width: ${mockup.hd.container.width}px;
    transform: translateX(160px);
  }
`

const NavigationAndCaptionRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 40px;
  padding: 20px 32px 0px;
  width: 100%;

  ${mediaQuery.smallOnly} {
    flex-direction: row;
    gap: 40px;
    padding: 16px 16px 0px;
  }

  ${mediaQuery.desktopAbove} {
    padding: 16px 0 0 0;
  }
`

type DeviceMockup = {
  slide: {
    width: number
    height: number
    paddingRight: number
  }
  container: {
    width: number
  }
  offset: {
    left: number
  }
}

function getTranslateX(deviceMockup: DeviceMockup, unit: number) {
  const slideWidth = getSlideWidth(deviceMockup)

  // total slides width including padding
  let translateX = unit * slideWidth

  // add left mask width and padding
  translateX = translateX + deviceMockup.offset.left
  return translateX // px
}

function getContainerWidth(deviceMockup: DeviceMockup) {
  return deviceMockup.container.width
}

function getSlideWidth(deviceMockup: DeviceMockup) {
  return deviceMockup.slide.width + deviceMockup.slide.paddingRight
}

type ImageFile = {
  width: number
  height: number
  url: string
}

type ImageEntity = {
  id: string
  desc: string // figure caption
  imageFile: ImageFile
  resized?: {
    small: string
    medium: string
    large: string
  }
}

type SlideshowBlockProps = {
  className?: string
  data: {
    delay?: number
    alignment?: string
    images: ImageEntity[]
  }
}

function NextArrowSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
    >
      <g clipPath="url(#clip0_750_25274)">
        <path
          d="M32 1.50001C48.8447 1.50001 62.5 15.1553 62.5 32C62.5 48.8447 48.8447 62.5 32 62.5C15.1553 62.5 1.5 48.8447 1.5 32C1.5 15.1553 15.1553 1.50001 32 1.50001Z"
          fill="white"
          stroke="#C6C6C6"
          strokeWidth="3"
        />
        <path
          d="M28 44L39.8948 32L28 20"
          stroke="#575757"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_750_25274">
          <rect
            width="64"
            height="64"
            fill="white"
            transform="translate(64 64) rotate(180)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

function PreArrowSvg() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="64"
      height="64"
      viewBox="0 0 64 64"
      fill="none"
    >
      <g clipPath="url(#clip0_750_25269)">
        <path
          d="M32 1.50001C48.8447 1.50001 62.5 15.1553 62.5 32C62.5 48.8447 48.8447 62.5 32 62.5C15.1553 62.5 1.5 48.8447 1.5 32C1.5 15.1553 15.1553 1.50001 32 1.50001Z"
          fill="white"
          stroke="#C6C6C6"
          strokeWidth="3"
        />
        <path
          d="M36 44L24.1052 32L36 20"
          stroke="#575757"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_750_25269">
          <rect
            width="64"
            height="64"
            fill="white"
            transform="translate(64 64) rotate(180)"
          />
        </clipPath>
      </defs>
    </svg>
  )
}

export function SlideshowBlock({ className = '', data }: SlideshowBlockProps) {
  const defaultTranslateXUnit = -slidesOffset

  // value of curSlideIndex would be in [ 0 ~ props.data.content.length ] range,
  // it indicates which image should be placed in the center
  const [curSlideIndex, setCurSlideIndex] = useState(defaultCurIndex)
  const [slideTo, setSlideTo] = useState('') // '', 'previous' or 'next'. '' means no sliding.
  const [translateXUnit, setTranslateXUnit] = useState(defaultTranslateXUnit)
  const images = (data?.images || []).filter((img) => img?.imageFile?.url)
  const total = images?.length
  const desc = images?.[curSlideIndex]?.desc
  const appendedClassName = className + ' avoid-break'

  const slides = useMemo(() => {
    // add last `slidesOffset` elements into top of images array.
    // add first `slidesOffset` elements into bottom of images array.
    // EX:
    // slidesOffset: 2
    // input images: [ a, b, c, d ]
    // output images: [c, d, a, b, c, d, a, b]
    const _images = [
      ...images.slice(-slidesOffset),
      ...images,
      ...images.slice(defaultCurIndex, slidesOffset),
    ]

    return _images?.map((img: ImageEntity, index: number) => {
      const width = img.imageFile.width ?? 0
      const height = img.imageFile.height ?? 0
      const imgSrc = img.resized?.medium ?? img.imageFile.url
      const imgSrcSetArr = []

      if (img.resized?.small) {
        imgSrcSetArr.push(`${img.resized.medium} 600w`)
      }

      if (img.resized?.medium) {
        imgSrcSetArr.push(`${img.resized.medium} 1200w`)
      }

      if (img.resized?.large) {
        imgSrcSetArr.push(`${img.resized.large} 2000w`)
      }

      const objectFit = width > height ? 'cover' : 'contain'

      return (
        // since the items of _images would have the same id,
        // hence, we append `index` on the key
        <SlideFlexItem key={`slide_${img.id}_${index}`}>
          <div
            className="w-full h-full relative overflow-hidden"
            style={{
              backgroundColor: '#f8f8f8',
            }}
          >
            <img
              srcSet={imgSrcSetArr.join(',')}
              src={imgSrc}
              style={{ display: 'block', objectFit, height: '100%' }}
              sizes="(max-width: 768px) 100vw, (min-width: 1400px) 1000px, 500px"
            />
          </div>
        </SlideFlexItem>
      )
    })
  }, [images])

  const slideToPrev = () => {
    setSlideTo('previous')
    setTranslateXUnit(translateXUnit + 1)
  }

  const slideToNext = () => {
    setSlideTo('next')
    setTranslateXUnit(translateXUnit - 1)
  }

  useEffect(() => {
    if (slideTo === '') {
      return
    }
    let _curSlideIndex: number
    if (slideTo === 'previous') {
      _curSlideIndex = curSlideIndex - 1

      if (_curSlideIndex < defaultCurIndex) {
        _curSlideIndex = total + _curSlideIndex
      }
    } else if (slideTo === 'next') {
      _curSlideIndex = curSlideIndex + 1

      if (_curSlideIndex >= total) {
        _curSlideIndex = _curSlideIndex % total
      }
    }
    setTimeout(() => {
      setSlideTo('')
      setCurSlideIndex(_curSlideIndex)
      setTranslateXUnit(defaultTranslateXUnit - _curSlideIndex)
    }, duration * 2)
  }, [curSlideIndex, defaultTranslateXUnit, slideTo, total])

  const isSliding = slideTo !== ''

  return (
    <SlideshowFlexBox className={appendedClassName}>
      <SlidesSection>
        <SlidesFlexBox
          $translateXUnit={translateXUnit}
          $duration={duration}
          $isSliding={isSliding}
        >
          {slides}
        </SlidesFlexBox>
      </SlidesSection>
      <NavigationAndCaptionRow>
        <PrevNextSection>
          <IconButton onClick={isSliding ? undefined : slideToPrev}>
            <PreArrowSvg />
          </IconButton>
          <IconButton onClick={isSliding ? undefined : slideToNext}>
            <NextArrowSvg />
          </IconButton>
        </PrevNextSection>
        <CaptionContainer data-image-slideshow-caption-alignment="default">
          <SequenceNumberContainer>
            <ImageSequenceNumber>
              <ImageNumber>{curSlideIndex + 1}</ImageNumber>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="13"
                viewBox="0 0 15 13"
                fill="none"
              >
                <path
                  d="M0.703125 11.7031L14.1431 0.703125"
                  stroke="#232323"
                  strokeLinecap="square"
                />
              </svg>
              <ImageTotal>{total}</ImageTotal>
            </ImageSequenceNumber>
            {desc ? <Desc>{desc}</Desc> : <EmptyDesc />}
          </SequenceNumberContainer>
        </CaptionContainer>
      </NavigationAndCaptionRow>
    </SlideshowFlexBox>
  )
}

const ArticleBodyContainer = styled.div`
  ${mediaQuery.smallOnly} {
    margin: 0 auto 40px auto;
  }

  ${mediaQuery.mediumAbove} {
    margin: 0 auto 60px auto;
  }
`

export function SlideshowInArticleBody({
  className = '',
  data,
}: SlideshowBlockProps) {
  return (
    <ArticleBodyContainer className={className}>
      <SlideshowBlock data={data} />
    </ArticleBodyContainer>
  )
}
