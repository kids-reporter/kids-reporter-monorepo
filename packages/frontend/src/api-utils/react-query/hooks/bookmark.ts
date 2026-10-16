'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useRef } from 'react'
import { type ExternalToast, toast } from 'sonner'

import {
  type BookmarkLookup,
  type BookmarkType,
  createBookmarkContentApi,
  deleteBookmarkContentApi,
  getBookmarkBySlugContentApi,
  listBookmarksContentApi,
} from '@/api/content-api/bookmarks'
import { ContentApiRequestError } from '@/utils/send-content-api'

import {
  bookmarkQueryKey,
  isDeletableBookmarkId,
  OPTIMISTIC_BOOKMARK_ID,
  rollbackBookmarkCache,
} from './bookmark-cache'

const BOOKMARKED_TOAST: Record<BookmarkType, string> = {
  post: '已收藏此文章',
  project: '已收藏此專題',
}

const MEMBER_BOOKMARKS_QUERY_KEY = 'member-bookmarks'

function memberBookmarksListKey(memberId: string) {
  return [MEMBER_BOOKMARKS_QUERY_KEY, memberId] as const
}

export function useBookmarkQuery({
  type,
  slug,
  memberId,
  accessToken,
  enabled,
}: {
  type: BookmarkType
  slug: string
  memberId?: string
  accessToken?: string
  enabled: boolean
}) {
  return useQuery({
    queryKey: useBookmarkQuery.getQueryKey(type, slug, memberId ?? ''),
    queryFn: () =>
      getBookmarkBySlugContentApi({
        accessToken: accessToken!,
        type,
        slug,
      }),
    enabled: enabled && !!accessToken && !!slug && !!memberId,
  })
}

useBookmarkQuery.getQueryKey = (
  type: BookmarkType,
  slug: string,
  memberId: string
) => bookmarkQueryKey(memberId, type, slug)

export function useToggleBookmark({
  type,
  slug,
  memberId,
  accessToken,
  enabled,
  toastOptions,
}: {
  type: BookmarkType
  slug: string
  memberId?: string
  accessToken?: string
  enabled: boolean
  toastOptions?: ExternalToast
}) {
  const queryClient = useQueryClient()
  const toggleLockRef = useRef(false)
  const queryKey = useBookmarkQuery.getQueryKey(type, slug, memberId ?? '')
  const bookmarkedToast = BOOKMARKED_TOAST[type]

  const query = useBookmarkQuery({
    type,
    slug,
    memberId,
    accessToken,
    enabled,
  })

  const createMutation = useMutation({
    mutationFn: () => createBookmarkContentApi({ type, slug }, accessToken!),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBookmarkContentApi(id, accessToken!),
  })

  const toggle = useCallback(async () => {
    if (
      !accessToken ||
      !memberId ||
      toggleLockRef.current ||
      createMutation.isPending ||
      deleteMutation.isPending ||
      queryClient.getQueryState(queryKey)?.status === 'pending'
    ) {
      return
    }

    const current = queryClient.getQueryData<BookmarkLookup | null>(queryKey)
    const isBookmarked = !!current?.id

    toggleLockRef.current = true
    await queryClient.cancelQueries({ queryKey })
    const previous = current

    try {
      if (isBookmarked && current) {
        if (!isDeletableBookmarkId(current.id)) {
          await queryClient.invalidateQueries({ queryKey })
          return
        }
        queryClient.setQueryData<BookmarkLookup | null>(queryKey, null)
        await deleteMutation.mutateAsync(current.id)
        toast.success('已取消收藏', toastOptions)
      } else {
        queryClient.setQueryData<BookmarkLookup | null>(queryKey, {
          id: OPTIMISTIC_BOOKMARK_ID,
        })
        try {
          const created = await createMutation.mutateAsync()
          queryClient.setQueryData<BookmarkLookup | null>(queryKey, {
            id: created.id,
          })
        } catch (error) {
          // Already saved on server — refresh real id
          if (error instanceof ContentApiRequestError && error.status === 409) {
            await queryClient.invalidateQueries({ queryKey })
            await queryClient.invalidateQueries({
              queryKey: memberBookmarksListKey(memberId),
            })
            toast.success(bookmarkedToast, toastOptions)
            return
          }
          throw error
        }
        toast.success(bookmarkedToast, toastOptions)
      }
      await queryClient.invalidateQueries({
        queryKey: memberBookmarksListKey(memberId),
      })
    } catch {
      queryClient.setQueryData(queryKey, rollbackBookmarkCache(previous))
    } finally {
      toggleLockRef.current = false
    }
  }, [
    accessToken,
    bookmarkedToast,
    createMutation,
    deleteMutation,
    memberId,
    queryClient,
    queryKey,
    toastOptions,
  ])

  return {
    isBookmarked: !!query.data?.id,
    isLoading: query.isLoading,
    isPending: createMutation.isPending || deleteMutation.isPending,
    toggle,
  }
}

export function useMemberBookmarksQuery({
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
    queryKey: useMemberBookmarksQuery.getQueryKey(memberId ?? '', take, skip),
    queryFn: () =>
      listBookmarksContentApi({
        accessToken: accessToken!,
        take,
        skip,
      }),
    enabled: !!accessToken && !!memberId,
    placeholderData: (previous) => previous,
  })
}

useMemberBookmarksQuery.getQueryKey = (
  memberId: string,
  take: number,
  skip: number
) => [MEMBER_BOOKMARKS_QUERY_KEY, memberId, take, skip] as const

useMemberBookmarksQuery.listQueryKey = memberBookmarksListKey

export function useTogglePostBookmark({
  postSlug,
  memberId,
  accessToken,
  enabled,
  toastOptions,
}: {
  postSlug: string
  memberId?: string
  accessToken?: string
  enabled: boolean
  toastOptions?: ExternalToast
}) {
  return useToggleBookmark({
    type: 'post',
    slug: postSlug,
    memberId,
    accessToken,
    enabled,
    toastOptions,
  })
}
