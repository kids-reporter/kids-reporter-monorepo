'use client'

import {
  Button,
  cn,
  HeaderMobileBackButtonHrefSetter,
} from '@kids-reporter/routing-ui'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import {
  type BookmarkLookup,
  createBookmarkContentApi,
  deleteBookmarkContentApi,
} from '@/api/content-api/bookmarks'
import {
  useBookmarkQuery,
  useMemberBookmarksQuery,
} from '@/api-utils/react-query/hooks/bookmark'
import {
  bookmarkQueryKey,
  isDeletableBookmarkId,
  OPTIMISTIC_BOOKMARK_ID,
  rollbackBookmarkCache,
} from '@/api-utils/react-query/hooks/bookmark-cache'
import { useMemberBrowsingHistoriesQuery } from '@/api-utils/react-query/hooks/browsing-history'
import ImageWithFallback from '@/components/image-with-fallback'
import Pagination from '@/components/pagination'
import {
  ArrowLeft,
  BookmarkOutlineIcon,
  ToolbarBookmarkFilledIcon,
} from '@/icons'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'
import type { MemberBrowsingHistoriesResponse } from '@/types/api'
import { getFormattedDate } from '@/utils'
import { ContentApiRequestError } from '@/utils/send-content-api'

const PAGE_SIZE = 12

const BOOKMARKED_TOAST = {
  post: '已收藏此文章',
  project: '已收藏此專題',
} as const

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

type HistoryItem = MemberBrowsingHistoriesResponse['browsingHistories'][number]

function cardFields(item: HistoryItem) {
  if (item.type === 'post') {
    return {
      href: `/article/${item.post.slug}`,
      slug: item.post.slug,
      image:
        item.post.ogImage?.resized.small ||
        item.post.heroImage?.resized.small ||
        '',
      badge: item.post.subSubcategoriesOrdered[0]?.name ?? '',
      meta: getFormattedDate(item.post.publishedDate ?? ''),
      title: item.post.ogTitle.trim() || item.post.title,
      description: item.post.ogDescription?.trim() ?? '',
    }
  }
  const date = getFormattedDate(
    item.project.updatedAt ?? item.project.publishedDate ?? ''
  )
  const countLabel = `共 ${item.project.relatedPostsCount} 篇`
  return {
    href: `/topic/${item.project.slug}`,
    slug: item.project.slug,
    image:
      item.project.ogImage?.resized.small ||
      item.project.heroImage?.resized.small ||
      '',
    badge: '專題',
    meta: date ? `${date} 更新｜${countLabel}` : countLabel,
    title: item.project.ogTitle.trim() || item.project.title,
    description: item.project.ogDescription?.trim() ?? '',
  }
}

function HistoryCard({
  item,
  memberId,
  accessToken,
  disabled,
}: {
  item: HistoryItem
  memberId?: string
  accessToken?: string
  disabled: boolean
}) {
  const fields = cardFields(item)
  const queryClient = useQueryClient()
  const [pending, setPending] = useState(false)
  const lockRef = useRef(false)
  const confirmUnsaveRef = useRef<(() => void) | null>(null)
  const unsaveToastIdRef = useRef<string | number | null>(null)
  const queryKey = bookmarkQueryKey(memberId ?? '', item.type, fields.slug)
  const bookmarkQuery = useBookmarkQuery({
    type: item.type,
    slug: fields.slug,
    memberId,
    accessToken,
    enabled: !!memberId && !!accessToken,
  })
  const isBookmarked = !!bookmarkQuery.data?.id
  const locked = pending || disabled || bookmarkQuery.isLoading

  useEffect(() => {
    return () => {
      const toastId = unsaveToastIdRef.current
      confirmUnsaveRef.current?.()
      if (toastId != null) toast.dismiss(toastId)
    }
  }, [])

  const save = useCallback(async () => {
    if (!accessToken || !memberId || lockRef.current) return
    lockRef.current = true
    setPending(true)
    await queryClient.cancelQueries({ queryKey })
    const previous = queryClient.getQueryData<BookmarkLookup | null>(queryKey)
    queryClient.setQueryData<BookmarkLookup | null>(queryKey, {
      id: OPTIMISTIC_BOOKMARK_ID,
    })
    try {
      const created = await createBookmarkContentApi(
        { type: item.type, slug: fields.slug },
        accessToken
      )
      queryClient.setQueryData<BookmarkLookup | null>(queryKey, {
        id: created.id,
      })
      toast.success(BOOKMARKED_TOAST[item.type])
      await queryClient.invalidateQueries({
        queryKey: useMemberBookmarksQuery.listQueryKey(memberId),
      })
    } catch (error) {
      if (error instanceof ContentApiRequestError && error.status === 409) {
        await queryClient.invalidateQueries({ queryKey })
        await queryClient.invalidateQueries({
          queryKey: useMemberBookmarksQuery.listQueryKey(memberId),
        })
        toast.success(BOOKMARKED_TOAST[item.type])
        return
      }
      queryClient.setQueryData(queryKey, rollbackBookmarkCache(previous))
    } finally {
      lockRef.current = false
      setPending(false)
    }
  }, [accessToken, fields.slug, item.type, memberId, queryClient, queryKey])

  const unsave = useCallback(() => {
    if (!accessToken || !memberId || lockRef.current) return
    const current = queryClient.getQueryData<BookmarkLookup | null>(queryKey)
    if (!current?.id || !isDeletableBookmarkId(current.id)) return
    const bookmarkId = current.id
    const previous = current
    lockRef.current = true
    setPending(true)
    void queryClient.cancelQueries({ queryKey })
    queryClient.setQueryData<BookmarkLookup | null>(queryKey, null)

    let undone = false
    let settled = false
    const release = () => {
      lockRef.current = false
      setPending(false)
      confirmUnsaveRef.current = null
      unsaveToastIdRef.current = null
    }
    const confirmDelete = () => {
      if (undone || settled) return
      settled = true
      confirmUnsaveRef.current = null
      void (async () => {
        try {
          await deleteBookmarkContentApi(bookmarkId, accessToken)
          await queryClient.cancelQueries({ queryKey })
          queryClient.setQueryData<BookmarkLookup | null>(queryKey, null)
          await queryClient.invalidateQueries({
            queryKey: useMemberBookmarksQuery.listQueryKey(memberId),
          })
        } catch {
          queryClient.setQueryData(queryKey, previous)
          toast.error('取消收藏失敗')
        } finally {
          release()
        }
      })()
    }
    confirmUnsaveRef.current = confirmDelete

    unsaveToastIdRef.current = toast.success('已取消收藏', {
      ...unsaveToastOptions,
      action: {
        label: '復原',
        onClick: () => {
          undone = true
          settled = true
          queryClient.setQueryData(queryKey, previous)
          release()
        },
      },
      onDismiss: confirmDelete,
      onAutoClose: confirmDelete,
    })
  }, [accessToken, memberId, queryClient, queryKey])

  return (
    <article
      className={cn('relative', pending && 'pointer-events-none')}
      aria-busy={pending}
    >
      <Link
        href={fields.href}
        className="group flex flex-col gap-3 tablet:flex-row tablet:items-start tablet:gap-6"
      >
        <div className="order-2 flex min-w-0 flex-1 flex-col gap-2 tablet:order-1">
          <div className="flex items-center justify-between gap-3 tablet:justify-start">
            <span
              className={cn(
                'min-w-0 truncate',
                fields.badge &&
                  'rounded-full bg-neutral-200 px-3 py-1 prose-p2-bold text-neutral-900'
              )}
            >
              {fields.badge}
            </span>
            <span className="shrink-0 prose-p2 whitespace-nowrap text-neutral-500">
              {fields.meta}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="line-clamp-1 prose-h5-small text-neutral-900 transition-colors duration-200 group-hover:text-red-400 tablet:prose-h6-large">
              {fields.title}
            </h2>
            {fields.description ? (
              <p className="line-clamp-2 prose-p1 text-neutral-700">
                {fields.description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="relative order-1 aspect-[327/183] w-full overflow-hidden rounded-2xl tablet:order-2 tablet:aspect-auto tablet:h-[152px] tablet:w-[270px] tablet:shrink-0">
          <ImageWithFallback
            src={fields.image}
            alt=""
            className="block size-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      </Link>
      <Button
        type="button"
        variant="neutral"
        size={44}
        className="absolute top-4 right-4 z-10 size-10 gap-5! border-0 bg-white p-2 text-neutral-600 shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:border-0 hover:bg-white hover:text-neutral-900 hover:shadow-custom! active:border-0 active:bg-white active:text-neutral-600 disabled:border-0 disabled:bg-white disabled:text-neutral-600 disabled:opacity-60"
        aria-label={
          isBookmarked
            ? '取消收藏'
            : item.type === 'post'
              ? '收藏文章'
              : '收藏此專題'
        }
        disabled={locked}
        onClick={() => {
          if (isBookmarked) unsave()
          else void save()
        }}
      >
        {isBookmarked ? <ToolbarBookmarkFilledIcon /> : <BookmarkOutlineIcon />}
      </Button>
      {pending && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60" />
      )}
    </article>
  )
}

function MyReadingHistory() {
  const [currentPage, setCurrentPage] = useState(1)
  const { member, tokens } = useHydratedAuthStore()
  const skip = (currentPage - 1) * PAGE_SIZE
  const { data, isLoading, isPlaceholderData, isError, isFetching, refetch } =
    useMemberBrowsingHistoriesQuery({
      memberId: member?.id,
      accessToken: tokens?.accessToken,
      take: PAGE_SIZE,
      skip,
    })

  const lastCountRef = useRef<number | null>(null)
  if (data) lastCountRef.current = data.browsingHistoriesCount

  const showLoadError = isError && !data
  const historiesCount =
    data?.browsingHistoriesCount ??
    (showLoadError ? lastCountRef.current : null)
  const histories = data?.browsingHistories ?? []
  const totalPages =
    historiesCount == null || historiesCount === 0
      ? 0
      : Math.ceil(historiesCount / PAGE_SIZE)

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  return (
    <div className="w-full bg-neutral-100 px-6 pt-6 pb-40 tablet:px-8 tablet:pt-8 desktop:px-12 desktop:pt-16 desktop:pb-50 hd:px-0">
      <div className="mx-auto flex w-full max-w-[789px] flex-col">
        <HeaderMobileBackButtonHrefSetter href="/myreading" />
        <div className="mb-6 flex items-center gap-4 desktop:mb-8">
          <Button
            variant="neutral"
            size={44}
            className="hidden size-11 shrink-0 p-0 tablet:inline-flex"
            asChild
          >
            <Link href="/myreading" aria-label="返回">
              <ArrowLeft />
            </Link>
          </Button>
          <h1 className="prose-h4-small font-swei text-neutral-900 desktop:prose-h4-large">
            造訪紀錄
          </h1>
        </div>
        {showLoadError ? (
          <div className="flex min-h-50 flex-col items-center justify-center gap-4 text-center">
            <p className="prose-p1 text-neutral-700">
              載入發生錯誤，請稍候再試
            </p>
            <Button
              type="button"
              variant="neutral"
              size={44}
              isLoading={isFetching}
              onClick={() => {
                void refetch()
              }}
            >
              重試
            </Button>
          </div>
        ) : historiesCount === 0 ? (
          <div className="flex min-h-50 flex-col items-center justify-center gap-1 text-center prose-p1 text-neutral-700">
            <p>你還沒有造訪過任何報導</p>
            <p>
              <Link href="/" className="underline underline-offset-[3px]">
                前往首頁
              </Link>
              探索更多內容
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 desktop:gap-10">
            {histories.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                memberId={member?.id}
                accessToken={tokens?.accessToken}
                disabled={isPlaceholderData}
              />
            ))}
          </div>
        )}
        {totalPages > 0 && !isLoading && (
          <Pagination
            className="mt-10 desktop:mt-14"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}

export default MyReadingHistory
