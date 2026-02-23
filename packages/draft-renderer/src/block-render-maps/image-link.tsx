import { DefaultDraftBlockRenderMap } from 'draft-js'
import Immutable from 'immutable'
import React from 'react'
import styled from 'styled-components'

import { mediaQuery } from '../utils/media-query'
import { Atomic, Paragraph } from './article-content'

const ParagraphForImageLink = styled(Paragraph)`
  /* overwrite css */
  font-size: ${({ theme }) =>
    theme?.fontSizeLevel === 'large' ? '18px' : '14px'};
  margin: 0;
  text-align: left;
  max-width: 100%;

  ${mediaQuery.smallOnly} {
    padding-left: 0px;
    padding-right: 0px;
  }

  > div[data-block='true'] {
    margin-bottom: 0px;
  }
`

const _blockRenderMapForAnnotation = Immutable.Map({
  atomic: {
    element: 'div',
    wrapper: <Atomic />,
  },
  unstyled: {
    element: 'div',
    wrapper: <ParagraphForImageLink />,
  },
})

export const blockRenderMap = DefaultDraftBlockRenderMap.merge(
  _blockRenderMapForAnnotation
)
