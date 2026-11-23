import type { RawDraftContentState } from 'draft-js'

type Block = RawDraftContentState['blocks'][number]

function isEmptyBlock(block: Block): boolean {
  return (
    block.type === 'unstyled' &&
    block.text.trim() === '' &&
    block.entityRanges.length === 0
  )
}

function trimEmptyBlocks(raw: RawDraftContentState): RawDraftContentState {
  const { blocks, entityMap } = raw
  let start = 0
  let end = blocks.length
  while (start < end && isEmptyBlock(blocks[start])) start++
  while (end > start && isEmptyBlock(blocks[end - 1])) end--
  if (start === 0 && end === blocks.length) return raw

  return { blocks: blocks.slice(start, end), entityMap }
}

export default trimEmptyBlocks
