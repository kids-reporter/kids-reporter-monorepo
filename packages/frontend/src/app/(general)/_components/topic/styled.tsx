'use client'
import dynamic from 'next/dynamic'
import styled from 'styled-components'

import { FALLBACK_IMG, STICKY_HEADER_HEIGHT } from '@/constants'
import { Photo } from '@/types'
import { mediaQuery } from '@/utils/media-query'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback'),
  { ssr: false }
)

const _DownButton = ({ className }: { className?: string }) => {
  return (
    <svg
      className={className}
      width="60"
      height="60"
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g>
        <path
          d="M58.4962 29.9981C58.4962 45.7372 45.7372 58.4962 29.9981 58.4962C14.259 58.4962 1.5 45.7372 1.5 29.9981C1.5 14.259 14.259 1.5 29.9981 1.5C45.7372 1.5 58.4962 14.259 58.4962 29.9981Z"
          fill="white"
          stroke="#27b3f5"
          strokeWidth="3"
        ></path>
        <path
          d="M44 26L29.9944 40L16 26"
          stroke="#27b3f5"
          strokeWidth="4"
        ></path>
      </g>
    </svg>
  )
}

export const DownButton = styled(_DownButton)`
  cursor: pointer;
`

const Title = styled.h1`
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 10px #00537a;
  color: #fff;

  ${mediaQuery.mediumAbove} {
    font-size: 42px;
  }

  ${mediaQuery.smallOnly} {
    font-size: 30px;
  }
`

const SubTitle = styled.h2`
  font-weight: 700;
  text-align: center;
  text-shadow: 0 2px 10px #00537a;
  color: #fff;

  ${mediaQuery.mediumAbove} {
    font-size: 20px;
  }

  ${mediaQuery.smallOnly} {
    font-size: 16px;
  }
`

const _TitleContainer = ({
  title,
  subtitle,
  className,
}: {
  title: string
  subtitle?: string
  className?: string
}) => {
  return (
    <div className={className}>
      <Title>{title}</Title>
      {subtitle && <SubTitle>{subtitle}</SubTitle>}
    </div>
  )
}

export const TitleContainer = styled(_TitleContainer)`
  max-width: 750px;

  ${mediaQuery.mediumAbove} {
    width: 100%;
  }

  ${mediaQuery.smallOnly} {
    width: calc(330 / 375 * 100%);
  }
`

export const Container = styled.div`
  width: 100vw;
  height: calc(100vh - ${STICKY_HEADER_HEIGHT}px);

  /* make children align center*/
  position: relative;

  ${TitleContainer} {
    /* horizontal and vertical center */
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  ${DownButton} {
    position: absolute;
  }

  ${mediaQuery.largeOnly} {
    ${DownButton} {
      bottom: 50px;
      width: 60px;
      left: calc(50% - 30px);
    }
  }

  ${mediaQuery.mediumAndDesktopOnly} {
    ${DownButton} {
      bottom: 40px;
      width: 50px;
      left: calc(50% - 25px);
    }
  }

  ${mediaQuery.smallOnly} {
    ${DownButton} {
      bottom: 30px;
      width: 40px;
      left: calc(50% - 20px);
    }
  }
`

export const FullScreenImage = (props: {
  imageEntity: Photo
  mobileImageEntity?: Photo
}) => {
  const { imageEntity, mobileImageEntity } = props

  return (
    <picture>
      {mobileImageEntity ? (
        <source
          media={mediaQuery.smallOnly.replace('@media ', '')}
          srcSet={`${mobileImageEntity?.resized?.small}`}
        />
      ) : (
        <source
          media={mediaQuery.smallOnly.replace('@media ', '')}
          srcSet={`${imageEntity?.resized?.small} 1x, ${imageEntity?.resized?.medium} 2x`}
        />
      )}
      <source
        media={mediaQuery.largeOnly.replace('@media ', '')}
        srcSet={`${imageEntity?.resized?.large} 1x`}
      />
      <ImageWithFallback
        className="w-full object-cover"
        style={{ height: `calc(100vh - ${STICKY_HEADER_HEIGHT}px)` }}
        src={imageEntity?.resized?.medium ?? FALLBACK_IMG}
        srcSet={`${imageEntity?.resized?.medium} 1x, ${imageEntity?.resized?.large} 2x`}
      />
    </picture>
  )
}

export const PublishedDate = styled.div`
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  margin-top: 20px;
  margin-bottom: 70px;
  color: #a3a3a3;
`

export default {
  Title,
  Container,
  DownButton,
  SubTitle,
  PublishedDate,
}
