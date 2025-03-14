export const articleIndexName = 'article-index'
export const authorIndexName = 'author-index'

export function getArticleObjectID(aritlceID: string, paragraphID: string) {
  return `article-${aritlceID}-paragraph-${paragraphID}`
}

export function getAuthorObjectID(authorID: string) {
  return `author-${authorID}`
}
