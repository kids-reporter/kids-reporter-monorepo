'use client'

import errors from '@twreporter/errors'
import axios from 'axios'
import { useState } from 'react'
import styled from 'styled-components'

import { AXIOS_TIMEOUT } from '@/utils'

import { CardProp, Cards } from './cards'

const LoadMoreBt = styled.div`
  color: #232323;
  font-size: 16px;
  font-weight: 700;
  line-height: 26px;

  border: 2px solid #27b5f7;
  border-radius: 30px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
  padding: 10px 60px;
  cursor: pointer;
`

const LoadingGif = styled.img`
  display: inline-block;
  max-width: 100px;
`

export const LoadMoreResults = ({
  currentCardItems,
  nextQuery: nextQueryParam,
}: {
  currentCardItems: CardProp[]
  nextQuery?: {
    q: string
    startIndex?: number
    count?: number
  }
}) => {
  const [cardItems, setCardItems] = useState(currentCardItems)
  const [nextQuery, setNextQuery] = useState(nextQueryParam)
  const [loadMoreError, setLoadMoreError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadMore = async () => {
    if (nextQuery) {
      const start = nextQuery.startIndex
      const count = nextQuery.count
      let axiosRes
      try {
        setIsLoading(true)
        axiosRes = await axios.get(
          `/api/search?q=${nextQuery.q}&start=${start}&count=${count}`,
          { timeout: AXIOS_TIMEOUT }
        )
      } catch (err) {
        setIsLoading(false)
        const annotatedError = errors.helpers.annotateAxiosError(err)
        setLoadMoreError(annotatedError)
        return
      }

      const items = axiosRes.data?.data?.items || []
      const _nextQuery = axiosRes.data?.data?.nextQuery
      if (Array.isArray(cardItems)) {
        setCardItems(cardItems.concat(items))
      }
      setNextQuery(_nextQuery)
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full text-center">
      <Cards items={cardItems} />
      {loadMoreError ? <span>載入發生錯誤，請稍候再試</span> : null}
      {nextQuery && !isLoading ? (
        <LoadMoreBt onClick={loadMore}>載入更多</LoadMoreBt>
      ) : null}
      {isLoading ? <LoadingGif src="/assets/images/loading.gif" /> : null}
    </div>
  )
}

export default {
  LoadMoreResults,
}
