import type { QueryClient, QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'

import { deleteBookmarkContentApi } from '@/api/content-api/bookmarks'
import { useMemberBookmarksQuery } from '@/api-utils/react-query/hooks/bookmark'
import { bookmarkQueryKey } from '@/api-utils/react-query/hooks/bookmark-cache'
import type { MemberBookmarksResponse } from '@/types/api'

const unsaveToastOptions = {
  className: 'shadow-custom! gap-5!',
  actionButtonStyle: {
    background: 'transparent',
    border: 'none',
    borderRadius: 0,
    color: 'inherit',
    fontSize: 14,
    fontWeight: 700,
    height: 'auto',
    marginLeft: 0,
    padding: 0,
    textDecoration: 'underline',
  },
  classNames: {
    content: 'overflow-visible!',
    title: 'overflow-visible! whitespace-nowrap!',
  },
} as const

export function requestUnsaveBookmark({
  item,
  accessToken,
  memberId,
  queryClient,
  listQueryKey,
  onFinished,
}: {
  item: { id: string; type: 'post' | 'project'; slug: string }
  accessToken: string
  memberId: string
  queryClient: QueryClient
  listQueryKey: QueryKey
  onFinished: () => void
}) {
  let undone = false
  let settled = false
  const confirmDelete = () => {
    if (undone || settled) return
    settled = true
    void (async () => {
      try {
        await deleteBookmarkContentApi(item.id, accessToken)
        queryClient.setQueryData(
          bookmarkQueryKey(memberId, item.type, item.slug),
          null
        )
        queryClient.setQueryData<MemberBookmarksResponse>(
          listQueryKey,
          (current) => {
            if (
              !current ||
              !current.bookmarks.some((row) => row.id === item.id)
            ) {
              return current
            }
            return {
              bookmarks: current.bookmarks.filter((row) => row.id !== item.id),
              bookmarksCount: Math.max(0, current.bookmarksCount - 1),
            }
          }
        )
        await queryClient.invalidateQueries({
          queryKey: useMemberBookmarksQuery.listQueryKey(memberId),
        })
      } catch {
        toast.error('取消收藏失敗')
      } finally {
        onFinished()
      }
    })()
  }

  toast.success('已取消收藏', {
    action: {
      label: '復原',
      onClick: () => {
        undone = true
        settled = true
        onFinished()
      },
    },
    onDismiss: confirmDelete,
    onAutoClose: confirmDelete,
    ...unsaveToastOptions,
  })
}
