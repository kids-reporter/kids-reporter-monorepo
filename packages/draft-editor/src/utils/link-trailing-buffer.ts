import { EditorState, Modifier } from 'draft-js'

/** Draft has no zero-length entity; ZWSP gives a neutral tail after a new link. */
const LINK_TRAILING_BUFFER = '\u200b'

/**
 * After toggleLink, collapse to range end and insert a zero-width buffer
 * without link entity so IME / typing can continue outside the link span.
 */
export function appendLinkCreateTrailingBuffer(
  editorState: EditorState
): EditorState {
  const sel = editorState.getSelection()
  const collapsed = sel.merge({
    anchorKey: sel.getEndKey(),
    anchorOffset: sel.getEndOffset(),
    focusKey: sel.getEndKey(),
    focusOffset: sel.getEndOffset(),
    isBackward: false,
  })

  const withSelection = EditorState.acceptSelection(editorState, collapsed)
  const content = Modifier.insertText(
    withSelection.getCurrentContent(),
    withSelection.getSelection(),
    LINK_TRAILING_BUFFER,
    withSelection.getCurrentInlineStyle(),
    undefined
  )

  return EditorState.push(withSelection, content, 'insert-characters')
}
