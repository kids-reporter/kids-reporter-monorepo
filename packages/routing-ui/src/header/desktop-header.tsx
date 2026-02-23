'use client'

import { LoginIcon } from '../icons'
import type { MenuItem } from '../types'
import { cn } from '../utils/cn'
import {
  ActionButtons,
  BottomNavigation,
  HamburgerButton,
  LogoLink,
} from './shared-components'

type DesktopHeaderProps = {
  onHamburgerOverlayOpen: () => void
  keywords: string[]
  compactMode: boolean
  postTitle?: string
  hide: boolean
  searchPlaceholder: string
  subscribeUrl: string
  menuItems: MenuItem[]
  isLoggedIn?: boolean
  loginUrl?: string
  joinUsUrl: string
}

export function DesktopHeader({
  onHamburgerOverlayOpen,
  keywords,
  compactMode,
  postTitle,
  hide,
  searchPlaceholder,
  subscribeUrl,
  menuItems,
  isLoggedIn,
  loginUrl,
  joinUsUrl,
}: DesktopHeaderProps) {
  return (
    <>
      <div className="hidden h-(--desktop-header-height) desktop:block"></div>
      <div
        className={cn(
          'top-0 ease-in-out fixed left-1/2 z-bar hidden w-full -translate-x-1/2 transform transition-all duration-500 desktop:block',
          compactMode && 'bg-white',
          hide
            ? 'pointer-events-none -translate-y-full opacity-0'
            : 'translate-y-0 pointer-events-auto opacity-100'
        )}
      >
        <div className="px-12 hidden w-full bg-transparent desktop:block">
          <div className="max-w-300 mx-auto">
            <div
              className={cn(
                'px-4 flex items-center justify-between py-[18px]',
                compactMode && 'py-2.5'
              )}
            >
              <div className={'flex items-center'}>
                <div
                  className={cn(
                    'ease-in-out overflow-hidden transition-all duration-500',
                    compactMode
                      ? 'translate-x-0 max-w-12 mr-4 w-auto scale-100 opacity-100'
                      : '-translate-x-2 w-0 max-w-0 pointer-events-none scale-95 opacity-0'
                  )}
                >
                  <HamburgerButton
                    onHamburgerOverlayOpen={onHamburgerOverlayOpen}
                    small
                  />
                </div>
                <div className={compactMode ? 'mr-12' : 'mr-8'}>
                  <LogoLink compactMode={compactMode} />
                </div>
                {postTitle && (
                  <div className="pr-12 block">
                    <p className="font-medium tracking-wide max-w-124 overflow-hidden prose-p2 text-ellipsis whitespace-nowrap text-neutral-900">
                      {postTitle}
                    </p>
                  </div>
                )}
                <div
                  className={cn(
                    'ease-in-out overflow-hidden transition-all duration-500',
                    compactMode
                      ? 'max-h-0 -translate-x-8 scale-95 opacity-0'
                      : 'max-h-20 max-w-auto scale-100 opacity-100',
                    postTitle && compactMode && 'max-w-0'
                  )}
                >
                  <span className="font-medium translate-y-0 inline-block prose-p2 tracking-[2.2px]! text-nowrap text-neutral-900 opacity-100">
                    理解世界 × 參與未來
                  </span>
                </div>
              </div>

              <div className="gap-4 flex items-center">
                <ActionButtons
                  tags={keywords}
                  hideCtaButtons={compactMode}
                  searchPlaceholder={searchPlaceholder}
                  subscribeUrl={subscribeUrl}
                  joinUsUrl={joinUsUrl}
                />
                <a
                  href={isLoggedIn ? '/member' : (loginUrl ?? '/login')}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 transition-colors duration-200 hover:text-red-500"
                  aria-label="登入"
                >
                  <LoginIcon />
                </a>
              </div>
            </div>

            <div
              className={cn(
                'ease-in-out overflow-hidden transition-all duration-500',
                compactMode
                  ? 'h-0 -translate-y-4 opacity-0'
                  : 'translate-y-0 h-auto opacity-100'
              )}
            >
              <BottomNavigation
                onHamburgerOverlayOpen={onHamburgerOverlayOpen}
                menuItems={menuItems}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
