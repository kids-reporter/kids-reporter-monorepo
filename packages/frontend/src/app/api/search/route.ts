import { emitStructured } from '@kids-reporter/logger'
import errors from '@twreporter/errors'
import { NextResponse } from 'next/server'

import envVars from '@/environment-variables'

import {
  defaultCount,
  defaultStart,
  getFilteredSearchResults,
  transferItemsToCards,
} from './utils'

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
    const searchResults = await getFilteredSearchResults({
      cx: envVars.searchEngineID,
      apiKey: envVars.searchAPIKey,
      q,
      start,
      count,
    })
    if (postCardFormat) {
      const items = await transferItemsToCards(
        searchResults.items,
        request.headers
      )
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
    emitStructured({ severity: 'WARNING', message: msg })

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
