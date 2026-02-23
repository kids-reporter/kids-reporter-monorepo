'use client'
import {
  ADDITIONAL_MENU_ITEMS,
  DONATE_URL,
  JOIN_US_URL,
  MENU_ITEMS,
  SEARCH_PLACEHOLDER,
  SOCIAL_MEDIA_ITEMS,
  SUBSCRIBE_URL,
} from '../constants/default-values'
import {
  ScrollLevel,
  useIsAtTop,
  useMediaQuery,
  useScrollLevel,
} from '../hooks'
import type { MenuItem, SocialMediaHrefs } from '../types'
import { DesktopHeader } from './desktop-header'
import { useHeaderContext } from './header-context'
import Menu from './menu'
import { MobileHeader } from './mobile-header'

type HeaderProps = {
  menuItems?: MenuItem[]
  additionalMenuItems?: MenuItem[]
  socialMediaHrefs?: SocialMediaHrefs
  searchPlaceholder?: string
  subscribeUrl?: string
  donateUrl?: string
  joinUsUrl?: string
}

function Header({
  menuItems = MENU_ITEMS,
  additionalMenuItems = ADDITIONAL_MENU_ITEMS,
  socialMediaHrefs = SOCIAL_MEDIA_ITEMS.map((item) => item.href),
  searchPlaceholder = SEARCH_PLACEHOLDER,
  subscribeUrl = SUBSCRIBE_URL,
  donateUrl = DONATE_URL,
  joinUsUrl = JOIN_US_URL,
}: HeaderProps) {
  const context = useHeaderContext()
  const postTitle = context?.postTitle
  const isLoggedIn = context?.isLoggedIn || false
  const loginUrl = context?.loginUrl || '/login'
  const isMenuOpen = context?.isMenuOpen || false
  const openMenu = context?.openMenu
  const closeMenu = context?.closeMenu
  const keywords = context?.keywords || []
  const onHamburgerOverlayOpen = () => {
    openMenu?.()
  }
  const mobileBackButtonHref = context?.mobileBackButtonHref

  const onCloseMenu = () => {
    closeMenu?.()
  }

  const isMobile = useMediaQuery('(max-width: 768px)')

  const isAtTop = useIsAtTop()
  const scrollingLevel = useScrollLevel({
    scrollDownDistance: 150,
    throttleThreshold: 50,
  })

  const isScrollingDown = scrollingLevel === ScrollLevel.DOWN_HIDDEN

  return (
    <>
      <DesktopHeader
        onHamburgerOverlayOpen={onHamburgerOverlayOpen}
        keywords={keywords}
        hide={isScrollingDown}
        compactMode={!isAtTop}
        postTitle={isAtTop ? undefined : postTitle}
        searchPlaceholder={searchPlaceholder}
        subscribeUrl={subscribeUrl}
        menuItems={menuItems}
        isLoggedIn={isLoggedIn}
        loginUrl={loginUrl}
        joinUsUrl={joinUsUrl}
      />
      <MobileHeader
        onCloseMenu={onCloseMenu}
        showCloseButtonWhenMenuOpen={isMobile}
        onHamburgerOverlayOpen={onHamburgerOverlayOpen}
        isMenuOpen={isMenuOpen}
        isLoggedIn={isLoggedIn}
        loginUrl={loginUrl}
        mobileBackButtonHref={mobileBackButtonHref}
        hide={isScrollingDown}
        showBackgroundColor={!isAtTop}
      />
      <Menu
        isOpen={isMenuOpen}
        onClose={closeMenu || (() => undefined)}
        keywords={keywords}
        menuItems={menuItems}
        additionalMenuItems={additionalMenuItems}
        socialMediaHrefs={socialMediaHrefs}
        donateUrl={donateUrl}
        subscribeUrl={subscribeUrl}
        searchPlaceholder={searchPlaceholder}
      />
    </>
  )
}

export default Header
