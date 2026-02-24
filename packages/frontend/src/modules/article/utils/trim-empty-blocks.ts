import { RawDraftContentState } from 'draft-js'

function trimEmptyBlocks(raw: RawDraftContentState): RawDraftContentState {
  const { blocks, entityMap } = raw
  if (blocks.length === 0) return raw

  const filtered = blocks.filter(
    (block) => !(block.type === 'unstyled' && block.text.trim() === '')
  )
  if (filtered.length === blocks.length) return raw

  return { blocks: filtered, entityMap }
}

export default trimEmptyBlocks
