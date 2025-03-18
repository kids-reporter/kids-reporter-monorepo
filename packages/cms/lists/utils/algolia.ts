import { RawDraftContentState } from 'draft-js'

export const articleIndexName = 'article-index'
export const authorIndexName = 'author-index'
export const topicIndexName = 'topic-index'

export function getArticleObjectID(aritlceID: string, paragraphID: string) {
  return `article-${aritlceID}-paragraph-${paragraphID}`
}

export function getAuthorObjectID(authorID: string) {
  return `author-${authorID}`
}

export function getTopicObjectID(topicID: string, paragraphID: string) {
  return `topic-${topicID}-paragraph-${paragraphID}`
}

// Extract texts from draftjs object.
export function convertDraftToText(draftRawData?: RawDraftContentState) {
  const blocks = draftRawData?.blocks || []
  const entityMap = draftRawData?.entityMap || {}

  const contentText: string[] = []

  blocks.forEach((block) => {
    let text = block.text || ''

    // convert inline entity, such as ANNOTATION entity
    if (block.entityRanges && block.entityRanges.length > 0) {
      //  + entity
      let resultText = ''
      let lastOffset = 0

      block.entityRanges.forEach(({ offset, length, key }) => {
        const entity = entityMap[key]
        if (!entity) {
          return
        }

        // Append plain text before the entity
        resultText += text.slice(lastOffset, offset)

        // Get the text covered by the entity
        const entityText = text.slice(offset, offset + length)

        if (entity.type === 'ANNOTATION') {
          const rawContentState = entity.data?.rawContentState
          const _text = convertDraftToText(rawContentState)
          resultText += `${entityText} (${_text})`
        } else {
          // If it's an unknown entity type, keep the text as is
          resultText += entityText
        }

        lastOffset = offset + length
      })

      // Move the cursor forward
      resultText += text.slice(lastOffset)

      text = resultText
    }

    // ----- Handle Atomic Blocks -----
    if (block.type === 'atomic') {
      const entityKey =
        block.entityRanges.length > 0 ? block.entityRanges[0].key : null
      const entity = entityKey !== null ? entityMap[entityKey] : null

      if (entity) {
        const entityType = entity.type.toUpperCase()

        // Convert atomic blocks into plain text descriptions
        switch (entityType) {
          case 'INFOBOX': {
            const rawContentState = entity.data?.rawContentState
            text = convertDraftToText(rawContentState)
            break
          }
          case 'BLOCKQUOTE': {
            text = entity.data?.text
            break
          }
        }
      }
    }

    contentText.push(text)
  })

  return contentText.join('\n')
}

// split long text into different chunks
export function splitText(text: string, maxChars = 1500) {
  // separate long text into paragraphs
  const paragraphs = text
    .split(/\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)

  const chunks: string[] = []
  let currentChunk = ''

  paragraphs.forEach((paragraph) => {
    // if the length of currentChunk + paragraph is less than maxChars,
    // and then concat currentChunk and paragraph
    if ((currentChunk + paragraph).length <= maxChars) {
      currentChunk = currentChunk + paragraph
    } else {
      // otherwise, push currentChunk into chunks
      if (currentChunk) {
        chunks.push(currentChunk)
      }
      currentChunk = paragraph
    }
  })

  // push the last one currentChunk
  if (currentChunk) {
    chunks.push(currentChunk)
  }

  return chunks
}
