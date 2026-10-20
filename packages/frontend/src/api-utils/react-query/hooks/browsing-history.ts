'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import {
  type BrowsingHistoryType,
  createBrowsingHistoryContentApi,
  listBrowsingHistoriesContentApi,
} from '@/api/content-api/browsing-histories'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'

const MEMBER_BROWSING_HISTORIES_QUERY_KEY = 'member-browsing-histories'

function browsingHistoriesListKey(memberId: string) {
  return [MEMBER_BROWSING_HISTORIES_QUERY_KEY, memberId] as const
}

export function useMemberBrowsingHistoriesQuery({
  memberId,
  accessToken,
  take,
  skip,
}: {
  memberId?: string
  accessToken?: string
  take: number
  skip: number
}) {
  return useQuery({
    queryKey: useMemberBrowsingHistoriesQuery.getQueryKey(
      memberId ?? '',
      take,
      skip
    ),
    queryFn: () =>
      listBrowsingHistoriesContentApi({
        accessToken: accessToken!,
        take,
        skip,
      }),
    enabled: !!accessToken && !!memberId,
    placeholderData: (previous) => previous,
  })
}

useMemberBrowsingHistoriesQuery.getQueryKey = (
  memberId: string,
  take: number,
  skip: number
) => [MEMBER_BROWSING_HISTORIES_QUERY_KEY, memberId, take, skip] as const

useMemberBrowsingHistoriesQuery.listQueryKey = browsingHistoriesListKey

export function useRecordBrowsingHistory(
  type: BrowsingHistoryType,
  slug: string
) {
  const queryClient = useQueryClient()
  const { hydrated, member, tokens } = useHydratedAuthStore()
  const recordedRef = useRef<string | null>(null)
  const accessToken = tokens?.accessToken
  const expiresAt = tokens?.expiresAt
  const memberId = member?.id

  useEffect(() => {
    if (!hydrated || !memberId || !accessToken || !slug) return
    // AuthProvider refreshes an expired persisted token asynchronously. Skip the dedup key until then, or a 401 drops this visit.
    if (expiresAt && expiresAt <= Math.round(Date.now() / 1000)) return
    const key = `${type}:${slug}`
    if (recordedRef.current === key) return
    recordedRef.current = key
    // ponytail: server upsert ignores an existing row (refreshes visitedAt). A failed POST is dropped; the next visit retries.
    void createBrowsingHistoryContentApi({ type, slug }, accessToken)
      .then(() =>
        queryClient.invalidateQueries({
          queryKey: browsingHistoriesListKey(memberId),
        })
      )
      .catch(() => {})
  }, [accessToken, expiresAt, hydrated, memberId, queryClient, slug, type])
}

export function RecordBrowsingHistory({
  type,
  slug,
}: {
  type: BrowsingHistoryType
  slug: string
}) {
  useRecordBrowsingHistory(type, slug)
  return null
}
