import { DefaultDraftBlockRenderMap } from 'draft-js'
import Immutable from 'immutable'
import React from 'react'
import styled, { css } from 'styled-components'

import { mediaQuery } from '../utils/media-query'
import { Atomic, Heading, List, Paragraph } from './article-content'

const HeadingForInfoBox = styled(Heading)`
  margin-top: 0px;
  margin-bottom: 16px;
  ${mediaQuery.smallOnly} {
    padding-left: 0px;
    padding-right: 0px;
  }

  ${mediaQuery.mediumAbove} {
    margin-bottom: 24px;

    &:has(h5) {
      margin-bottom: 16px;
    }
  }
`

const ListForInfoBox = styled(List)`
  margin-bottom: 16px;
  &:last-child {
    margin-bottom: 0px;
  }

  ${mediaQuery.mediumAbove} {
    margin-bottom: 24px;
    &:last-child {
      margin-bottom: 0px;
    }
  }

  color: #232323;
  li {
    font-size: ${({ theme }) =>
      theme?.fontSizeLevel === 'large' ? '20px' : '16px'};
    line-height: 1.5;
  }
`

const ParagraphForInfoBox = styled(Paragraph)`
  /* overwrite css */
  font-size: ${({ theme }) =>
    theme?.fontSizeLevel === 'large' ? '20px' : '16px'};
  font-weight: 400;
  margin-bottom: 16px;
  line-height: 1.5;
  color: #232323;

  &:last-child {
    margin-bottom: 0px;
  }

  ${mediaQuery.smallOnly} {
    padding-left: 0px;
    padding-right: 0px;
  }

  ${mediaQuery.mediumAbove} {
    margin-bottom: 24px;
    &:last-child {
      margin-bottom: 0px;
    }
  }

  > div[data-block='true'] {
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0px;
    }
  }

  ${mediaQuery.mediumAbove} {
    > div[data-block='true'] {
      margin-bottom: 24px;
      &:last-child {
        margin-bottom: 0px;
      }
    }
  }
`

export const InfoBoxAtomic = styled(Atomic)`
  & figcaption {
    text-align: center;
    border-bottom: none;
    position: relative;
    left: auto;
    bottom: auto;
    padding: 8px 0 0 0;
  }
`
const _blockRenderMapForAnnotation = Immutable.Map({
  atomic: {
    element: 'div',
    wrapper: <InfoBoxAtomic />,
  },
  'header-four': {
    element: 'h4',
    wrapper: <HeadingForInfoBox />,
  },
  'header-five': {
    element: 'h5',
    wrapper: <HeadingForInfoBox />,
  },
  'ordered-list-item': {
    element: 'li',
    wrapper: <ListForInfoBox />,
  },
  'unordered-list-item': {
    element: 'li',
    wrapper: <ListForInfoBox as="ul" />,
  },
  unstyled: {
    element: 'div',
    wrapper: <ParagraphForInfoBox />,
  },
})

export const blockRenderMap = DefaultDraftBlockRenderMap.merge(
  _blockRenderMapForAnnotation
)

const dividerStyles = css`
  content: '';
  width: 100%;
  height: 12px;
  display: block;
  background-image: url(https://www.unpkg.com/@kids-reporter/draft-renderer/public/images/info-box-border.svg);
  background-repeat: no-repeat;
  background-position: center;
`

const HeadingForInfoBoxWithHeaderBorder = styled(HeadingForInfoBox)`
  h4 {
    margin-top: 12px;
    margin-bottom: 12px;
  }

  &::before {
    ${dividerStyles}
  }

  &::after {
    ${dividerStyles}
  }
`

export const blockRenderMapForInfoBoxWithHeaderBorder = blockRenderMap.merge(
  Immutable.Map({
    'header-four': {
      element: 'h4',
      wrapper: <HeadingForInfoBoxWithHeaderBorder />,
    },
  })
)
