import type { RawDraftContentState } from 'draft-js'
import { describe, expect, it } from 'vitest'

import trimEmptyBlocks from './trim-empty-blocks'

type Block = RawDraftContentState['blocks'][number]

let key = 0

function block(
  text: string,
  type: Block['type'] = 'unstyled',
  entityRanges: Block['entityRanges'] = []
): Block {
  key += 1
  return {
    key: String(key),
    text,
    type,
    depth: 0,
    inlineStyleRanges: [],
    entityRanges,
  }
}

function raw(...blocks: Block[]): RawDraftContentState {
  return { blocks, entityMap: {} }
}

describe('trimEmptyBlocks', () => {
  it('drops leading and trailing blanks and keeps internal runs, including around images', () => {
    const content = block('A')
    const gap = [block(''), block('  ')]
    const image = block('', 'atomic')
    const afterImage = block('')
    const ending = block('B')

    const result = trimEmptyBlocks(
      raw(
        block(''),
        block(''),
        content,
        ...gap,
        image,
        afterImage,
        ending,
        block('')
      )
    )

    expect(result.blocks).toEqual([content, ...gap, image, afterImage, ending])
  })

  it('returns no blocks when every block is empty', () => {
    const result = trimEmptyBlocks(raw(block(''), block(' \n ')))

    expect(result).toEqual({ blocks: [], entityMap: {} })
  })

  it('returns the same object when nothing is trimmed', () => {
    const input = raw(block('A'), block(''), block('B'))

    expect(trimEmptyBlocks(input)).toBe(input)
  })
})
