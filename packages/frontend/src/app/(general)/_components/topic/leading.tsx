'use client'
import { useRef } from 'react'
import styled from 'styled-components'

import { Photo } from '@/types'
import { mediaQuery } from '@/utils/media-query'

import {
  Container,
  DownButton,
  FullScreenImage,
  TitleContainer,
} from './styled'

const PositionedTitle = styled(TitleContainer)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;

  ${mediaQuery.largeOnly} {
    &.left {
      left: calc(104 / 1440 * 100%);
      transform: translate(0, -50%);
      align-items: flex-start;
    }

    &.bottom {
      top: unset;
      bottom: 148px;
      transform: translate(-50%, 0);
    }

    &.left.bottom {
      transform: translate(0);
    }
  }

  ${mediaQuery.mediumAndDesktopOnly} {
    &.bottom {
      top: unset;
      bottom: 171px;
      transform: translate(-50%, 0);
    }
  }

  ${mediaQuery.smallOnly} {
    &.bottom {
      top: unset;
      bottom: 103px;
      transform: translate(-50%, 0);
    }
  }

  &.left-center,
  &.left {
    h1,
    h2 {
      text-align: left;
    }
  }
`

export const Leading = ({
  title,
  subtitle,
  titlePosition = 'center',
  backgroundImage,
  mobileBgImage,
}: {
  title: string
  subtitle?: string
  titlePosition?: string
  backgroundImage: Photo
  mobileBgImage?: Photo
}) => {
  const ref = useRef(null)
  const onDownButtonClick = () => {
    if (ref.current) {
      const container = ref.current as HTMLElement
      if (container) {
        window.scrollTo({
          behavior: 'smooth',
          top: container.offsetHeight,
        })
      }
    }
  }
  let titleClassName = ''
  switch (titlePosition) {
    case 'left-center': {
      titleClassName = 'left'
      break
    }
    case 'center-bottom': {
      titleClassName = 'bottom'
      break
    }
    case 'left-bottom': {
      titleClassName = 'left bottom'
      break
    }
    case 'center':
    default: {
      break
    }
  }
  return (
    <Container ref={ref}>
      <FullScreenImage
        imageEntity={backgroundImage}
        mobileImageEntity={mobileBgImage}
      />
      <PositionedTitle
        className={titleClassName}
        title={title}
        subtitle={subtitle}
      />
      <span onClick={onDownButtonClick}>
        <DownButton />
      </span>
    </Container>
  )
}

export default Leading
