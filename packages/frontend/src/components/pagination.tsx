'use client'

import { cn } from '@kids-reporter/routing-ui'
import Link from 'next/link'

import { ArrowLeft, ArrowRight } from '@/icons'

type PaginationProp = {
  currentPage: number
  totalPages: number
  routingPrefix: string
  className?: string
}

/* Figma: 32px circles, 12px gap, red-400 active, neutral-200 inactive */
const N_CENTER_PAGES = 4
const N_MARGIN_PAGES = 1
const PAGES_ARRAY_MAX_LENGTH = N_CENTER_PAGES + (N_MARGIN_PAGES + 1) * 2

export const Pagination = (props: PaginationProp) => {
  const currentPage = props?.currentPage
  const totalPages = props?.totalPages
  const routingPrefix = props?.routingPrefix
  const className = props?.className
  if (!totalPages || !currentPage || !routingPrefix) {
    return null
  }

  const buildPageBox = (pageIndex: number) => {
    const isActive = pageIndex === currentPage
    return (
      <div
        key={`pagination-index-${pageIndex}`}
        className="inline-block shrink-0"
      >
        <Link
          href={`${routingPrefix}/${pageIndex}`}
          className={cn(
            'flex h-8 min-h-8 w-8 min-w-8 cursor-pointer items-center justify-center rounded-full text-center prose-p1-bold transition-colors duration-120',
            isActive
              ? 'pointer-events-none bg-red-400 text-neutral-white'
              : 'bg-neutral-200 text-neutral-900 hover:bg-neutral-300'
          )}
          aria-current={isActive ? 'page' : undefined}
        >
          {pageIndex}
        </Link>
      </div>
    )
  }

  const buildCenterJSX = (startAt: number, length: number) => {
    const centerJSX = []
    const endAt = startAt + length - 1
    for (let i = startAt; i <= endAt; i += 1) {
      centerJSX.push(buildPageBox(i))
    }
    return centerJSX
  }

  const buildPagesArray = () => {
    const ellipsis = '…'
    if (totalPages <= PAGES_ARRAY_MAX_LENGTH) {
      const pagesArray = []
      for (let page = 1; page <= totalPages; page += 1) {
        pagesArray.push(buildPageBox(page))
      }
      return pagesArray
    }

    const isCurrentPageInLeftRange =
      currentPage <= N_MARGIN_PAGES + N_CENTER_PAGES
    const isCurrentPageInRightRange =
      currentPage > totalPages - N_MARGIN_PAGES - N_CENTER_PAGES

    const ellipsisClass =
      'hidden shrink-0 cursor-default items-center justify-center rounded-full text-neutral-400 prose-p1-bold tablet:inline-flex'
    const leftEllipsisJSX = (
      <div
        key="left-ellipsis"
        className={cn(ellipsisClass, 'min-h-8 min-w-8')}
        aria-hidden="true"
      >
        {ellipsis}
      </div>
    )
    const rightEllipsisJSX = (
      <div
        key="right-ellipsis"
        className={cn(ellipsisClass, 'min-h-8 min-w-8')}
        aria-hidden="true"
      >
        {ellipsis}
      </div>
    )

    const leftMarginJSX = []
    for (let page = 1; page <= N_MARGIN_PAGES; page += 1) {
      leftMarginJSX.push(buildPageBox(page))
    }
    const rightMarginJSX = []
    for (let i = 1; i <= N_MARGIN_PAGES; i += 1) {
      const page = totalPages - N_MARGIN_PAGES + i
      rightMarginJSX.push(buildPageBox(page))
    }

    if (isCurrentPageInLeftRange) {
      const startAt = N_MARGIN_PAGES + 1
      const length = N_CENTER_PAGES + 1
      return (
        <>
          {leftMarginJSX}
          {buildCenterJSX(startAt, length)}
          {rightEllipsisJSX}
          {rightMarginJSX}
        </>
      )
    }
    if (isCurrentPageInRightRange) {
      const startAt = totalPages - N_MARGIN_PAGES - N_CENTER_PAGES
      const length = N_CENTER_PAGES + 1
      return (
        <>
          {leftMarginJSX}
          {leftEllipsisJSX}
          {buildCenterJSX(startAt, length)}
          {rightMarginJSX}
        </>
      )
    }
    const startAt = currentPage - Math.floor(N_CENTER_PAGES / 2) + 1
    const length = N_CENTER_PAGES
    return (
      <>
        {leftMarginJSX}
        {leftEllipsisJSX}
        {buildCenterJSX(startAt, length)}
        {rightEllipsisJSX}
        {rightMarginJSX}
      </>
    )
  }

  const pagesArrayJSX = buildPagesArray()
  const belowFirstPage = currentPage <= 1
  const aboveFinalPage = currentPage >= totalPages

  return (
    totalPages > 0 && (
      <nav
        className={cn(
          'flex w-full flex-row flex-wrap items-center justify-center gap-3',
          className
        )}
        role="navigation"
        aria-label="分頁導航"
      >
        {!belowFirstPage && (
          <Link
            href={`${routingPrefix}/${currentPage - 1}`}
            className="flex h-8 min-h-8 w-8 min-w-8 shrink-0 cursor-pointer items-center justify-center text-neutral-600 transition-colors duration-120 hover:text-neutral-800"
            aria-hidden="true"
            aria-label="上一頁"
          >
            <ArrowLeft />
          </Link>
        )}
        {pagesArrayJSX}
        {!aboveFinalPage && (
          <Link
            href={`${routingPrefix}/${currentPage + 1}`}
            className="flex h-8 min-h-8 w-8 min-w-8 shrink-0 cursor-pointer items-center justify-center text-neutral-600 transition-colors duration-120 hover:text-neutral-800"
            aria-hidden="true"
            aria-label="下一頁"
          >
            <ArrowRight />
          </Link>
        )}
      </nav>
    )
  )
}

export default Pagination
