'use client'
import { cn, ScrollLevel, useScrollLevel } from '@kids-reporter/routing-ui'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useArticleContext } from '@/modules/article/context'
import { FontSizeLevel } from '@/constants'
import useClickOutside from '@/hooks/use-click-outside'
import {
  ToolbarCheckAnswerIcon,
  ToolbarFontIcon,
  ToolbarPrintIcon,
  ToolbarShareIcon,
  ToolbarTopicIcon,
} from '@/icons/miscellaneous'
import PostEssayQuestionsModal from '@/modules/idea-hub/post-essay-questions-modal'

import { SHARE_ICONS } from '../constants'

type MobileToolbarProp = {
  topicURL: string
  onCheckAnswerClick: () => void
}

function MobileToolbar({ topicURL, onCheckAnswerClick }: MobileToolbarProp) {
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false)
  const scrollLevel = useScrollLevel()
  const { onFontSizeChange } = useArticleContext()
  const toolbarRef = useRef<HTMLDivElement>(null)

  const onShareClick = () => {
    setIsSharePanelOpen(!isSharePanelOpen)
  }

  const isHidden = scrollLevel === ScrollLevel.DOWN_HIDDEN

  useEffect(() => {
    if (isHidden) {
      setIsSharePanelOpen(false)
    }
  }, [isHidden])

  const handleClickOutside = useCallback(() => {
    if (isSharePanelOpen) {
      setIsSharePanelOpen(false)
    }
  }, [isSharePanelOpen])

  useClickOutside(toolbarRef, handleClickOutside)

  return (
    <div
      className={cn(
        'z-1001 flex flex-col items-center transition-all duration-400 print:hidden',
        {
          'pointer-events-none max-h-0 translate-y-10 opacity-0': isHidden,
          'max-h-50 translate-y-0 opacity-100': !isHidden,
        }
      )}
    >
      <div
        ref={toolbarRef}
        className="relative flex flex-col items-center justify-center"
      >
        <div
          className={cn(
            'pointer-events-none relative -z-1 mb-4 flex translate-y-15 flex-row items-center gap-4 opacity-0 transition-all duration-300 ease-in-out',
            {
              'pointer-events-auto z-1 translate-y-0 opacity-100':
                isSharePanelOpen,
            }
          )}
        >
          {SHARE_ICONS.map(({ icon, label, onClick }) => {
            return (
              <button
                className="flex aspect-square w-10 cursor-pointer appearance-none items-center justify-center border-none bg-transparent"
                key={`share-icon-${label}`}
                onClick={onClick}
                aria-label={`Share via ${label}`}
              >
                {icon}
              </button>
            )
          })}
        </div>
        <div className="relative z-3 flex h-14 flex-row items-center justify-end gap-2 rounded-[60px] bg-neutral-white px-4 py-2 text-center shadow-[var(--shadow-baodaozai-card)]">
          <Link
            className="flex w-[50px] cursor-pointer flex-col items-center justify-center border-none bg-transparent"
            href={topicURL}
            aria-label="Go to topic"
          >
            <div className="flex h-6 w-6 items-center justify-center text-neutral-600">
              <ToolbarTopicIcon />
            </div>
            <span className="prose-p4 text-neutral-900">前往專題</span>
          </Link>
          <button
            className="flex w-[50px] cursor-pointer flex-col items-center justify-center border-none bg-transparent"
            onClick={onCheckAnswerClick}
            aria-label="Check answer"
          >
            <div className="flex h-6 w-6 items-center justify-center text-neutral-600">
              <ToolbarCheckAnswerIcon />
            </div>
            <span className="prose-p4 text-neutral-900">查看回答</span>
          </button>
          <button
            className="flex w-[50px] cursor-pointer flex-col items-center justify-center border-none bg-transparent text-neutral-600"
            onClick={onShareClick}
            aria-label="Share article"
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <ToolbarShareIcon />
            </div>
            <span className="prose-p4 text-neutral-900">分享</span>
          </button>
          <button
            className="flex w-[50px] cursor-pointer flex-col items-center justify-center border-none bg-transparent text-neutral-600"
            onClick={onFontSizeChange}
            aria-label="Change font size"
          >
            <div className="flex h-6 w-6 items-center justify-center">
              <ToolbarFontIcon />
            </div>
            <span className="prose-p4 text-neutral-900">文字大小</span>
          </button>
        </div>
      </div>
    </div>
  )
}

type DesktopToolbarProp = {
  topicURL: string
  onCheckAnswerClick: () => void
}

function DesktopToolbar({ topicURL, onCheckAnswerClick }: DesktopToolbarProp) {
  const [isSharePanelOpen, setIsSharePanelOpen] = useState(false)
  const { onFontSizeChange, fontSize } = useArticleContext()
  const toolbarRef = useRef<HTMLDivElement>(null)

  const onShareClick = () => {
    setIsSharePanelOpen(!isSharePanelOpen)
  }

  const handleClickOutside = useCallback(() => {
    if (isSharePanelOpen) {
      setIsSharePanelOpen(false)
    }
  }, [isSharePanelOpen])

  useClickOutside(toolbarRef, handleClickOutside)

  return (
    <div className="flex w-16 flex-col items-center gap-3" ref={toolbarRef}>
      <div className="relative flex w-full flex-col items-center gap-3 rounded-full bg-neutral-100 py-3">
        <Link
          href={topicURL}
          className="group relative flex aspect-square w-10 cursor-pointer items-center justify-center rounded-full border-none bg-blue-400 p-2 text-neutral-white transition-colors duration-200 hover:bg-blue-500"
          aria-label="Go to topic"
        >
          <div className="relative z-1">
            <ToolbarTopicIcon />
          </div>
          <span className="absolute z-0 w-4 text-start prose-p3-bold text-nowrap text-neutral-black opacity-0 transition-all duration-200 [text-shadow:0_0_6px_white,0_0_12px_white] group-hover:translate-x-12 group-hover:opacity-100">
            前往專題
          </span>
        </Link>
        <button
          className="group relative flex aspect-square w-10 cursor-pointer appearance-none items-center justify-center rounded-full border-none bg-yellow-400 p-2 text-neutral-white transition-colors duration-200 hover:bg-yellow-500"
          onClick={onCheckAnswerClick}
          aria-label="Check answer"
        >
          <div className="relative z-1">
            <ToolbarCheckAnswerIcon />
          </div>
          <span className="absolute z-0 w-4 text-start prose-p3-bold text-nowrap text-neutral-black opacity-0 transition-all duration-200 [text-shadow:0_0_6px_white,0_0_12px_white] group-hover:translate-x-12 group-hover:opacity-100">
            查看回答
          </span>
        </button>
      </div>
      <div className="relative flex w-full flex-col items-center gap-3 rounded-full bg-neutral-100 py-3">
        <button
          className="group relative flex aspect-square w-10 cursor-pointer appearance-none items-center justify-center rounded-full border-none bg-neutral-600 p-2 text-neutral-white transition-colors duration-200 hover:bg-neutral-800"
          onClick={onFontSizeChange}
          aria-label="Change font size"
        >
          <div className="relative z-1">
            <ToolbarFontIcon />
          </div>
          <span className="absolute z-0 w-4 text-start prose-p3-bold text-nowrap text-neutral-black opacity-0 transition-all duration-200 [text-shadow:0_0_6px_white,0_0_12px_white] group-hover:translate-x-12 group-hover:opacity-100">
            字體大小{fontSize === FontSizeLevel.NORMAL ? '100%' : '125%'}
          </span>
        </button>
        <button
          className="group relative flex aspect-square w-10 cursor-pointer appearance-none items-center justify-center rounded-full border-none bg-neutral-600 p-2 text-neutral-white transition-colors duration-200 hover:bg-neutral-800"
          onClick={() => window.print()}
          aria-label="Print article"
        >
          <div className="relative z-1">
            <ToolbarPrintIcon />
          </div>
          <span className="absolute z-0 w-4 text-start prose-p3-bold text-nowrap text-neutral-black opacity-0 transition-all duration-200 [text-shadow:0_0_6px_white,0_0_12px_white] group-hover:translate-x-12 group-hover:opacity-100">
            列印
          </span>
        </button>
        <div
          className={cn(
            'pointer-events-none absolute top-6 left-21 flex translate-x-[-15px] flex-col gap-3 rounded-[40px] bg-neutral-white p-3 opacity-0 shadow-[var(--shadow-baodaozai-card)] transition-all duration-300 ease-in-out',
            {
              'pointer-events-auto translate-x-0 opacity-100': isSharePanelOpen,
            }
          )}
        >
          {SHARE_ICONS.map(({ icon, label, onClick }) => {
            return (
              <button
                className="flex aspect-square w-10 cursor-pointer appearance-none items-center justify-center border-none bg-transparent"
                key={`share-icon-${label}`}
                onClick={onClick}
                aria-label={`Share via ${label}`}
              >
                {icon}
              </button>
            )
          })}
          <div className="absolute top-1/2 -left-3 -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
            >
              <path d="M0 6L12 4.29138e-07V12L0 6Z" fill="white" />
            </svg>
          </div>
        </div>
        <button
          className={cn(
            'group relative flex aspect-square w-10 cursor-pointer appearance-none items-center justify-center rounded-full border-none bg-neutral-600 p-2 text-neutral-white transition-colors duration-200 hover:bg-neutral-800',
            {
              'bg-neutral-800': isSharePanelOpen,
            }
          )}
          onClick={onShareClick}
          aria-label="Share article"
        >
          <div className="relative z-1">
            <ToolbarShareIcon />
          </div>
          <span
            className={cn(
              'absolute z-0 w-4 text-start prose-p3-bold text-nowrap text-neutral-black opacity-0 transition-all duration-200 [text-shadow:0_0_6px_white,0_0_12px_white] group-hover:translate-x-12 group-hover:opacity-100',
              {
                'group-hover:opacity-0': isSharePanelOpen,
              }
            )}
          >
            分享
          </span>
        </button>
      </div>
    </div>
  )
}

type ToolbarProp = {
  topicURL: string
  postSlug: string
}

function Toolbar({ topicURL, postSlug }: ToolbarProp) {
  const [isPostEssayQuestionsModalOpen, setIsPostEssayQuestionsModalOpen] =
    useState(false)
  return (
    <>
      {/* 148px is 1/2 of toolbar height */}
      <div className="fixed bottom-6 left-6 z-1000 tablet:bottom-8 tablet:left-1/2 tablet:-translate-x-1/2 desktop:sticky desktop:top-[calc(50vh+148px)] desktop:left-12 desktop:z-[999] desktop:flex desktop:h-0 desktop:translate-x-0 desktop:items-end hd:left-20 print:hidden">
        <div className="desktop:hidden">
          <MobileToolbar
            topicURL={topicURL}
            onCheckAnswerClick={() => setIsPostEssayQuestionsModalOpen(true)}
          />
        </div>
        <div className="hidden desktop:block">
          <DesktopToolbar
            topicURL={topicURL}
            onCheckAnswerClick={() => setIsPostEssayQuestionsModalOpen(true)}
          />
        </div>
      </div>
      <PostEssayQuestionsModal
        open={isPostEssayQuestionsModalOpen}
        onClose={() => setIsPostEssayQuestionsModalOpen(false)}
        postSlug={postSlug}
        mode="in-article"
      />
    </>
  )
}

export default Toolbar
