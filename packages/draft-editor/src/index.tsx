import React from 'react'

import { FontStyler } from './block-renderers/styled'
import buttonNames from './buttons/bt-names'
import { editableAnchorDecorator } from './entity-decorators/anchor'
import { editableAnnotationDecorator } from './entity-decorators/annotation'
import { editableLinkDecorator } from './entity-decorators/link'
import { editableTOCAnchorDecorator } from './entity-decorators/toc-anchor'
import {
  RichTextEditor as _RichTextEditor,
  RichTextEditorWithoutDecoratorProps,
} from './rich-text-editor'

const RichTextEditor = (props: RichTextEditorWithoutDecoratorProps) => {
  return (
    <FontStyler>
      <_RichTextEditor
        decorators={[
          editableAnnotationDecorator,
          editableLinkDecorator,
          editableTOCAnchorDecorator,
          editableAnchorDecorator,
        ]}
        {...props}
      />
    </FontStyler>
  )
}

export { buttonNames, RichTextEditor }

export default {
  RichTextEditor,
  buttonNames,
}
