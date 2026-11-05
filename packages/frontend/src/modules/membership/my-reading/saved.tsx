'use client'

import {
  Button,
  cn,
  HeaderMobileBackButtonHrefSetter,
} from '@kids-reporter/routing-ui'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useMemberBookmarksQuery } from '@/api-utils/react-query/hooks/bookmark'
import ImageWithFallback from '@/components/image-with-fallback'
import Pagination from '@/components/pagination'
import {
  ArrowLeft,
  BookmarkOutlineIcon,
  ToolbarBookmarkFilledIcon,
} from '@/icons'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'
import type { MemberBookmarksResponse } from '@/types/api'
import { getFormattedDate } from '@/utils'

import { requestUnsaveBookmark } from './unsave-bookmark'

const PAGE_SIZE = 12

const CARD_GRID_CLASS =
  'grid grid-cols-1 gap-6 tablet:grid-cols-2 tablet:gap-x-6 tablet:gap-y-8 desktop:grid-cols-3 desktop:gap-x-8 desktop:gap-y-10'

type BookmarkItem = MemberBookmarksResponse['bookmarks'][number]

function cardFields(item: BookmarkItem) {
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

function SavedCard({
  item,
  pending,
  disabled,
  onUnsave,
}: {
  item: BookmarkItem
  pending: boolean
  disabled: boolean
  onUnsave: (item: BookmarkItem) => void
}) {
  const fields = cardFields(item)
  const locked = pending || disabled
  return (
    <article
      className={cn(
        'relative overflow-hidden rounded-[30px] bg-white',
        pending && 'pointer-events-none'
      )}
      aria-busy={pending}
    >
      <Link href={fields.href} className="group block">
        <div className="aspect-[336/189] w-full overflow-hidden">
          <ImageWithFallback
            src={fields.image}
            alt=""
            className="block size-full object-cover transition-transform duration-200 group-hover:scale-120 desktop:group-hover:scale-[1.28]"
          />
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <span
              className={cn(
                'min-w-0 truncate',
                fields.badge &&
                  'rounded-full bg-neutral-200 px-3 py-1 prose-p3-bold text-neutral-900'
              )}
            >
              {fields.badge}
            </span>
            <span className="shrink-0 prose-p3 whitespace-nowrap text-neutral-500 desktop:prose-p2">
              {fields.meta}
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <h2 className="line-clamp-2 prose-p1-bold text-neutral-900 transition-colors duration-200 group-hover:text-red-400 desktop:prose-h6-large">
              {fields.title}
            </h2>
            {fields.description ? (
              <p className="line-clamp-4 prose-p1 text-neutral-700">
                {fields.description}
              </p>
            ) : null}
          </div>
        </div>
      </Link>
      <Button
        type="button"
        variant="neutral"
        size={44}
        className="absolute top-4 right-4 z-10 size-10 gap-5! border-0 bg-white p-2 text-neutral-600 shadow-[0_2px_8px_rgba(0,0,0,0.15)] hover:border-0 hover:bg-white hover:text-neutral-900 hover:shadow-custom! active:border-0 active:bg-white active:text-neutral-600 disabled:border-0 disabled:bg-white disabled:text-neutral-600 disabled:opacity-60"
        aria-label="取消收藏"
        disabled={locked}
        onClick={() => onUnsave(item)}
      >
        <ToolbarBookmarkFilledIcon />
      </Button>
      {pending && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60"></div>
      )}
    </article>
  )
}

function SavedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[30px] bg-white" aria-hidden>
      <div className="aspect-[336/189] w-full animate-pulse bg-neutral-200" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="h-[27px] w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="h-[26px] w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-[26px] w-4/5 animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-full animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-3/5 animate-pulse rounded bg-neutral-200" />
        </div>
      </div>
    </div>
  )
}

function MyReadingSaved() {
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(
    () => new Set()
  )
  const pendingRef = useRef(new Set<string>())
  const { member, tokens } = useHydratedAuthStore()
  const queryClient = useQueryClient()
  const skip = (currentPage - 1) * PAGE_SIZE
  const { data, isLoading, isPlaceholderData, isError, isFetching, refetch } =
    useMemberBookmarksQuery({
      memberId: member?.id,
      accessToken: tokens?.accessToken,
      take: PAGE_SIZE,
      skip,
    })

  // ponytail: remember the last total so a failed uncached page still paginates.
  const lastCountRef = useRef<number | null>(null)
  if (data) lastCountRef.current = data.bookmarksCount

  const showLoadError = isError && !data
  const bookmarksCount =
    data?.bookmarksCount ?? (showLoadError ? lastCountRef.current : null)
  const bookmarks = data?.bookmarks ?? []
  const totalPages =
    bookmarksCount == null || bookmarksCount === 0
      ? 0
      : Math.ceil(bookmarksCount / PAGE_SIZE)

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const clearPending = useCallback((id: string) => {
    if (!pendingRef.current.delete(id)) return
    setPendingIds(new Set(pendingRef.current))
  }, [])

  const unsave = useCallback(
    (item: BookmarkItem) => {
      const accessToken = tokens?.accessToken
      const memberId = member?.id
      if (!accessToken || !memberId || pendingRef.current.has(item.id)) return
      pendingRef.current.add(item.id)
      setPendingIds(new Set(pendingRef.current))
      requestUnsaveBookmark({
        item: {
          id: item.id,
          type: item.type,
          slug: cardFields(item).slug,
        },
        accessToken,
        memberId,
        queryClient,
        listQueryKey: useMemberBookmarksQuery.getQueryKey(
          memberId,
          PAGE_SIZE,
          skip
        ),
        onFinished: () => clearPending(item.id),
      })
    },
    [clearPending, member?.id, queryClient, skip, tokens?.accessToken]
  )

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
  }, [])

  const title = bookmarksCount == null ? '已收藏' : `已收藏 (${bookmarksCount})`

  return (
    <div className="w-full bg-neutral-100 px-6 pt-6 pb-40 tablet:px-8 tablet:pt-8 desktop:px-12 desktop:pt-16 desktop:pb-50 hd:px-0">
      <div className="mx-auto flex w-full flex-col desktop:max-w-[995px]">
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
            {title}
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
        ) : !data ? (
          <div className={CARD_GRID_CLASS} aria-busy="true" aria-label="載入中">
            {Array.from({ length: PAGE_SIZE }, (_, index) => (
              <SavedCardSkeleton key={index} />
            ))}
          </div>
        ) : bookmarksCount === 0 ? (
          <div className="flex min-h-50 flex-col items-center justify-center gap-1 text-center prose-p1 text-neutral-700">
            <p>你還沒有收藏任何報導</p>
            <p className="flex items-center justify-center gap-1">
              點擊
              <span
                className="inline-flex size-5 shrink-0 [&>svg]:size-5"
                aria-hidden
              >
                <BookmarkOutlineIcon />
              </span>
              收藏你喜愛的文章或專題
            </p>
          </div>
        ) : (
          <div className={CARD_GRID_CLASS}>
            {bookmarks.map((item) => (
              <SavedCard
                key={item.id}
                item={item}
                pending={pendingIds.has(item.id)}
                disabled={isPlaceholderData}
                onUnsave={unsave}
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

export default MyReadingSaved
