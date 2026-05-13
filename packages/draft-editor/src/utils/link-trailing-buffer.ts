import { EditorState, Modifier } from 'draft-js'

/** Draft has no zero-length entity; ZWSP gives a neutral tail after a new mutable inline span. */
const LINK_TRAILING_BUFFER = '\u200b'

/**
 * After toggleLink (link, annotation, etc.), collapse to range end and insert
 * a zero-width buffer without inline entity so IME / typing can continue outside the span.
 * Skips insertion when a ZWSP already sits at the insertion point, or the caret
 * is after a trailing ZWSP at block end (avoids accumulation on repeat apply).
 */
export function appendLinkCreateTrailingBuffer(
  editorState: EditorState
): EditorState {
  const sel = editorState.getSelection()
  const endKey = sel.getEndKey()
  const endOffset = sel.getEndOffset()
  const block = editorState.getCurrentContent().getBlockForKey(endKey)
  const text = block.getText()
  const nextIsZwsp =
    endOffset < text.length && text.charAt(endOffset) === LINK_TRAILING_BUFFER
  const atBlockEndAfterZwsp =
    endOffset === text.length &&
    endOffset > 0 &&
    text.charAt(endOffset - 1) === LINK_TRAILING_BUFFER
  if (nextIsZwsp || atBlockEndAfterZwsp) {
    return editorState
  }

  const collapsed = sel.merge({
    anchorKey: endKey,
    anchorOffset: endOffset,
    focusKey: endKey,
    focusOffset: endOffset,
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
