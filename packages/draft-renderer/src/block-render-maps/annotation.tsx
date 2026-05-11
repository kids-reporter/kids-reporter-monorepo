import { DefaultDraftBlockRenderMap } from 'draft-js'
import Immutable from 'immutable'
import React from 'react'
import styled from 'styled-components'

import { mediaQuery } from '../utils/media-query'
import { Atomic, Heading, List, Paragraph } from './article-content'

const HeadingForAnnotation = styled(Heading)`
  margin: 0 auto 40px auto;

  margin-bottom: 0px !important;

  ${mediaQuery.smallOnly} {
    padding-left: 0px;
    padding-right: 0px;
    margin-bottom: 0px !important;
  }
`

const ListForAnnotation = styled(List)`
  color: #575757;

  margin-bottom: 0px !important;

  ${mediaQuery.smallOnly} {
    padding-left: 0px;
    padding-right: 0px;
    margin-bottom: 0px !important;
  }
`

const ParagraphForAnnotation = styled(Paragraph)`
  color: #575757;

  > div[data-block='true'] {
    margin-bottom: 0px;
    ${mediaQuery.smallOnly} {
      margin-bottom: 0px;
    }
  }

  ${mediaQuery.smallOnly} {
    padding-left: 0px;
    padding-right: 0px;
  }
`

const _blockRenderMapForAnnotation = Immutable.Map({
  atomic: {
    element: 'figure',
    wrapper: <Atomic />,
  },
  'header-four': {
    element: 'h4',
    wrapper: <HeadingForAnnotation />,
  },
  'header-five': {
    element: 'h5',
    wrapper: <HeadingForAnnotation />,
  },
  'ordered-list-item': {
    element: 'li',
    wrapper: <ListForAnnotation />,
  },
  'unordered-list-item': {
    element: 'li',
    wrapper: <ListForAnnotation as="ul" />,
  },
  unstyled: {
    element: 'div',
    wrapper: <ParagraphForAnnotation />,
  },
})

export const blockRenderMap = DefaultDraftBlockRenderMap.merge(
  _blockRenderMapForAnnotation
)
