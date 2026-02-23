'use client'

import { useEffect } from 'react'

import Button from '../../components/button'
import { ClearIcon } from '../../icons'
import type { MenuItem, SocialMediaHrefs } from '../../types'
import { cn } from '../../utils/cn'
import { generateSocialMediaConfig } from '../../utils/generate-social-media-config'
import { SearchInputSection } from '../shared-components'
import HeaderMenuItem from './header-menu-item'
import HeaderMenuItemGroup from './header-menu-item-group'

type MenuProps = {
  isOpen: boolean
  onClose: () => void
  keywords: string[]
  menuItems: MenuItem[]
  additionalMenuItems: MenuItem[]
  socialMediaHrefs: SocialMediaHrefs
  donateUrl: string
  subscribeUrl: string
  searchPlaceholder: string
}

function Divider() {
  return (
    <div className="px-6 tablet:px-8 py-4 w-full">
      <div className="h-px w-full bg-neutral-300"></div>
    </div>
  )
}

function Menu({
  isOpen,
  onClose,
  keywords,
  menuItems,
  additionalMenuItems,
  socialMediaHrefs,
  donateUrl,
  subscribeUrl,
  searchPlaceholder,
}: MenuProps) {
  const socialMediaConfig = generateSocialMediaConfig(socialMediaHrefs)

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }

    return () => {
      document.body.classList.remove('no-scroll')
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'inset-0 fixed z-overlay bg-neutral-500/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className={cn(
          'top-0 left-0 tablet:w-80 bg-white shadow-2xl ease-in-out tablet:pt-0 fixed z-overlay h-full scrollbar-thin w-full transform pt-(--mobile-header-height) transition-transform duration-300',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="px-6 tablet:px-8 py-4 mt-4 hidden items-center justify-between tablet:flex">
            <div className="flex items-center">
              <a href="/">
                <img
                  src="/assets/images/brand-icon.svg"
                  alt="少年報導者 The Reporter for Kids"
                  className="h-5"
                  height={20}
                  width={183}
                  loading="eager"
                />
              </a>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors duration-200 hover:text-neutral-800"
              aria-label="關閉選單"
            >
              <ClearIcon />
            </button>
          </div>

          <div className="px-6 tablet:px-8 pt-4 desktop:hidden">
            <SearchInputSection
              mode="inline"
              tags={keywords}
              searchPlaceholder={searchPlaceholder}
            />
          </div>

          <div className="py-4 flex-1">
            <HeaderMenuItem {...menuItems?.[0]} />

            <Divider />

            {/* Categories */}
            <div className="py-2">
              <HeaderMenuItemGroup isMenuOpen={isOpen} menuItems={menuItems} />
            </div>

            <Divider />

            {/* My Reading */}
            <HeaderMenuItem
              {...additionalMenuItems?.[0]}
              contentClassName="text-neutral-600 [&_span]:[font-family:var(--font-family-noto)] [&_span]:[font-size:var(--font-size-p2)] [&_span]:[font-weight:500] [&_span]:[line-height:var(--line-height-normal)] [&_span]:[letter-spacing:var(--letter-spacing-wide)] hover:text-neutral-900"
            />
            {/* Reading Settings */}
            <HeaderMenuItem
              {...additionalMenuItems?.[1]}
              contentClassName="text-neutral-600 [&_span]:[font-family:var(--font-family-noto)] [&_span]:[font-size:var(--font-size-p2)] [&_span]:[font-weight:500] [&_span]:[line-height:var(--line-height-normal)] [&_span]:[letter-spacing:var(--letter-spacing-wide)] hover:text-neutral-900"
            />

            <Divider />

            {/* About Us Section */}
            <div className="py-2">
              {additionalMenuItems.slice(2).map((item) => (
                <HeaderMenuItem
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  external={item.external}
                  contentClassName="text-neutral-600 [&_span]:[font-family:var(--font-family-noto)] [&_span]:[font-size:var(--font-size-p2)] [&_span]:[font-weight:500] [&_span]:[line-height:var(--line-height-normal)] [&_span]:[letter-spacing:var(--letter-spacing-wide)] hover:text-neutral-900"
                />
              ))}
            </div>

            <Divider />

            {/* Social Media */}
            <div className="px-6 tablet:px-8">
              <div className="gap-4 tablet:gap-0 px-4 flex items-center justify-center tablet:justify-between">
                {socialMediaConfig.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="text-neutral-900 transition-colors duration-200 hover:text-red-500"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                  >
                    <div className="w-6 h-6 flex items-center justify-center">
                      {item.icon && <item.icon />}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 tablet:px-8 py-6 tablet:pt-6 tablet:pb-8">
            <div className="gap-4 flex flex-col">
              <Button variant="secondary" size={44} asChild className="w-full">
                <a
                  href={subscribeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  訂閱電子報
                </a>
              </Button>
              <Button variant="primary" size={44} asChild className="w-full">
                <a href={donateUrl} target="_blank" rel="noopener noreferrer">
                  贊助我們
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Menu
