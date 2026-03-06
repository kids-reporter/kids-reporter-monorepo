'use client'
import { cva } from 'class-variance-authority'
import { useEffect, useRef, useState } from 'react'

import { Button, Input } from '../components'
import { useBodyScrollLock } from '../hooks'
import {
  ClearIcon,
  HamburgerIcon,
  HamburgerIconSmall,
  SearchIcon,
} from '../icons'
import type { MenuItem } from '../types'
import { cn } from '../utils/cn'

const searchFormVariants = cva(
  'ease-in-out h-full transition-all duration-300',
  {
    variants: {
      mode: {
        inline: 'h-11 w-full',
        popover: 'top-0 -right-4 w-66 absolute overflow-hidden opacity-0',
      },
      isSearchOpen: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        mode: 'popover',
        isSearchOpen: true,
        class: 'w-66 pointer-events-auto opacity-100',
      },
      {
        mode: 'popover',
        isSearchOpen: false,
        class: 'pointer-events-none',
      },
    ],
  }
)

const searchDropdownVariants = cva(
  'rounded-xl mt-2 w-66 ease-in-out h-0 p-0 z-50 bg-neutral-white opacity-0 transition-all duration-200',
  {
    variants: {
      mode: {
        inline: '',
        popover: 'top-12 -right-4 shadow-custom p-4 absolute',
      },
      isSearchOpen: {
        true: '',
        false: '',
      },
      isFocused: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        mode: 'popover',
        isSearchOpen: true,
        isFocused: true,
        class: 'p-4 h-min opacity-100',
      },
      {
        mode: 'popover',
        isSearchOpen: false,
        class: 'pointer-events-none',
      },
      {
        mode: 'inline',
        isFocused: true,
        class:
          'translate-y-0 pt-6 mt-0 bg-neutral-transparent h-min w-full opacity-100',
      },
      {
        mode: 'inline',
        isFocused: false,
        class: '-translate-y-3 pointer-events-none w-full',
      },
    ],
  }
)

export function LogoLink({ compactMode = false }: { compactMode?: boolean }) {
  return (
    <a href="/" className="flex items-center" rel="home">
      <img
        src="/assets/images/brand-icon.svg"
        alt="少年報導者 The Reporter for Kids"
        loading="eager"
        className={cn(
          'h-5 tablet:h-6 desktop:h-8 ease-in-out w-auto transition-all duration-500',
          compactMode && 'desktop:h-[26px]'
        )}
        width={293}
        height={32}
      />
    </a>
  )
}

type SearchInputSectionProps =
  | {
      mode: 'popover'
      isSearchOpen: boolean
      tags: string[]
      searchPlaceholder: string
    }
  | {
      mode: 'inline'
      tags: string[]
      searchPlaceholder: string
    }

export function SearchInputSection(props: SearchInputSectionProps) {
  const ref = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [searchValue, setSearchValue] = useState('')

  const mode = props.mode
  const isSearchOpen = mode === 'popover' && props.isSearchOpen
  const tags = props.tags
  const searchPlaceholder = props.searchPlaceholder

  useBodyScrollLock({
    toLock: mode === 'popover' && isSearchOpen,
    lockID: 'header-search-input',
  })

  useEffect(() => {
    if (mode === 'inline') {
      return
    }
    if (isSearchOpen) {
      ref.current?.focus()
      setIsFocused(true)
      return
    }
    setIsFocused(false)
  }, [mode, isSearchOpen])

  return (
    <div
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={mode === 'inline' ? 'relative w-full' : 'h-11'}
    >
      <form
        role="search"
        method="get"
        action="/search"
        className={searchFormVariants({
          mode,
          isSearchOpen: mode === 'popover' ? isSearchOpen : undefined,
        })}
      >
        <Input
          placeholder={searchPlaceholder}
          name="q"
          title="Search for..."
          aria-label="Search for..."
          className="w-[99%]"
          inputRef={ref}
          onChange={setSearchValue}
          value={searchValue}
          mode="search"
        />
      </form>
      <div
        className={searchDropdownVariants({
          mode,
          isSearchOpen: mode === 'popover' ? isSearchOpen : undefined,
          isFocused,
        })}
      >
        <h3 className="font-bold mb-3 prose-p3 text-neutral-700">熱門搜尋</h3>
        <div className="gap-2.5 flex flex-wrap">
          {tags.map((keyword) => (
            <a
              key={keyword}
              className="px-3 py-1 font-bold cursor-pointer rounded-full bg-neutral-200 prose-p2 text-neutral-900 transition-colors duration-200 hover:bg-red-500 hover:text-neutral-white"
              href={`/search?q=${encodeURIComponent(keyword)}`}
            >
              #{keyword}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ActionButtons({
  hideCtaButtons = false,
  tags,
  searchPlaceholder,
  subscribeUrl,
  joinUsUrl,
}: {
  hideCtaButtons?: boolean
  tags: string[]
  searchPlaceholder: string
  subscribeUrl: string
  joinUsUrl: string
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const containerElement = containerRef.current
      const buttonElement = buttonRef.current
      if (!containerElement || !buttonElement) return
      if (
        !containerElement.contains(event.target as Node) &&
        !buttonElement.contains(event.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative flex items-center">
      <div className="mr-6 relative flex items-center" ref={containerRef}>
        {/* CTA Buttons - Base layer */}
        {!hideCtaButtons && !isSearchOpen && (
          <div className="gap-4 flex items-center">
            <Button variant="secondary" size={32} asChild>
              <a href={joinUsUrl}>加入我們</a>
            </Button>
            <Button variant="primary" size={32} asChild>
              <a href={subscribeUrl} target="_blank" rel="noopener noreferrer">
                訂閱
              </a>
            </Button>
          </div>
        )}

        <SearchInputSection
          isSearchOpen={isSearchOpen}
          mode="popover"
          tags={tags}
          searchPlaceholder={searchPlaceholder}
        />
      </div>

      <button
        className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-all duration-200 hover:text-neutral-800"
        aria-label="搜尋"
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        ref={buttonRef}
      >
        {isSearchOpen ? <ClearIcon /> : <SearchIcon />}
      </button>
    </div>
  )
}

export function BottomNavigation({
  onHamburgerOverlayOpen,
  menuItems,
}: {
  onHamburgerOverlayOpen: () => void
  menuItems: MenuItem[]
}) {
  return (
    <div className="py-2 px-4 flex w-full items-center justify-between border-y border-neutral-border">
      <HamburgerButton onHamburgerOverlayOpen={onHamburgerOverlayOpen} small />

      {menuItems.reduce((acc, item, index) => {
        return [
          ...acc,
          <div key={item.label} className="flex items-center">
            <a
              href={item.href}
              className="py-1 font-bold! h-6 flex items-center prose-p1 text-neutral-900 transition-colors hover:text-red-400"
            >
              {item.label}
            </a>
          </div>,
          ...(index < menuItems.length - 1
            ? [
                <div
                  key={`separator-${index}`}
                  className="h-4 mx-2 w-px bg-neutral-border"
                />,
              ]
            : []),
        ]
      }, [] as React.ReactNode[])}
    </div>
  )
}

export function HamburgerButton({
  onHamburgerOverlayOpen,
  small = false,
}: {
  onHamburgerOverlayOpen: () => void
  small?: boolean
}) {
  return (
    <button
      className={cn(
        'rounded-sm ease-in-out flex cursor-pointer items-center justify-center transition-all duration-300 hover:[&>svg>path:nth-child(1)]:fill-blue-500 hover:[&>svg>path:nth-child(2)]:fill-red-500 hover:[&>svg>path:nth-child(3)]:fill-yellow-500 hover:[&>svg>rect:nth-child(1)]:fill-blue-500 hover:[&>svg>rect:nth-child(2)]:fill-red-500 hover:[&>svg>rect:nth-child(3)]:fill-yellow-500',
        small ? 'w-6 h-6' : 'w-8 h-8'
      )}
      onClick={onHamburgerOverlayOpen}
    >
      {small ? <HamburgerIconSmall /> : <HamburgerIcon />}
    </button>
  )
}
