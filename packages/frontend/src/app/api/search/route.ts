import errors from '@twreporter/errors'
import { NextResponse } from 'next/server'
import { PostCardProp } from '@/app/components/post-card'
import { Theme } from '@/app/constants'
import { customsearch } from '@googleapis/customsearch'
import { customsearch_v1 } from '@googleapis/customsearch/v1'
import { log, LogLevel } from '@/app/utils'

const client = customsearch('v1')
const apiKey = process.env.SEARCH_API_KEY || ''
const cx = process.env.SEARCH_ENGINE_ID || ''
export const defaultCount = 9
export const defaultStart = 1

type SearchResult = {
  nextQuery?: {
    count?: number
    startIndex?: number
    q: string
  }
  items: customsearch_v1.Schema$Result[]
}

export function transferItemsToPostCards(
  items: customsearch_v1.Schema$Result[]
): PostCardProp[] {
  if (!Array.isArray(items)) {
    return items
  }

  const cardItems: PostCardProp[] = []
  items.forEach((item) => {
    const metaTag = item?.pagemap?.metatags?.[0]
    const creativeWork = item?.pagemap?.creativework?.[0]
    const image = creativeWork?.image || metaTag?.['og:image']
    const title = creativeWork?.headline || metaTag?.['og:title']
    const desc = metaTag?.['og:description']
    const publishedDate = metaTag?.['publishedDate'] ?? ''
    const category = metaTag?.['category'] ?? ''
    const subSubcategory = metaTag?.['subSubcategory'] ?? ''
    const url = item?.link || metaTag?.['og:url']

    // @TODO: enable contentType filter when google crawler fetched new meta
    // const contentType = metaTag?.['contentType']
    // if (contentType === 'article' || 'topic') {
    cardItems.push({
      post: {
        image,
        title,
        desc,
        publishedDate,
        url,
        category, // category: contentType === 'topic' ? '專題' : category
        subSubcategory,
        theme: Theme.BLUE,
      },
      isSimple: false,
    })
    // }
  })

  return cardItems
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

function filterPostItems(items?: customsearch_v1.Schema$Result[]) {
  if (Array.isArray(items)) {
    return items.filter((item) => {
      const metaTag = item?.pagemap?.metatags?.[0]
      return metaTag?.['og:type'] === 'article'
    })
  }
  return items
}

export async function getPostOnlySearchResults({
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
    log(LogLevel.WARNING, msg)

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
  const items = filterPostItems(searchResults?.items)
  if (Array.isArray(items)) {
    _accItems = _accItems.concat(items)
    // repeatedly request API to get enough items
    if (_accItems.length < count && searchResults?.nextQuery) {
      const nextCount = searchResults.nextQuery.count
      const nextStart = searchResults.nextQuery.startIndex
      return getPostOnlySearchResults({
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
    items: _accItems,
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const startStr = searchParams.get('start') ?? ''
  const countStr = searchParams.get('count') ?? ''
  const postCardFormatStr = searchParams.get('post_card_format')

  const start = parseInt(startStr, 10) || defaultStart
  const count = parseInt(countStr, 10) || defaultCount
  const postCardFormat = postCardFormatStr !== 'false'

  if (!q) {
    return NextResponse.json({
      items: [],
    })
  }

  try {
    const searchResults = await getPostOnlySearchResults({
      cx,
      apiKey,
      q,
      start,
      count,
    })
    if (postCardFormat) {
      const items = transferItemsToPostCards(searchResults.items)
      return NextResponse.json({
        status: 'success',
        data: Object.assign(searchResults, { items }),
      })
    }

    return NextResponse.json({
      status: 'success',
      data: searchResults,
    })
  } catch (err) {
    const msg = errors.helpers.printAll(err, {
      withPayload: true,
      withStack: true,
    })
    log(LogLevel.WARNING, msg)

    return NextResponse.json(
      {
        status: 'error',
        message: errors.helper.printOne(err),
      },
      {
        status: 500,
      }
    )
  }
}
