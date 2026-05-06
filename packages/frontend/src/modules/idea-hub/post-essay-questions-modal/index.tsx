'use client'

import { cn, useMediaQuery } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { usePostEssayQuestionsByPostSlugQuery } from '@/api-utils/react-query/hooks/post'
import { Accordion } from '@/components/accordion'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog'
import { FALLBACK_IMG } from '@/constants'
import {
  ArticleShortcutIconLarge,
  IdeaHubShortcutIcon,
  XIcon,
} from '@/icons/miscellaneous'

import ModalQuestionCard from './modal-question-card'

type PostEssayQuestionsModalProps = {
  postSlug: string
  open: boolean
  onClose: () => void
  mode?: 'default' | 'in-article'
}

function PostEssayQuestionsModal({
  postSlug,
  open,
  onClose,
  mode = 'default',
}: PostEssayQuestionsModalProps) {
  const { data: post, isPending } = usePostEssayQuestionsByPostSlugQuery({
    slug: postSlug,
  })

  const heroImageUrl = post?.heroImage?.resized?.medium || FALLBACK_IMG
  const firstCategory = post?.subSubcategoriesOrdered?.[0]?.name

  const [scrolledQuestionIds, setScrolledQuestionIds] = useState<Set<string>>(
    new Set()
  )

  const handleQuestionCardScrollChange = useCallback(
    (questionId: string, isScrolled: boolean) => {
      setScrolledQuestionIds((prev) => {
        const next = new Set(prev)
        if (isScrolled) {
          next.add(questionId)
        } else {
          next.delete(questionId)
        }
        return next
      })
    },
    []
  )

  const isAnyQuestionCardScrolled = scrolledQuestionIds.size > 0

  const isMobile = useMediaQuery('(max-width: 767px)')
  const accordionContainerRef = useRef<HTMLDivElement>(null)
  const headerTitleNodeRef = useRef<HTMLDivElement>(null)
  const [isAccordionScrolled, setIsAccordionScrolled] = useState(false)

  useEffect(() => {
    const container = accordionContainerRef.current
    const titleNode = headerTitleNodeRef.current
    if (!container || !isMobile || !titleNode) return

    const handleScroll = () => {
      if (
        !isAccordionScrolled &&
        container.scrollTop > titleNode.clientHeight
      ) {
        setIsAccordionScrolled(true)
      }

      if (isAccordionScrolled && container.scrollTop === 0) {
        setIsAccordionScrolled(false)
      }
    }

    handleScroll()

    container.addEventListener('scroll', handleScroll, { passive: true })

    const timeoutId = setTimeout(() => {
      handleScroll()
    }, 100)

    return () => {
      clearTimeout(timeoutId)
      container.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile, isAccordionScrolled])

  const isContainerScrolled = isAccordionScrolled || isAnyQuestionCardScrolled
  const defaultAccordionValue = useMemo(() => {
    return (
      post?.postEssayQuestions?.map((question) => question.id.toString()) ?? []
    )
  }, [post?.postEssayQuestions])

  const handleOpenChange = useCallback(
    (isOpen: boolean) => {
      if (!isOpen) {
        onClose()
        setScrolledQuestionIds(new Set())
      }
    },
    [onClose]
  )

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="gap-0 overflow-hidden bg-neutral-100"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Post Essay Questions</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <div className="flex items-center justify-center py-12">
            <p className="prose-p1 text-neutral-500">載入中...</p>
          </div>
        ) : (
          <div className="relative flex min-h-0 flex-1 flex-col gap-4">
            {/* Post Header */}
            <div className="absolute top-0 right-0 left-0 h-50 w-full desktop:h-60">
              <Image
                src={heroImageUrl}
                alt={post?.title || '文章圖片'}
                className="object-cover"
                fill
                sizes="(max-width: 768px) 300px, (max-width: 1024px) 336px, (max-width: 1280px) 400px, 440px"
              />
              {/* Gradient Overlay */}
              <div
                className="absolute bottom-0 z-10 h-12 w-full desktop:h-14"
                style={{
                  background:
                    'linear-gradient(0deg, #F8F8F8 0%, rgba(248, 248, 248, 0.00) 100%)',
                }}
              />
              {/* Dark Overlay */}
              <div className="absolute inset-0 z-0 bg-black/30 backdrop-blur-[4px]" />
            </div>

            <div
              ref={headerTitleNodeRef}
              className="relative z-20 flex w-full flex-col gap-2 overflow-hidden rounded-t-3xl px-6 pt-6"
            >
              <div className="flex w-full min-w-0 items-center justify-between gap-10">
                <div className="flex min-w-0 flex-1 items-start gap-2 overflow-hidden">
                  <div className="mt-1 flex flex-shrink-0 rounded-[30px] bg-red-400 px-3 py-1">
                    <span className="prose-p2 text-white">{firstCategory}</span>
                  </div>
                  <div className="hidden min-w-0 flex-1 py-1 tablet:block">
                    <div
                      className={cn(
                        'overflow-hidden transition-all duration-300 ease-in-out',
                        isAnyQuestionCardScrolled
                          ? 'max-h-[1.8em]'
                          : 'max-h-[5.4em]'
                      )}
                    >
                      <h3
                        className={cn(
                          'line-clamp-3 w-full prose-p1-bold text-white text-shadow-[0px_1px_4px_0px_rgba(0,0,0,0.6)] desktop:prose-h6-small',
                          isAnyQuestionCardScrolled && 'line-clamp-1'
                        )}
                      >
                        {post?.title ?? ''}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4">
                  <Link
                    href={
                      mode === 'default' ? `/article/${postSlug}` : '/idea-hub'
                    }
                    className="flex size-10 items-center justify-center gap-1 rounded-full bg-neutral-white/30 text-neutral-white hover:bg-neutral-white/50"
                  >
                    {mode === 'default' ? (
                      <ArticleShortcutIconLarge />
                    ) : (
                      <IdeaHubShortcutIcon />
                    )}
                  </Link>
                  <DialogClose className="flex size-10 cursor-pointer items-center justify-center gap-1 rounded-full bg-neutral-white/30 text-neutral-white hover:bg-neutral-white/50">
                    <XIcon />
                    <span className="sr-only">Close</span>
                  </DialogClose>
                </div>
              </div>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300 ease-in-out tablet:hidden',
                  isContainerScrolled ? 'max-h-[1.8em]' : 'max-h-[5.4em]'
                )}
              >
                <h3
                  className={cn(
                    'line-clamp-3 prose-p1-bold text-white',
                    isContainerScrolled && 'line-clamp-1'
                  )}
                >
                  {post?.title ?? ''}
                </h3>
              </div>
            </div>

            <div
              ref={accordionContainerRef}
              className="relative z-20 flex min-h-0 scrollbar-thin flex-1 flex-col overflow-y-auto tablet:overflow-visible"
            >
              <Accordion
                type="multiple"
                className="flex min-h-0 flex-1 flex-col"
                defaultValue={defaultAccordionValue}
              >
                <div className="flex flex-col gap-4 px-6 pb-4 tablet:h-full tablet:flex-row tablet:items-start tablet:overflow-x-auto tablet:pb-6 hd:overflow-x-hidden">
                  {post?.postEssayQuestions?.map((question) => (
                    <ModalQuestionCard
                      key={question.id}
                      questionId={question.id.toString()}
                      questionTitle={question.title ?? ''}
                      onScrollChange={handleQuestionCardScrollChange}
                      isSelfScrolled={scrolledQuestionIds.has(
                        question.id.toString()
                      )}
                    />
                  ))}
                </div>
              </Accordion>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default PostEssayQuestionsModal
