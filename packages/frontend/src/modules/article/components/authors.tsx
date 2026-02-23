'use client'

import { Button, cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { DEFAULT_AVATAR } from '@/constants'
import useClickOutside from '@/hooks/use-click-outside'
import { OurTeamIcon, OurTeamIconLarge } from '@/icons'
import { ArrowLeft, ArrowRight } from '@/icons/arrow'

import { Author } from '../types'

type AuthorsProp = {
  authors: Author[]
}

const CARD_WIDTH = 248
const GAP = 24

function AuthorCard({ author }: { author: Author }) {
  const avatarURL = author.avatar ?? DEFAULT_AVATAR
  const roleText = author.roleName ?? author.role
  const [isClicked, setIsClicked] = useState(false)

  const ref = useRef<HTMLDivElement>(null)

  const handleClick = () => {
    setIsClicked((prev) => !prev)
  }

  useClickOutside(ref, () => setIsClicked(false))

  return (
    <>
      <div
        onClick={handleClick}
        className="group relative block min-w-62 cursor-pointer snap-start perspective-[1000px] desktop:hidden"
        ref={ref}
      >
        <div
          className={cn(
            'relative h-[270px] w-full transition-transform duration-500 transform-3d',
            isClicked && 'transform-[rotateY(180deg)]'
          )}
        >
          <div className="absolute inset-0 flex transform-[rotateY(0deg)] flex-col items-center justify-center gap-5 rounded-[20px] border-2 border-neutral-200 bg-neutral-white p-6 backface-hidden">
            <div className="h-30 w-30 overflow-hidden rounded-full">
              <Image
                className="h-full w-full object-cover"
                src={avatarURL}
                alt={author.name}
                width={120}
                height={120}
                loading="lazy"
              />
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="text-center prose-h6-large font-bold text-neutral-900">
                {author.name}
              </span>
              <span className="text-center prose-p2-bold text-neutral-700">
                {roleText}
              </span>
            </div>
          </div>

          <div className="absolute inset-0 flex h-[270px] transform-[rotateY(180deg)] flex-col gap-4 rounded-[20px] bg-neutral-300 p-6 backface-hidden">
            <div className="flex flex-1 flex-col gap-1">
              <span className="prose-p1-bold text-neutral-900">
                {author.name}｜{roleText}
              </span>
              <p className="line-clamp-5 text-justify prose-p2 text-neutral-900">
                {author.bio}
              </p>
            </div>

            <div
              className="flex justify-end"
              onClick={(e) => e.stopPropagation()}
            >
              <Link
                href={author.slug ? `/author/${author.slug}` : '#'}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-white transition-colors duration-200 hover:bg-red-500 hover:text-neutral-white"
                onClick={(e) => e.stopPropagation()}
              >
                <ArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Link
        href={author.slug ? `/author/${author.slug}` : '#'}
        key={author.id}
        className="group relative hidden min-w-62 snap-start desktop:block"
      >
        <div className="flex h-[270px] flex-col items-center justify-center gap-5 rounded-[20px] border-2 border-neutral-200 bg-neutral-white p-6 transition-opacity group-hover:opacity-0">
          <div className="h-30 w-30 overflow-hidden rounded-full">
            <Image
              className="h-full w-full object-cover"
              src={avatarURL}
              alt={author.name}
              width={120}
              height={120}
              loading="lazy"
            />
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-center prose-h6-large font-bold text-neutral-900">
              {author.name}
            </span>
            <span className="text-center prose-p2-bold text-neutral-700">
              {roleText}
            </span>
          </div>
        </div>

        <div className="absolute inset-0 z-10 flex h-[270px] flex-col gap-4 rounded-[20px] bg-neutral-300 p-6 opacity-0 transition-opacity group-hover:opacity-100 group-active:opacity-100">
          <div className="flex flex-1 flex-col gap-1">
            <span className="prose-p1-bold text-neutral-900">
              {author.name}｜{roleText}
            </span>
            <p className="line-clamp-5 text-justify prose-p2 text-neutral-900">
              {author.bio}
            </p>
          </div>

          <div className="flex justify-end">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-white transition-colors duration-200 hover:bg-red-500 hover:text-neutral-white">
              <ArrowRight />
            </div>
          </div>
        </div>
      </Link>
    </>
  )
}

function Authors({ authors }: AuthorsProp) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isAtStart, setIsAtStart] = useState(true)
  const [isAtEnd, setIsAtEnd] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    const atStart = el.scrollLeft <= 0
    const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1
    setIsAtStart(atStart)
    setIsAtEnd(atEnd)
  }, [])

  useEffect(() => {
    const el = scrollContainerRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState)
    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      resizeObserver.disconnect()
    }
  }, [updateScrollState])

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollAmount = CARD_WIDTH + GAP
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      })
    }
  }, [])

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      const scrollAmount = CARD_WIDTH + GAP
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      })
    }
  }, [])

  return (
    <div className="flex flex-col gap-6 pt-14 tablet:gap-8 tablet:pt-20 desktop:gap-10">
      <div className="mx-auto flex w-[min(100vw,1200px)] items-center gap-2 px-6 tablet:px-8 desktop:px-12 hd:px-14">
        <OurTeamIcon className="desktop:hidden" />
        <OurTeamIconLarge className="hidden desktop:block" />
        <h2 className="mr-auto prose-h2-small font-swei! text-neutral-900 desktop:prose-h2-large">
          誰幫我們完成這篇文章
        </h2>
        <Button
          variant="secondary"
          className="mr-2 hidden size-11 p-0 tablet:flex"
          onClick={scrollLeft}
          disabled={isAtStart}
        >
          <ArrowLeft />
        </Button>
        <Button
          variant="secondary"
          className="hidden size-11 p-0 tablet:flex"
          onClick={scrollRight}
          disabled={isAtEnd}
        >
          <ArrowRight />
        </Button>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex max-w-screen snap-x snap-mandatory scroll-px-6 gap-6 overflow-x-auto px-6 pb-2 scrollbar-none tablet:scroll-px-8 tablet:px-8 desktop:w-screen desktop:scroll-px-[max(calc(50vw+56px-600px),48px)] desktop:px-[max(calc(50vw+56px-600px),48px)]"
      >
        {authors.map((author) => {
          return <AuthorCard key={author.id} author={author} />
        })}
      </div>
    </div>
  )
}

export default Authors
