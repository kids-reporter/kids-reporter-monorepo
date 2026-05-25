import type {
  GetAuthorPostsCountQuery,
  GetProjectRelatedPostsCountQuery,
  GetTagPostsQuery,
} from '__generated__/operations/content.generated'
import { customsearch } from '@googleapis/customsearch'
import { customsearch_v1 } from '@googleapis/customsearch/v1'
import { emitStructured } from '@kids-reporter/logger'
import errors from '@twreporter/errors'

import { getAuthorPostsCountContentApi } from '@/api/content-api/author-collection'
import { getProjectRelatedPostsCountContentApi } from '@/api/content-api/project-by-slug'
import { getTagPostsContentApi } from '@/api/content-api/tag-collection'
import { ContentType } from '@/constants'
import envVars from '@/environment-variables'
import type { SearchCardContent, SearchCardItem } from '@/modules/search/types'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

const client = customsearch('v1')
export const defaultCount = 10
export const defaultStart = 1

export type SearchResult = {
  nextQuery?: {
    count?: number
    startIndex?: number
    q: string
  }
  totalResults?: string
  items: customsearch_v1.Schema$Result[]
}

const validContentTypes = Object.values(ContentType)

export async function transferItemsToCards(
  items: customsearch_v1.Schema$Result[],
  traceHeaders?: Headers | Record<string, string | undefined>
): Promise<SearchCardItem[]> {
  if (!Array.isArray(items)) {
    return []
  }

  const cardItems = await Promise.all(
    items.map(async (item) => {
      const metaTag = item?.pagemap?.metatags?.[0]
      const contentType = metaTag?.['contenttype']

      if (!validContentTypes.includes(contentType)) {
        return null
      }

      const creativeWork = item?.pagemap?.creativework?.[0]
      const contentSummary: SearchCardContent = {
        type: contentType as ContentType,
        image: creativeWork?.image || metaTag?.['og:image'],
        title: creativeWork?.headline || metaTag?.['og:title'],
        desc: metaTag?.['og:description'],
        publishedDate: metaTag?.['publisheddate'] ?? '',
        url: item?.link || metaTag?.['og:url'],
        category: metaTag?.['category'] ?? '',
        subSubcategory: metaTag?.['subSubcategory'] ?? '',
        postCount: 0,
      }

      const url = item?.link || metaTag?.['og:url']
      const slug = url?.match(/(author|topic|tag)\/([^/]*)\/?/)?.[2]
      if (contentType === ContentType.TOPIC && slug) {
        contentSummary.category = '專題'
        let relatedPostsCount: number | undefined
        if (envVars.useContentApi) {
          try {
            const proj = await getProjectRelatedPostsCountContentApi({
              slug,
              traceHeaders,
            })
            relatedPostsCount = proj?.relatedPostsCount
          } catch (err) {
            logContentApiFallback('search-card-topic-post-count', err)
          }
        }
        if (relatedPostsCount === undefined) {
          const topicRes =
            await sendRestGqlRequest<GetProjectRelatedPostsCountQuery>({
              operation: 'project-related-posts-count',
              method: 'GET',
              variables: {
                where: {
                  slug: slug,
                },
              },
              traceHeaders,
            })
          relatedPostsCount =
            topicRes?.data?.data?.project?.relatedPostsCount ?? 0
        }
        contentSummary.postCount = relatedPostsCount
      } else if (contentType === ContentType.AUTHOR && slug) {
        contentSummary.category = '作者'
        let postsCount: number | undefined
        if (envVars.useContentApi) {
          try {
            const author = await getAuthorPostsCountContentApi({
              slug,
              traceHeaders,
            })
            postsCount = author?.postsCount
          } catch (err) {
            logContentApiFallback('search-card-author-post-count', err)
          }
        }
        if (postsCount === undefined) {
          const authorRes = await sendRestGqlRequest<GetAuthorPostsCountQuery>({
            operation: 'author-posts-count',
            method: 'GET',
            variables: {
              where: {
                slug: slug,
              },
            },
            traceHeaders,
          })
          postsCount = authorRes?.data?.data?.author?.postsCount ?? 0
        }
        contentSummary.postCount = postsCount
      } else if (contentType === ContentType.TAG && slug) {
        contentSummary.category = '標籤'
        let tagPostsCount: number | undefined
        let tagHeroSmall: string | undefined
        if (envVars.useContentApi) {
          try {
            const tag = await getTagPostsContentApi({
              slug,
              take: 1,
              orderBy: 'publishedDate:desc',
              traceHeaders,
            })
            tagPostsCount = tag.postsCount
            tagHeroSmall = tag.posts?.[0]?.heroImage?.resized?.small
          } catch (err) {
            logContentApiFallback('search-card-tag-posts', err)
          }
        }
        if (tagPostsCount === undefined) {
          const tagRes = await sendRestGqlRequest<GetTagPostsQuery>({
            operation: 'tag-posts',
            method: 'GET',
            variables: {
              where: {
                slug: slug,
              },
              take: 1,
              orderBy: {
                publishedDate: 'desc',
              },
            },
            traceHeaders,
          })
          tagPostsCount = tagRes?.data?.data?.tag?.postsCount ?? 0
          tagHeroSmall =
            tagRes?.data?.data?.tag?.posts?.[0]?.heroImage?.resized?.small
        }
        contentSummary.postCount = tagPostsCount
        contentSummary.image = tagHeroSmall
      }

      return { content: contentSummary }
    })
  )

  return cardItems.filter(
    (item): item is NonNullable<typeof item> => item !== null
  )
}

async function getSearchResults({
  cx,
  apiKey,
  q,
  start = defaultStart,
  count = defaultCount,
}: {
  cx: string
  apiKey: string
  q: string
  start?: number
  count?: number
}) {
  let searchRes
  try {
    searchRes = await client.cse.list({
      cx,
      q,
      auth: apiKey,
      start,
      num: count,
    })
  } catch (err) {
    const annotatedError = errors.helpers.wrap(
      errors.helpers.annotateAxiosError(err),
      'SearchAPIError',
      'Errors occured in quering Google Custom Search JSON API',
      { q, start, num: count }
    )
    throw annotatedError
  }

  if (!searchRes) {
    return {
      nextQuery: undefined,
      items: [],
    }
  }

  const nextPage = searchRes.data.queries?.nextPage?.[0]
  const nextQuery = nextPage
    ? {
        startIndex: nextPage.startIndex,
        count: nextPage.count,
        totalResults: nextPage.totalResults,
        q,
      }
    : undefined

  const items = searchRes?.data?.items ?? []

  return {
    // if `data.nextQuery` is `undefined`,
    // and then it means there is no more items to load.
    nextQuery,
    items,
  }
}

const filterItems = (items?: customsearch_v1.Schema$Result[]) => {
  return Array.isArray(items)
    ? items.filter((item) => {
        const contentType = item?.pagemap?.metatags?.[0]?.['contenttype']
        return validContentTypes.includes(contentType)
      })
    : items
}

export async function getFilteredSearchResults({
  cx,
  apiKey,
  q,
  start = defaultStart,
  count = defaultCount,
  accumulatedItems = [],
}: {
  cx: string
  apiKey: string
  q: string
  start?: number
  count?: number
  accumulatedItems?: customsearch_v1.Schema$Result[]
}): Promise<SearchResult> {
  let searchResults
  try {
    searchResults = await getSearchResults({
      cx,
      apiKey,
      q,
      start,
      count,
    })
  } catch (err) {
    const msg = errors.helpers.printAll(
      err,
      { withStack: true, withPayload: true },
      0,
      0
    )
    emitStructured({ severity: 'WARNING', message: msg })

    // Return accumulated items for workaround.
    // Google Custom Search JSON API sometimes returns different results,
    // such as `nextPage` information, for the same request API arguments.
    // Therefore, we might encounter some unexpected errors.
    // For example, `nexPage` contains `count` and `start` fields, and we take
    // those fields to query API, but the API returns error response as no further items could be requested.
    return {
      items: accumulatedItems,
    }
  }
  let _accItems = accumulatedItems
  const items = filterItems(searchResults?.items)
  if (Array.isArray(items)) {
    _accItems = _accItems.concat(items)
    // repeatedly request API to get enough items
    if (_accItems.length < count && searchResults?.nextQuery) {
      const nextCount = searchResults.nextQuery.count
      const nextStart = searchResults.nextQuery.startIndex
      return getFilteredSearchResults({
        cx,
        apiKey,
        q,
        start: nextStart,
        count: nextCount,
        accumulatedItems: _accItems,
      })
    }
  }

  return {
    nextQuery: searchResults.nextQuery,
    totalResults: searchResults.nextQuery?.totalResults,
    items: _accItems,
  }
}
