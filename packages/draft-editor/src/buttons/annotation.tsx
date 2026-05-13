import { ENTITY } from '@kids-reporter/draft-renderer'
import { convertToRaw, EditorState, RichUtils } from 'draft-js'
import { useState } from 'react'

import { AnnotationEditor } from '../entity-decorators/annotation'
import { appendLinkCreateTrailingBuffer } from '../utils/link-trailing-buffer'

type AnnotationButtonProps = {
  className?: string
  isActive: boolean
  editorState: EditorState
  onChange: (arg0: EditorState) => void
  onEditStart: () => void
  onEditFinish: () => void
}

export const AnnotationButton = (props: AnnotationButtonProps) => {
  const toggleEntity = RichUtils.toggleLink
  const { isActive, editorState: editorStateOfOuterEditor, onChange } = props
  const [toShowInput, setToShowInput] = useState(false)

  const promptForAnnotation = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    const selection = editorStateOfOuterEditor.getSelection()
    if (!selection.isCollapsed()) {
      props.onEditStart()
      setToShowInput(true)
    }
  }

  const confirmAnnotation = (editorState: EditorState) => {
    const contentState = editorStateOfOuterEditor.getCurrentContent()
    const rawContentState = convertToRaw(editorState.getCurrentContent())
    const contentStateWithEntity = contentState.createEntity(
      ENTITY.Annotation,
      'MUTABLE',
      {
        rawContentState,
      }
    )
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey()
    const newEditorState = EditorState.set(editorStateOfOuterEditor, {
      currentContent: contentStateWithEntity,
    })

    let next = toggleEntity(
      newEditorState,
      newEditorState.getSelection(),
      entityKey
    )
    next = appendLinkCreateTrailingBuffer(next)
    onChange(next)

    setToShowInput(false)
    props.onEditFinish()
  }

  const removeAnnotation = () => {
    const selection = editorStateOfOuterEditor.getSelection()
    if (!selection.isCollapsed()) {
      onChange(toggleEntity(editorStateOfOuterEditor, selection, null))
    }
    setToShowInput(false)
    props.onEditFinish()
  }

  return (
    <>
      {toShowInput && (
        <AnnotationEditor
          isOpen={toShowInput}
          editorStateValue={EditorState.createEmpty()}
          onConfirm={confirmAnnotation}
          onCancel={removeAnnotation}
        />
      )}
      <div
        className={props.className}
        onMouseDown={isActive ? removeAnnotation : promptForAnnotation}
      >
        <i className="far"></i>
        <span>Annotation</span>
      </div>
    </>
  )
}
