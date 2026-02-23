'use client'
import {
  cn,
  ScrollLevel,
  useMediaQuery,
  useScrollLevel,
} from '@kids-reporter/routing-ui'
import { useCallback, useEffect, useRef, useState } from 'react'

import { STICKY_HEADER_HEIGHT } from '@/constants'
import useClickOutside from '@/hooks/use-click-outside'

import {
  DEFAULT_ANCHOR_ID_PREFIX,
  DEFAULT_SCROLL_DOWN_DISTANCE,
  TABLE_OF_CONTENT_BACK_TO_TOP_KEY,
  TABLE_OF_CONTENT_INDEX_PREFIX,
} from './constants'

type TableOfContentSideMenuProps = {
  indexes: { key: string; label: string }[]
  /** Prefix for section element ids. Empty string means section ids are the raw keys (e.g. id="mission"). Default preserves article/draft-renderer convention. */
  anchorIdPrefix?: string
  /** Px to scroll down before TOC hides on mobile. */
  scrollDownDistance?: number
  /** Aria-label for the nav element. */
  ariaLabel?: string
}

function makeAnchorIndexKey(key: string) {
  return `${TABLE_OF_CONTENT_INDEX_PREFIX}-${key}`
}

function makeAnchorKey(
  key: string,
  anchorIdPrefix: string = DEFAULT_ANCHOR_ID_PREFIX
) {
  return anchorIdPrefix ? `${anchorIdPrefix}${key}` : key
}

function TableOfContentSideMenu({
  indexes,
  anchorIdPrefix = DEFAULT_ANCHOR_ID_PREFIX,
  scrollDownDistance = DEFAULT_SCROLL_DOWN_DISTANCE,
  ariaLabel = '文章目錄',
}: TableOfContentSideMenuProps) {
  const [currentActiveIndex, setCurrentActiveIndex] = useState<string | null>(
    makeAnchorKey(TABLE_OF_CONTENT_BACK_TO_TOP_KEY, anchorIdPrefix)
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const anchorRefs = useRef<HTMLElement[]>([])
  const menuContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    anchorRefs.current = indexes
      .map(({ key }) => {
        const id = makeAnchorKey(key, anchorIdPrefix)
        const element = document.querySelector(
          `#${CSS.escape(id)}`
        ) as HTMLElement | null
        return element
      })
      .filter((anchor): anchor is HTMLElement => anchor !== null)
  }, [indexes, anchorIdPrefix])

  const handleClickAnchorIndex = useCallback(
    (key: string) => {
      const targetId = makeAnchorKey(key, anchorIdPrefix)
      const anchor = anchorRefs.current.find((anchor) => anchor.id === targetId)
      if (!anchor) return
      const elementPosition = anchor.getBoundingClientRect().top
      const offsetPosition =
        elementPosition + window.scrollY - STICKY_HEADER_HEIGHT
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    },
    [anchorIdPrefix]
  )

  useEffect(() => {
    const anchors = anchorRefs.current

    if (anchors.length === 0) return

    const elementToKeyMap = new Map<HTMLElement, string>()
    anchors.forEach((anchor) => {
      const key = anchorIdPrefix
        ? anchor.id.replace(anchorIdPrefix, '')
        : anchor.id
      elementToKeyMap.set(anchor, key)
    })

    const observerOptions = {
      root: null,
      rootMargin: `-${STICKY_HEADER_HEIGHT + 20}px 0px -80% 0px`,
      threshold: [0, 0.1, 0.5, 1],
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting)

      if (visibleEntries.length === 0) {
        if (window.scrollY < STICKY_HEADER_HEIGHT) {
          setCurrentActiveIndex(
            makeAnchorKey(TABLE_OF_CONTENT_BACK_TO_TOP_KEY, anchorIdPrefix)
          )
        }
        return
      }
      const threshold = STICKY_HEADER_HEIGHT + 50
      const nearestEntry = visibleEntries.reduce(
        (nearest, entry) => {
          if (!nearest) return entry
          const nearestDist = Math.abs(
            nearest.boundingClientRect.top - threshold
          )
          const entryDist = Math.abs(entry.boundingClientRect.top - threshold)
          return entryDist < nearestDist ? entry : nearest
        },
        null as IntersectionObserverEntry | null
      )

      if (!nearestEntry) return
      const element = nearestEntry.target as HTMLElement
      const key = elementToKeyMap.get(element)
      if (!key) return
      setCurrentActiveIndex(makeAnchorKey(key, anchorIdPrefix))
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    anchors.forEach((anchor) => {
      observer.observe(anchor)
    })

    const handleScroll = () => {
      if (window.scrollY < STICKY_HEADER_HEIGHT) {
        setCurrentActiveIndex(
          makeAnchorKey(TABLE_OF_CONTENT_BACK_TO_TOP_KEY, anchorIdPrefix)
        )
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [indexes, anchorIdPrefix])

  const handleClickOutside = useCallback(() => {
    if (isExpanded) {
      setIsExpanded(false)
    }
  }, [isExpanded])

  useClickOutside(menuContainerRef, handleClickOutside)

  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const scrollLevel = useScrollLevel({
    scrollDownDistance,
  })
  const isHidden =
    scrollLevel === ScrollLevel.DOWN_HIDDEN && !isDesktop && !isExpanded

  if (indexes.length === 0) {
    return null
  }

  return (
    <nav
      ref={menuContainerRef}
      className="fixed top-0 left-0 z-bar print:hidden"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={
          isDesktop
            ? undefined
            : () => {
                setIsExpanded(!isExpanded)
              }
        }
        onMouseEnter={
          isDesktop
            ? () => {
                setIsExpanded(true)
              }
            : undefined
        }
        aria-label={isExpanded ? '關閉目錄' : '開啟目錄'}
        aria-expanded={isExpanded}
        className={cn(
          'fixed top-[144px] left-0 w-8 cursor-pointer transition-transform duration-300 ease-in-out desktop:top-1/2 desktop:-translate-y-1/2',
          isExpanded
            ? 'translate-x-[200px] desktop:translate-x-0'
            : 'translate-x-0',
          isHidden && 'translate-x-[-200px]'
        )}
      >
        <div
          className={cn(
            'absolute top-0 left-0 flex h-24 w-8 flex-col items-center justify-center gap-2.5 rounded-r-[20px] bg-neutral-black/8 px-[9px] py-[26px] text-sm leading-[1.6] text-neutral-700 backdrop-blur-xs transition-colors duration-300 ease-in-out hover:text-red-400 desktop:hidden',
            isExpanded && 'bg-neutral-200'
          )}
        >
          索
          <br />引
        </div>
        <div className="hidden flex-col gap-2 pr-10 pl-4 desktop:flex">
          {[{ key: TABLE_OF_CONTENT_BACK_TO_TOP_KEY }, ...indexes].map(
            ({ key }) => (
              <div
                key={key}
                className={cn(
                  'h-[3px] w-4 rounded-sm bg-neutral-black/10',
                  currentActiveIndex === makeAnchorKey(key, anchorIdPrefix) &&
                    'bg-red-400'
                )}
              ></div>
            )
          )}
        </div>
      </button>
      <div
        role="list"
        className={cn(
          'fixed top-0 left-0 flex h-screen w-[200px] flex-col justify-center gap-2 bg-neutral-100 px-5 py-6 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.2)] transition-transform duration-300 ease-in-out desktop:left-4',
          isExpanded ? 'translate-x-0' : '-translate-x-[200px]',
          'desktop:top-1/2 desktop:h-auto desktop:min-h-75 desktop:-translate-y-1/2 desktop:rounded-[20px] desktop:px-5 desktop:py-6',
          isExpanded && isDesktop
            ? 'desktop:translate-x-0'
            : 'desktop:-translate-x-[240px]'
        )}
        onMouseLeave={
          isDesktop
            ? () => {
                setIsExpanded(false)
              }
            : undefined
        }
      >
        <button
          type="button"
          role="listitem"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          aria-current={
            currentActiveIndex ===
            makeAnchorKey(TABLE_OF_CONTENT_BACK_TO_TOP_KEY, anchorIdPrefix)
              ? 'location'
              : undefined
          }
          className={cn(
            'w-full cursor-pointer rounded bg-transparent px-1 py-[1px] text-start prose-p2 break-words text-neutral-600 transition-colors duration-300 ease-in-out hover:bg-neutral-black/5 hover:text-neutral-900 active:bg-neutral-black/10',
            'desktop:rounded desktop:px-1 desktop:py-[1px]',
            currentActiveIndex ===
              makeAnchorKey(TABLE_OF_CONTENT_BACK_TO_TOP_KEY, anchorIdPrefix) &&
              'font-bold text-red-400 hover:text-red-400'
          )}
        >
          回到置頂
        </button>
        {indexes.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="listitem"
            id={makeAnchorIndexKey(key)}
            onClick={() => {
              handleClickAnchorIndex(key)
            }}
            aria-current={
              currentActiveIndex === makeAnchorKey(key, anchorIdPrefix)
                ? 'location'
                : undefined
            }
            className={cn(
              'w-full cursor-pointer rounded bg-transparent px-1 py-[1px] text-start prose-p2 break-words text-neutral-600 transition-colors duration-300 ease-in-out hover:bg-neutral-black/5 hover:text-neutral-900 active:bg-neutral-black/10',
              'desktop:rounded desktop:px-1 desktop:py-[1px]',
              currentActiveIndex === makeAnchorKey(key, anchorIdPrefix) &&
                'font-bold text-red-400 hover:text-red-400'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default TableOfContentSideMenu
