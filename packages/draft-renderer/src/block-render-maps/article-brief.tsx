import { DefaultDraftBlockRenderMap } from 'draft-js'
import Immutable from 'immutable'
import React from 'react'

import { List, Paragraph } from './article-content'

export const blockRenderMap = DefaultDraftBlockRenderMap.merge(
  Immutable.Map({
    'ordered-list-item': {
      element: 'li',
      wrapper: <List />,
    },
    'unordered-list-item': {
      element: 'li',
      wrapper: <List as="ul" />,
    },
    unstyled: {
      element: 'div',
      wrapper: <Paragraph />,
    },
  })
)
