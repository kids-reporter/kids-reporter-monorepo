'use client'

import { ArrowIcon, ClearIcon, LoginIcon } from '../icons'
import { cn } from '../utils/cn'
import { HamburgerButton, LogoLink } from './shared-components'

type MobileHeaderProps = {
  onHamburgerOverlayOpen: () => void
  onCloseMenu: () => void
  showCloseButtonWhenMenuOpen: boolean
  isMenuOpen: boolean
  isLoggedIn?: boolean
  mobileBackButtonHref?: string
  loginUrl?: string
  hide?: boolean
  showBackgroundColor?: boolean
}

export function MobileHeader({
  onHamburgerOverlayOpen,
  onCloseMenu,
  showCloseButtonWhenMenuOpen,
  isMenuOpen,
  isLoggedIn,
  loginUrl,
  mobileBackButtonHref,
  hide = false,
  showBackgroundColor = false,
}: MobileHeaderProps) {
  const showCloseButton = showCloseButtonWhenMenuOpen && isMenuOpen

  return (
    <>
      <div
        className={cn(
          'h-(--mobile-header-height) desktop:hidden',
          hide && 'h-0'
        )}
      ></div>
      <div
        className={cn(
          'px-6 tablet:px-8 ease-in-out top-0 translate-y-0 pointer-events-auto fixed z-modal w-full opacity-100 transition-all duration-300 tablet:z-bar desktop:hidden',
          hide && 'pointer-events-none -translate-y-full opacity-0',
          showBackgroundColor && 'bg-neutral-white'
        )}
      >
        <div className="py-4 flex items-center justify-between">
          <div className="flex items-center">
            {mobileBackButtonHref && (
              <a
                href={mobileBackButtonHref}
                className="size-8 mr-2 flex cursor-pointer items-center justify-center text-neutral-600 tablet:hidden"
              >
                <ArrowIcon />
              </a>
            )}
            <LogoLink />
          </div>

          <div className="gap-4 flex items-center">
            {!showCloseButton && (
              <a
                href={isLoggedIn ? '/member' : (loginUrl ?? '/login')}
                className="w-8 h-8 flex items-center justify-center rounded-full text-red-400 transition-colors duration-200 hover:text-red-500"
                aria-label="登入"
              >
                <LoginIcon />
              </a>
            )}
            {showCloseButton ? (
              <button
                onClick={onCloseMenu}
                className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors duration-200 hover:text-neutral-800"
                aria-label="關閉選單"
              >
                <ClearIcon />
              </button>
            ) : (
              <HamburgerButton
                onHamburgerOverlayOpen={onHamburgerOverlayOpen}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}
