'use client'
import { Button, useMediaQuery } from '@kids-reporter/routing-ui'
import { useRef } from 'react'

import { ImageWithFallback } from '@/components/image-with-fallback'
import {
  DESKTOP_HEADER_HEIGHT,
  FALLBACK_IMG,
  STICKY_HEADER_HEIGHT,
} from '@/constants'
import { ArrowDown } from '@/icons'
import { Photo } from '@/types'
import { breakpoints } from '@/utils'

import { TitlePosition } from '../types'
import PositionedTitle from './positioned-title'

type HeroTitleProps = {
  title: string
  subtitle?: string
  titlePosition: TitlePosition
  backgroundImage: Photo
  mobileBgImage?: Photo
  publishedDate: string
  articleCount: number
}

function HeroTitle({
  title,
  subtitle,
  titlePosition,
  backgroundImage,
  mobileBgImage,
  publishedDate,
  articleCount,
}: HeroTitleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery('(min-width: 1024px)', {
    defaultValue: false,
  })
  const handleScrollToContent = () => {
    if (ref.current) {
      window.scrollTo({
        behavior: 'smooth',
        top: ref.current.offsetHeight + (isDesktop ? DESKTOP_HEADER_HEIGHT : 0),
      })
    }
  }

  return (
    <div ref={ref} className="relative">
      <picture>
        {mobileBgImage ? (
          <source
            media={`(max-width: ${breakpoints.tablet - 1}px)`}
            srcSet={`${mobileBgImage?.resized?.small}`}
          />
        ) : (
          <source
            media={`(max-width: ${breakpoints.mobile - 1}px)`}
            srcSet={`${backgroundImage?.resized?.small} 1x, ${backgroundImage?.resized?.medium} 2x`}
          />
        )}
        <source
          media={`(min-width: ${breakpoints.hd}px)`}
          srcSet={`${backgroundImage?.resized?.large} 1x`}
        />
        <ImageWithFallback
          className="w-full object-cover"
          style={{ height: `calc(100vh - ${STICKY_HEADER_HEIGHT}px)` }}
          src={backgroundImage?.resized?.medium ?? FALLBACK_IMG}
          srcSet={`${backgroundImage?.resized?.medium} 1x, ${backgroundImage?.resized?.large} 2x`}
          alt={title}
          aria-hidden="true"
        />
      </picture>
      <PositionedTitle
        title={title}
        subtitle={subtitle}
        titlePosition={titlePosition}
        publishedDate={publishedDate}
        articleCount={articleCount}
      />
      <Button
        variant="secondary"
        className="absolute bottom-14 left-1/2 size-11 -translate-x-1/2 p-0 desktop:size-16"
        onClick={handleScrollToContent}
        aria-label="Scroll to content"
      >
        <ArrowDown />
      </Button>
    </div>
  )
}

export default HeroTitle
