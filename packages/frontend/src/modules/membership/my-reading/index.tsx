'use client'

import {
  Button,
  cn,
  HeaderMobileBackButtonHrefSetter,
} from '@kids-reporter/routing-ui'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'

import { useMemberBookmarksQuery } from '@/api-utils/react-query/hooks/bookmark'
import { useMemberBrowsingHistoriesQuery } from '@/api-utils/react-query/hooks/browsing-history'
import { useMemberPostsWithAnswersInfinityQuery } from '@/api-utils/react-query/hooks/extended'
import ImageWithFallback from '@/components/image-with-fallback'
import { BookmarkOutlineIcon, ToolbarBookmarkFilledIcon } from '@/icons'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'
import type {
  MemberBookmarksResponse,
  MemberBrowsingHistoriesResponse,
} from '@/types/api'
import { getFormattedDate } from '@/utils'

import MembershipSideMenu from '../components/side-menu'
import HotTopicsBanner from './hot-topics-banner'
import PostQuestionAnswersList from './post-question-answers-list'
import { requestUnsaveBookmark } from './unsave-bookmark'
import { parseMemberPostsWithAnswersToPostQuestionAnswers } from './utils'

const SAVED_PREVIEW = 2
const ANSWERS_PREVIEW = 3
const HISTORY_PREVIEW = 6

type BookmarkItem = MemberBookmarksResponse['bookmarks'][number]
type HistoryItem = MemberBrowsingHistoriesResponse['browsingHistories'][number]
type ReadingCardItem = BookmarkItem | HistoryItem

function readingCardFields(item: ReadingCardItem) {
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
  }
}

function withCount(label: string, count: number | null) {
  return count == null ? label : `${label} (${count})`
}

function SectionHeading({
  barClassName,
  children,
}: {
  barClassName: string
  children: string
}) {
  return (
    <div className="flex h-9 w-full items-center gap-2">
      <span
        className={cn('h-6 w-1.5 shrink-0 rounded-full', barClassName)}
        aria-hidden
      />
      <h2 className="prose-h5-small font-swei text-neutral-900 desktop:prose-h5-large">
        {children}
      </h2>
    </div>
  )
}

function ViewAllLink({ href, children }: { href: string; children: string }) {
  return (
    <Button variant="secondary" size={44} asChild>
      <Link href={href}>{children}</Link>
    </Button>
  )
}

function SectionError({
  isFetching,
  onRetry,
}: {
  isFetching: boolean
  onRetry: () => void
}) {
  return (
    <div className="flex min-h-50 w-full flex-col items-center justify-center gap-4 text-center">
      <p className="prose-p1 text-neutral-700">載入發生錯誤，請稍候再試</p>
      <Button
        type="button"
        variant="neutral"
        size={44}
        isLoading={isFetching}
        onClick={onRetry}
      >
        重試
      </Button>
    </div>
  )
}

function SavedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[30px] bg-white" aria-hidden>
      <div className="aspect-[336/189] w-full animate-pulse bg-neutral-200" />
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="h-[27px] w-20 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="h-6 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-6 w-4/5 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}

function AnswerRowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 border-b-2 border-b-neutral-200 py-5 last:border-b-0 desktop:px-4"
      aria-hidden
    >
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
          <div className="h-5 w-16 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="h-6 w-4/5 animate-pulse rounded bg-neutral-200" />
      </div>
      <div className="size-6 animate-pulse rounded bg-neutral-200" />
    </div>
  )
}

function HistoryCardSkeleton() {
  return (
    <div className="flex items-start gap-3" aria-hidden>
      <div className="size-[84px] shrink-0 animate-pulse rounded-xl bg-neutral-200 tablet:size-[88px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <div className="h-[27px] w-16 animate-pulse rounded-full bg-neutral-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
        </div>
        <div className="h-6 w-full animate-pulse rounded bg-neutral-200" />
        <div className="h-6 w-3/5 animate-pulse rounded bg-neutral-200" />
      </div>
    </div>
  )
}

function SavedPreviewCard({
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
  const fields = readingCardFields(item)
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
            <span className="shrink-0 prose-p2 whitespace-nowrap text-neutral-500">
              {fields.meta}
            </span>
          </div>
          <h3 className="line-clamp-2 prose-p1-bold text-neutral-900 transition-colors duration-200 group-hover:text-red-400 desktop:prose-h6-large">
            {fields.title}
          </h3>
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
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60" />
      )}
    </article>
  )
}

function HistoryPreviewCard({ item }: { item: HistoryItem }) {
  const fields = readingCardFields(item)
  return (
    <Link href={fields.href} className="group flex items-start gap-3">
      <div className="size-[84px] shrink-0 overflow-hidden rounded-xl tablet:size-[88px]">
        <ImageWithFallback
          src={fields.image}
          alt=""
          className="block size-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
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
          <span className="shrink-0 prose-p2 whitespace-nowrap text-neutral-500">
            {fields.meta}
          </span>
        </div>
        <h3 className="line-clamp-2 prose-p1-bold text-neutral-900 transition-colors duration-200 group-hover:text-red-400 tablet:prose-h6-large">
          {fields.title}
        </h3>
      </div>
    </Link>
  )
}

function splitColumns<T>(items: T[]) {
  const midpoint = Math.ceil(items.length / 2)
  return [items.slice(0, midpoint), items.slice(midpoint)].filter(
    (column) => column.length > 0
  )
}

function SavedPreview() {
  const { hydrated, member, tokens } = useHydratedAuthStore()
  const queryClient = useQueryClient()
  const canQuery = hydrated && !!member?.id && !!tokens?.accessToken
  const { data, isLoading, isError, isFetching, isPlaceholderData, refetch } =
    useMemberBookmarksQuery({
      memberId: member?.id,
      accessToken: tokens?.accessToken,
      take: SAVED_PREVIEW,
      skip: 0,
    })
  const [pendingIds, setPendingIds] = useState<ReadonlySet<string>>(
    () => new Set()
  )
  const pendingRef = useRef(new Set<string>())
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
          slug: readingCardFields(item).slug,
        },
        accessToken,
        memberId,
        queryClient,
        listQueryKey: useMemberBookmarksQuery.getQueryKey(
          memberId,
          SAVED_PREVIEW,
          0
        ),
        onFinished: () => clearPending(item.id),
      })
    },
    [clearPending, member?.id, queryClient, tokens?.accessToken]
  )

  const showLoading = !canQuery || isLoading
  const bookmarks = data?.bookmarks ?? []
  const count = data?.bookmarksCount ?? null

  return (
    <section className="flex w-full flex-col items-center gap-5 desktop:gap-6">
      <SectionHeading barClassName="bg-red-400">
        {withCount('已收藏', showLoading ? null : count)}
      </SectionHeading>
      {showLoading ? (
        <div
          className="grid w-full grid-cols-1 gap-6 tablet:grid-cols-2 tablet:gap-8"
          aria-busy="true"
        >
          <span className="sr-only">載入中</span>
          <SavedCardSkeleton />
          <SavedCardSkeleton />
        </div>
      ) : isError && !data ? (
        <SectionError
          isFetching={isFetching}
          onRetry={() => {
            void refetch()
          }}
        />
      ) : bookmarks.length === 0 ? (
        <div className="flex min-h-50 w-full flex-col items-center justify-center gap-1 text-center prose-p1 text-neutral-700">
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
        <div className="grid w-full grid-cols-1 gap-6 tablet:grid-cols-2 tablet:gap-8">
          {bookmarks.map((item) => (
            <SavedPreviewCard
              key={item.id}
              item={item}
              pending={pendingIds.has(item.id)}
              disabled={isPlaceholderData}
              onUnsave={unsave}
            />
          ))}
        </div>
      )}
      {!showLoading && count != null && count > 0 ? (
        <ViewAllLink href="/myreading/saved">查看全部收藏</ViewAllLink>
      ) : null}
    </section>
  )
}

function AnswersPreview() {
  const { hydrated, member, tokens } = useHydratedAuthStore()
  const canQuery = hydrated && !!member?.id && !!tokens?.accessToken
  const { data, isLoading, isError, isFetching, refetch } =
    useMemberPostsWithAnswersInfinityQuery({
      memberId: member?.id ?? '',
      take: ANSWERS_PREVIEW,
      accessToken: tokens?.accessToken ?? '',
    })
  const [openedAccordionItemValue, setOpenedAccordionItemValue] = useState<
    string | undefined
  >(undefined)
  const handleBackToFirstPage = useCallback((slug: string) => {
    setOpenedAccordionItemValue(slug)
  }, [])

  const page = data?.pages[0]
  const showLoading = !canQuery || isLoading
  const count = page?.postsCount ?? null
  const answers = parseMemberPostsWithAnswersToPostQuestionAnswers(
    page?.posts ?? []
  )

  return (
    <section className="flex w-full flex-col items-center gap-5 desktop:gap-6">
      <SectionHeading barClassName="bg-yellow-400">
        {withCount('我的回答', showLoading ? null : count)}
      </SectionHeading>
      {showLoading ? (
        <div
          className="w-full border-y-2 border-y-neutral-200"
          aria-busy="true"
        >
          <span className="sr-only">載入中</span>
          <AnswerRowSkeleton />
          <AnswerRowSkeleton />
          <AnswerRowSkeleton />
        </div>
      ) : isError && !page ? (
        <SectionError
          isFetching={isFetching}
          onRetry={() => {
            void refetch()
          }}
        />
      ) : (
        <PostQuestionAnswersList
          postQuestionAnswers={answers}
          isLoading={false}
          onBackToFirstPage={handleBackToFirstPage}
          openedAccordionItemValue={openedAccordionItemValue}
        />
      )}
      {!showLoading && count != null && count > 0 ? (
        <ViewAllLink href="/myreading/response">查看全部回答</ViewAllLink>
      ) : null}
    </section>
  )
}

function HistoryPreview() {
  const { hydrated, member, tokens } = useHydratedAuthStore()
  const canQuery = hydrated && !!member?.id && !!tokens?.accessToken
  const { data, isLoading, isError, isFetching, refetch } =
    useMemberBrowsingHistoriesQuery({
      memberId: member?.id,
      accessToken: tokens?.accessToken,
      take: HISTORY_PREVIEW,
      skip: 0,
    })
  const showLoading = !canQuery || isLoading
  const histories = data?.browsingHistories ?? []
  const count = data?.browsingHistoriesCount ?? null
  const columns = splitColumns(histories)

  return (
    <section className="flex w-full flex-col items-center gap-5 desktop:gap-6">
      <SectionHeading barClassName="bg-blue-400">
        {withCount('造訪紀錄', showLoading ? null : count)}
      </SectionHeading>
      {showLoading ? (
        <div
          className="flex w-full flex-col gap-6 tablet:flex-row tablet:gap-8"
          aria-busy="true"
        >
          <span className="sr-only">載入中</span>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <HistoryCardSkeleton />
            <HistoryCardSkeleton />
            <HistoryCardSkeleton />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <HistoryCardSkeleton />
            <HistoryCardSkeleton />
            <HistoryCardSkeleton />
          </div>
        </div>
      ) : isError && !data ? (
        <SectionError
          isFetching={isFetching}
          onRetry={() => {
            void refetch()
          }}
        />
      ) : histories.length === 0 ? (
        <div className="flex min-h-50 w-full flex-col items-center justify-center gap-1 text-center prose-p1 text-neutral-700">
          <p>你還沒有造訪過任何報導</p>
          <p>
            <Link href="/" className="underline underline-offset-[3px]">
              前往首頁
            </Link>
            探索更多內容
          </p>
        </div>
      ) : (
        <div className="flex w-full flex-col gap-6 tablet:flex-row tablet:gap-8">
          {columns.map((column, index) => (
            <div
              key={column[0]?.id ?? index}
              className="flex min-w-0 flex-1 flex-col gap-6"
            >
              {column.map((item) => (
                <HistoryPreviewCard key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>
      )}
      {!showLoading && count != null && count > 0 ? (
        <ViewAllLink href="/myreading/history">查看全部紀錄</ViewAllLink>
      ) : null}
    </section>
  )
}

function MyReading() {
  return (
    <div className="mx-auto w-full bg-neutral-100 pt-6 pb-40 tablet:pt-8 desktop:px-12 desktop:pt-16 desktop:pb-50">
      <div className="mx-auto w-full max-w-300 tablet:grid tablet:grid-cols-12 tablet:gap-6 desktop:gap-8">
        <HeaderMobileBackButtonHrefSetter href="/member" />
        <div className="hidden tablet:col-span-2 tablet:block tablet:min-w-[150px]">
          <MembershipSideMenu />
        </div>
        <div className="flex flex-1 flex-col gap-6 px-6 tablet:col-span-10 tablet:px-8 desktop:max-w-[789px] desktop:gap-8 desktop:px-0">
          <h1 className="prose-h4-small font-swei text-neutral-900 desktop:prose-h4-large">
            我的閱讀
          </h1>
          <div className="flex flex-col gap-10 desktop:gap-12">
            <HotTopicsBanner />
            <SavedPreview />
            <AnswersPreview />
            <HistoryPreview />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyReading
