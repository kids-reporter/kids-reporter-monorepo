import { emitStructured } from '@kids-reporter/logger'
import errors from '@twreporter/errors'
import type { Metadata } from 'next'

import {
  defaultCount,
  defaultStart,
  getFilteredSearchResults,
  SearchResult,
  transferItemsToCards,
} from '@/app/api/search/utils'
import {
  ContentType,
  EMAIL,
  GENERAL_DESCRIPTION,
  KIDS_URL_ORIGIN,
  OG_SUFFIX,
} from '@/constants'
import envVars from '@/environment-variables'
import SearchModule from '@/modules/search'

// Filtering search output: https://developers.google.com/custom-search/docs/structured_search
const filterParams = Object.values(ContentType)
  .map((type) => `more:pagemap:metatags-contenttype:${type}`)
  .join(' OR ')

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string }
}): Promise<Metadata> {
  const q = (
    Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q
  )?.trim()
  const title = q ? `搜尋「${q}」 - ${OG_SUFFIX}` : `搜尋 - ${OG_SUFFIX}`
  const description = q ? `搜尋「${q}」的結果。` : GENERAL_DESCRIPTION

  return {
    title,
    description,
    alternates: {
      canonical: q
        ? `${KIDS_URL_ORIGIN}/search?q=${encodeURIComponent(q)}`
        : `${KIDS_URL_ORIGIN}/search`,
    },
    openGraph: {
      title,
      description,
    },
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: {
    q: string
  }
}) {
  if (!searchParams.q) {
    return (
      <SearchModule
        query=""
        cardItems={[]}
        emptyState={
          <h1 className="mt-20 text-center prose-h3-small text-neutral-900 md:prose-h3-large">
            請輸入要搜尋的字串。
          </h1>
        }
      />
    )
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
    emitStructured({ severity: 'WARNING', message: msg })
    return (
      <SearchModule
        query={searchParams.q}
        cardItems={[]}
        emptyState={
          <h1 className="mt-20 text-center prose-h3-small text-neutral-900 md:prose-h3-large">
            搜尋結果服務異常，請稍候再試。 若持續發生，煩請來信至{EMAIL}。
          </h1>
        }
      />
    )
  }

  const cardItems = Array.isArray(data?.items)
    ? await transferItemsToCards(data.items)
    : []

  const apiQuery = `${searchParams.q} (${filterParams})`

  return (
    <SearchModule
      query={searchParams.q}
      totalResults={data?.totalResults}
      cardItems={cardItems}
      nextQuery={data?.nextQuery}
      initialPageRequest={{
        q: apiQuery,
        start: defaultStart,
        count: defaultCount,
      }}
      emptyState={
        <p className="pt-8 text-center prose-p1 text-neutral-600">
          沒有找到結果
        </p>
      }
    />
  )
}
