import errors from '@twreporter/errors'

import {
  defaultCount,
  getFilteredSearchResults,
  SearchResult,
  transferItemsToCards,
} from '@/app/api/search/utils'
import { ContentType, EMAIL } from '@/constants'
import envVars from '@/environment-variables'
import { log, LogLevel } from '@/utils'

import { LoadMoreResults } from '../_components/search/load-more-results'
import { SearchInput } from '../_components/search/search-input'
import { SearchTitle } from '../_components/search/styled'

// Filtering search output: https://developers.google.com/custom-search/docs/structured_search
const filterParams = Object.values(ContentType)
  .map((type) => `more:pagemap:metatags-contenttype:${type}`)
  .join(' OR ')

export default async function SearchPage({
  searchParams,
}: {
  searchParams: {
    q: string
  }
}) {
  if (!searchParams.q) {
    return <SearchTitle>請輸入要搜尋的字串。</SearchTitle>
  }

  let data: SearchResult | undefined

  try {
    data = await getFilteredSearchResults({
      q: `${searchParams.q} ${filterParams}`,
      apiKey: envVars.searchAPIKey,
      cx: envVars.searchEngineID,
      start: 1,
      count: defaultCount,
    })
  } catch (err) {
    const msg = errors.helpers.printAll(
      err,
      { withStack: true, withPayload: true },
      0,
      0
    )
    log(LogLevel.WARNING, msg)
    return (
      <SearchTitle>
        搜尋結果服務異常，請稍候再試。 若持續發生，煩請來信至
        {EMAIL}。
      </SearchTitle>
    )
  }

  const searchImg = (
    <img
      className="px-3 md:px-4"
      src="/assets/images/search-result.png"
      loading="lazy"
    />
  )

  const resultCount = data?.totalResults && (
    <p
      style={{ letterSpacing: '0.08em', color: '#595959' }}
      className="w-full border-t-2 border-gray-200 pt-4 text-left text-sm font-medium"
    >
      找到 {data.totalResults} 項結果
    </p>
  )

  const cardItems = Array.isArray(data?.items)
    ? await transferItemsToCards(data.items)
    : []

  return (
    <div className="mx-auto flex max-w-full flex-col items-center justify-center px-4 pt-8 md:max-w-2xl xl:max-w-4xl">
      {searchImg}
      <SearchInput value={searchParams.q} />
      {resultCount}
      <LoadMoreResults
        currentCardItems={cardItems}
        nextQuery={data.nextQuery}
      />
    </div>
  )
}
