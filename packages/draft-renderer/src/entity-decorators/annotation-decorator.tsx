import React, { useState } from 'react'
import styled from 'styled-components'
import {
  CompositeDecorator,
  ContentState,
  Editor,
  EditorState,
  convertFromRaw,
} from 'draft-js'
import blockRenderMaps from '../block-render-maps'
import { linkDecorator } from './link-decorator'
import { tocAnchorDecorator } from './toc-anchor'
import { anchorDecorator } from './anchor'
import { ENTITY, findEntitiesByType } from '../utils/entity'

const AnnotationWrapper = styled.span`
  display: inline-block;
  cursor: pointer;
  color: #27b5f7;
`

const AnnotationBody = styled.div`
  color: #494949;
  margin-bottom: 10px;
  border-top: 2px solid #27b5f7;
  background-color: #fff;
  padding: 25px 25px;
`

const ArrowIcon = styled.span<{ $showContent: boolean }>`
  margin-left: 3px;
  display: inline-block;
  vertical-align: middle;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border-width: 1px;
  border-style: solid;
  position: relative;
  top: -1px;

  &::before {
    background-color: #27b5f7;
    content: '';
    width: 2px;
    height: 6.5px;
    top: 5px;
    right: 5px;
    transform: ${(props) =>
      props.$showContent ? 'rotate(-45deg)' : 'rotate(45deg)'};
    display: block;
    position: absolute;
    transition: transform 200ms ease 0s;
  }

  &::after {
    background-color: #27b5f7;
    content: '';
    width: 2px;
    height: 6.5px;
    top: 5px;
    left: 5px;
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
    <React.Fragment>
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
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            onChange={() => {}}
          />
        </AnnotationBody>
      ) : null}
    </React.Fragment>
  )
}

export const annotationDecorator = {
  strategy: findEntitiesByType(ENTITY.Annotation),
  component: AnnotationBlock,
}
