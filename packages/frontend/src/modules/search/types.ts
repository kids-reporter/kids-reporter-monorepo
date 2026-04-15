import type { ContentType } from '@/constants'

/** Mirrors `SearchResult.nextQuery` from the search API. Keep in sync with `app/api/search/utils.ts`. */
export type SearchNextQuery = {
  q: string
  startIndex?: number
  count?: number
}

/** Default `num` for Custom Search — keep in sync with `defaultCount` in `app/api/search/utils.ts`. */
export const SEARCH_API_DEFAULT_COUNT = 10

export type SearchCardContent = {
  type: ContentType
  image?: string
  title?: string
  desc?: string
  publishedDate?: string
  url?: string
  category?: string
  subSubcategory?: string
  postCount: number
}

export type SearchCardItem = {
  content: SearchCardContent
}
