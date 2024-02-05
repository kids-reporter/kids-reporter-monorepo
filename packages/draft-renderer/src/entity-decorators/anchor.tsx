import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { ContentBlock, ContentState } from 'draft-js'
import { Drawer, DrawerController } from '@keystone-ui/modals'
import { TextInput } from '@keystone-ui/fields'

export const ANCHOR_ENTITY_TYPE = 'ANCHOR'

const AnchorWrapper = styled.span`
  display: inline;
  color: #27b5f7;
  &::before {
    content: '[';
  }
  &::after {
    content: ']';
  }
`

const AnchorEditButton = styled.div<{ anchorLabel: string }>`
  display: inline;
  cursor: pointer;
  &::before {
    content: '目錄:${(props) =>
      props.anchorLabel ? `(${props.anchorLabel}) ` : ''}';
  }
`

const TextInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`

const StyledTextInput = styled(TextInput)`
  margin: 10px;
`

const Label = styled.span`
  text-wrap: nowrap;
`

const findAnchorEntities = (
  contentBlock: ContentBlock,
  callback: (start: number, end: number) => void,
  contentState: ContentState
) => {
  contentBlock.findEntityRanges((character) => {
    const entityKey = character.getEntity()
    return (
      entityKey !== null &&
      contentState.getEntity(entityKey).getType() === ANCHOR_ENTITY_TYPE
    )
  }, callback)
}

const AnchorLabelEditor = (props: {
  isOpen: boolean
  anchorLabelValue: string
  onConfirm: (anchorLabel: string) => void
  onCancel: () => void
}) => {
  const { isOpen, anchorLabelValue, onConfirm, onCancel } = props
  const [anchorLabel, setTOCLabel] = useState(anchorLabelValue)

  return (
    <DrawerController isOpen={isOpen}>
      <Drawer
        title={'目錄'}
        actions={{
          cancel: {
            label: 'Cancel',
            action: () => {
              onCancel()
            },
          },
          confirm: {
            label: 'Confirm',
            action: () => onConfirm(anchorLabel),
          },
        }}
      >
        <TextInputContainer>
          <Label>目錄顯示文字</Label>
          <StyledTextInput
            placeholder="目錄內顯示文字"
            value={anchorLabel}
            onChange={(e) => {
              setTOCLabel(e.target.value)
            }}
            type="text"
          />
        </TextInputContainer>
      </Drawer>
    </DrawerController>
  )
}

const EditableAnchor = (props: {
  onEditStart: () => void
  onEditFinish: (arg0?: { entityKey?: string; entityData?: object }) => void
  decoratedText: string
  contentState: ContentState
  entityKey: string
  children: React.ReactNode
  blockKey: string
  start: number
  end: number
}) => {
  const { children, contentState, entityKey, blockKey, start, end } = props
  const tocContent = props.decoratedText
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [anchorLabel, setTOCLabel] = useState(
    contentState.getEntity(entityKey).getData()?.anchorLabel
  )

  useEffect(() => {
    setTOCLabel(contentState.getEntity(entityKey).getData()?.anchorLabel)
  })

  const onTOCLabelChange = (labelValue: string) => {
    setIsDrawerOpen(false)
    setTOCLabel(labelValue)
    props.onEditFinish({
      entityKey,
      entityData: {
        anchorID: `${blockKey}-${start}-${end}`,
        anchorLabel: labelValue,
      },
    })
  }

  return (
    <React.Fragment>
      {isDrawerOpen && (
        <AnchorLabelEditor
          isOpen={isDrawerOpen}
          anchorLabelValue={anchorLabel}
          onConfirm={onTOCLabelChange}
          onCancel={() => {
            setIsDrawerOpen(false)
            props.onEditFinish()
          }}
        />
      )}
      <AnchorWrapper>
        <AnchorEditButton
          anchorLabel={anchorLabel !== tocContent ? anchorLabel : ''}
          onClick={(e) => {
            e.preventDefault()
            setIsDrawerOpen(true)
            props.onEditStart()
          }}
        >
          <i className="fas fa-pen"></i>
        </AnchorEditButton>
        <span>{children}</span>
      </AnchorWrapper>
    </React.Fragment>
  )
}

const Anchor = (props: {
  decoratedText: string
  contentState: ContentState
  entityKey: string
  children: React.ReactNode
  blockKey: string
  start: number
  end: number
}) => {
  const { children, blockKey, start, end } = props
  const key = `${blockKey}-${start}-${end}`
  const anchorID = `anchor-${key}`
  const tocAnchorID = `toc-${key}`

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        const anchor = document.querySelector(`#${tocAnchorID}`)
        entry.isIntersecting
          ? anchor?.classList?.add('withinViewPort')
          : anchor?.classList?.remove('outOfViewPort')
      },
      {
        root: null,
        threshold: 0,
      }
    )

    observer.observe(document.querySelector(`#${anchorID}`) as Element)
  }, [])

  return <span id={anchorID}>{children}</span>
}

export const editableAnchorDecorator = {
  strategy: findAnchorEntities,
  component: EditableAnchor,
}

export const anchorDecorator = {
  strategy: findAnchorEntities,
  component: Anchor,
}
