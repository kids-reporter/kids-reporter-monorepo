import {
  CompositeDecorator,
  ContentState,
  convertFromRaw,
  Editor,
  EditorState,
} from 'draft-js'
import { Fragment, useState } from 'react'
import styled from 'styled-components'

import blockRenderMaps from '../block-render-maps'
import { ENTITY, findEntitiesByType } from '../utils/entity'
import { anchorDecorator } from './anchor'
import { linkDecorator } from './link-decorator'
import { tocAnchorDecorator } from './toc-anchor'

const AnnotationWrapper = styled.span`
  display: inline-block;
  cursor: pointer;
  color: #27b3f5;
`

const AnnotationBody = styled.div`
  color: #575757;
  margin: 12px 0;
  border-top: 2px solid #27b3f5;
  background-color: #f8f8f8;
  padding: 24px 24px;

  & [data-contents='true'] {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
`

const ArrowIcon = styled.span<{ $showContent: boolean }>`
  margin: 0 3px;
  display: inline-block;
  vertical-align: middle;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
  position: relative;
  top: -1px;

  &::before {
    background-color: #27b3f5;
    content: '';
    width: 2px;
    height: 8px;
    top: 7.5px;
    right: 7.5px;
    transform: ${(props) =>
      props.$showContent ? 'rotate(-45deg)' : 'rotate(45deg)'};
    display: block;
    position: absolute;
    transition: transform 200ms ease 0s;
  }

  &::after {
    background-color: #27b3f5;
    content: '';
    width: 2px;
    height: 8px;
    top: 7.5px;
    left: 7.5px;
    transform: ${(props) =>
      props.$showContent ? 'rotate(45deg)' : 'rotate(-45deg)'};
    display: block;
    position: absolute;
    transition: transform 200ms ease 0s;
  }
`

function AnnotationBlock(props: {
  contentState: ContentState
  entityKey: string
  children: React.ReactNode
}) {
  const { children: annotated } = props
  const [showContent, setShowContent] = useState(false)
  const { rawContentState } = props.contentState
    .getEntity(props.entityKey)
    .getData()

  const contentState = convertFromRaw(rawContentState)
  const editorState = EditorState.createWithContent(
    contentState,
    new CompositeDecorator([linkDecorator, tocAnchorDecorator, anchorDecorator])
  )

  return (
    <Fragment>
      <AnnotationWrapper
        onClick={(e) => {
          e.preventDefault()
          setShowContent(!showContent)
        }}
      >
        <span>{annotated}</span>
        <ArrowIcon $showContent={showContent} />
      </AnnotationWrapper>
      {showContent ? (
        <AnnotationBody>
          <Editor
            editorState={editorState}
            blockRenderMap={blockRenderMaps.annotation}
            readOnly
            onChange={() => {}}
          />
        </AnnotationBody>
      ) : null}
    </Fragment>
  )
}

export const annotationDecorator = {
  strategy: findEntitiesByType(ENTITY.Annotation),
  component: AnnotationBlock,
}
