'use client'

import { GetPostQuery } from '__generated__/operations/content.generated'
import {
  HeaderPostTitleSetter,
  ScrollLevel,
  useBodyScrollLock,
  useMediaQuery,
  useScrollLevel,
} from '@kids-reporter/routing-ui'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { TableOfContentSideMenu } from '@/components/table-of-content'
import { FontSizeLevel } from '@/constants'
import { BAODAOZAI_DEFAULT_ESSAY_QUESTION_COUNT } from '@/constants/baodaozai-question-count'
import { SeparateIcon } from '@/icons'
import { useHydratedAuthStore } from '@/services/auth/use-hydrated-auth-store'
import {
  BaodaozaiActionSetter,
  BaodaozaiChoiceQuestion,
  BaodaozaiEssayQuestion,
  BaodaozaiQAModal,
  BaodaozaiQuestions,
  BaodaozaiVisibilitySetter,
  QAModalEvent,
} from '@/services/call-baodaozai'
import getLoginUrl from '@/utils/get-login-url'

import SupportAction from '../../components/support-action'
import ArticleBaodaozaiEventTrigger from './components/article-baodaozai-event-trigger'
import ArticleSummary from './components/article-summary'
import Authors from './components/authors'
import ImageModal from './components/image-modal'
import NewsReading from './components/news-reading'
import PopularKeywords from './components/popular-keywords'
import PostRenderer from './components/post-renderer'
import RelatedArticles from './components/related-articles'
import StartReadingBaodaozaiEventTrigger from './components/start-reading-baodaozai-event-trigger'
import SupportActionContent from './components/support-action-content'
import TitleHero from './components/title-hero'
import Toolbar from './components/toolbar'
import { ArticleContext } from './context'
import useBatchSubmitAnswers from './hooks/use-batch-submit-answers'
import { Keyword } from './types'
import parsePostToContent from './utils/parse-post-to-content'
import parseTocIndexesFromEntityMap from './utils/parse-toc-indexes-from-entity-map'
import trimEmptyBlocks from './utils/trim-empty-blocks'

const ArticleModule = ({
  post,
  slug,
}: {
  post: NonNullable<GetPostQuery['post']>
  slug: string
}) => {
  const {
    topicURL,
    mainTopic,
    authorsInBrief,
    orderedAuthors,
    relatedPosts,
    twReporterRelatedPosts,
    subSubcategory,
    subSubcategoryURL,
  } = parsePostToContent(post)

  const [fontSize, setFontSize] = useState<FontSizeLevel>(FontSizeLevel.NORMAL)
  const onFontSizeChange = () => {
    setFontSize(
      fontSize === FontSizeLevel.NORMAL
        ? FontSizeLevel.LARGE
        : FontSizeLevel.NORMAL
    )
  }

  const [isImgModalOpen, setIsImgModalOpen] = useState(false)
  const [imgProps, setImgProps] = useState<
    React.ImgHTMLAttributes<HTMLImageElement>
  >({})

  useBodyScrollLock({
    toLock: isImgModalOpen,
    lockID: 'article-image-modal',
  })

  const onImageModalOpen = (
    imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  ) => {
    setIsImgModalOpen(true)
    setImgProps(imgProps)
  }
  const onImageModalClose = () => {
    setIsImgModalOpen(false)
    setImgProps({})
  }

  const [isQAModalOpen, setIsQAModalOpen] = useState(false)

  const handleBaodaozaiConfirm = useCallback(
    ({ setHide, setAction }: Parameters<BaodaozaiActionSetter>[0]) => {
      setIsQAModalOpen(true)
      setHide(true)
      setAction('dialog-speaker')
    },
    []
  )

  const router = useRouter()

  const { member, tokens } = useHydratedAuthStore()

  const isLogin = !!member

  const handleQAModalClose = useCallback(
    ({ setHide, setAction }: QAModalEvent) => {
      setIsQAModalOpen(false)
      setHide(false)
      setAction('idle-enlighten')
    },
    []
  )

  const newsReadingGroupItems = useMemo(() => {
    if (!post?.newsReadingGroup?.items) return []
    return post?.newsReadingGroup.items.map((item) => ({
      name: item.name ?? '',
      embedCode: item.embedCode ?? '',
    }))
  }, [post?.newsReadingGroup?.items])

  const showBaodaozai =
    post?.showBaodaozai === true && (!isLogin || member?.showBaodaozai === true)

  const essayQuestionCount = isLogin
    ? (member?.essayQuestionCount ?? BAODAOZAI_DEFAULT_ESSAY_QUESTION_COUNT)
    : 0

  const postQuestions = useMemo<BaodaozaiQuestions | null>(() => {
    const essayQuestions = (post.postEssayQuestions ?? []).slice(
      0,
      essayQuestionCount
    )
    const choiceQuestions = post.postChoiceQuestions ?? []

    const finalChoiceQuestions = choiceQuestions.map<BaodaozaiChoiceQuestion>(
      (question) => ({
        id: question.id,
        title: question.title ?? '',
        options: question.options as BaodaozaiChoiceQuestion['options'],
        reason: question.reason ?? '',
        type: 'choice',
      })
    )

    const finalEssayQuestions = essayQuestions.map<BaodaozaiEssayQuestion>(
      (question) => ({
        id: question.id,
        title: question.title ?? '',
        hint: question.hint ?? '',
        type: 'essay',
      })
    )

    return [
      ...finalChoiceQuestions,
      ...finalEssayQuestions,
    ] as BaodaozaiQuestions
  }, [post.postChoiceQuestions, post.postEssayQuestions, essayQuestionCount])

  const { onBatchSubmitAnswers } = useBatchSubmitAnswers({
    memberId: member?.id ?? '',
    postSlug: slug,
    accessToken: tokens?.accessToken ?? '',
  })

  const handleQAModalSubmit = useCallback(
    async (answers: Record<number, string>, events: QAModalEvent) => {
      if (isLogin) {
        await onBatchSubmitAnswers(answers, postQuestions)
      }
      setIsQAModalOpen(false)
      events.setHide(false)
      events.onDialogPropsChange({
        isOpen: true,
        content: isLogin
          ? `想知道其他讀者的答案嗎？
大家送出的思辨題答案都會顯示在「小讀者觀點大集合」頁面喔～`
          : '登入帳號完成閱讀設定，還可以挑戰更多隱藏版的思辨題唷！',
        cancelText: '跳過',
        confirmText: isLogin ? '立即前往' : '立即登入',
        confirmAction: () => {
          if (isLogin) {
            window.open('/idea-hub', '_blank')
          } else {
            router.push(getLoginUrl())
          }
          events.setAction('default')
        },
        cancelAction: () => {
          events.setAction('default')
          events.setClickBaodaozaiAction('dialog-speaker')
        },
      })
    },
    [isLogin, onBatchSubmitAnswers, postQuestions, router]
  )

  const scrollingLevel = useScrollLevel({
    scrollDownDistance: 150,
    throttleThreshold: 50,
  })

  const isScrollingDown = scrollingLevel === ScrollLevel.DOWN_HIDDEN

  const tocIndexes = useMemo(
    () => parseTocIndexesFromEntityMap(post.content?.entityMap),
    [post.content?.entityMap]
  )

  const keywords = useMemo(() => {
    if (!post?.tagsOrdered) return []
    return post.tagsOrdered.filter(
      (tag): tag is Keyword => tag.name !== undefined
    )
  }, [post.tagsOrdered])

  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const trimmedBrief = useMemo(() => {
    return trimEmptyBlocks(post?.brief ?? { blocks: [], entityMap: {} })
  }, [post?.brief])

  return (
    <>
      <BaodaozaiVisibilitySetter show={showBaodaozai} />
      <HeaderPostTitleSetter postTitle={post?.title} />
      {tocIndexes.length > 0 && (
        <TableOfContentSideMenu
          indexes={tocIndexes}
          manuallyAssignAnchors={isMounted}
        />
      )}
      <div className="relative w-screen">
        <ArticleContext.Provider
          value={{
            fontSize,
            onFontSizeChange,
            onImageModalOpen,
            onImageModalClose,
          }}
        >
          <Toolbar topicURL={topicURL} postSlug={slug} />
          <div className="relative flex w-full max-w-256 flex-col items-center desktop:mx-auto desktop:px-12 hd:max-w-354.5">
            {isDesktop && (
              <ImageModal
                isOpen={isImgModalOpen}
                imgProps={imgProps}
                onImageModalClose={onImageModalClose}
              />
            )}

            <StartReadingBaodaozaiEventTrigger content={post?.opening ?? ''} />

            <TitleHero
              topicBreadcrumb={
                topicURL && mainTopic?.title
                  ? {
                      link: topicURL,
                      title: mainTopic.title,
                    }
                  : undefined
              }
              heroImageProps={{
                image: post?.heroImage,
                caption: post?.heroCaption ?? '',
                onImageModalOpen,
                fontSizeLevel: fontSize,
              }}
              title={post?.title ?? ''}
              subtitle={post?.subtitle}
              fontSizeLevel={fontSize}
            />
            {post?.newsReadingGroup && (
              <NewsReading items={newsReadingGroupItems} />
            )}

            <ArticleBaodaozaiEventTrigger
              id="hide-start-reading-scroll-up"
              startReadingContent={post?.opening ?? ''}
              disabled={isScrollingDown}
            />

            <div className="absolute top-[120vh]">
              <ArticleBaodaozaiEventTrigger
                id="hide-start-reading"
                startReadingContent={post?.opening ?? ''}
                disabled={!isScrollingDown}
              />
            </div>

            {trimmedBrief.blocks.length > 0 ? (
              <>
                <ArticleSummary
                  subSubcategoryName={subSubcategory?.name ?? ''}
                  subSubcategoryURL={subSubcategoryURL ?? ''}
                  publishedDate={post?.publishedDate ?? ''}
                  content={trimmedBrief}
                  authors={authorsInBrief}
                  fontSizeLevel={fontSize}
                />
                <div className="mb-10">
                  <SeparateIcon />
                </div>
              </>
            ) : (
              <div className="mb-10 tablet:mb-15"></div>
            )}

            <div className="relative w-full">
              <PostRenderer
                content={post?.content ?? { blocks: [], entityMap: {} }}
                shouldMount={isMounted}
              />
              <div className="absolute top-[calc(25%+50vh)]">
                <ArticleBaodaozaiEventTrigger
                  id="change-encourage-reading"
                  disabled={!isScrollingDown}
                />
                <ArticleBaodaozaiEventTrigger
                  id="change-start-reading"
                  disabled={isScrollingDown}
                  startReadingContent={post?.opening ?? ''}
                />
              </div>
              <div className="absolute top-[calc(75%+50vh)]">
                <ArticleBaodaozaiEventTrigger
                  id="change-ask-questions"
                  disabled={!isScrollingDown}
                  onAskQuestionsConfirm={handleBaodaozaiConfirm}
                />
                <ArticleBaodaozaiEventTrigger
                  id="change-encourage-reading"
                  disabled={isScrollingDown}
                />
              </div>
            </div>

            {keywords.length > 0 && <PopularKeywords keywords={keywords} />}
            <ArticleBaodaozaiEventTrigger
              id="show-ask-questions"
              disabled={!isScrollingDown}
              onAskQuestionsConfirm={handleBaodaozaiConfirm}
            />
            <ArticleBaodaozaiEventTrigger
              id="change-ask-questions"
              disabled={isScrollingDown}
              onAskQuestionsConfirm={handleBaodaozaiConfirm}
            />
          </div>
        </ArticleContext.Provider>
      </div>

      <Authors authors={orderedAuthors} />

      <div className="relative w-full">
        <RelatedArticles
          articles={relatedPosts ?? []}
          twReporterArticles={twReporterRelatedPosts ?? []}
        />
      </div>
      <SupportAction
        title="兒少好新聞，需要您的行動支持"
        content={<SupportActionContent />}
      />
      {postQuestions && (
        <BaodaozaiQAModal
          questions={postQuestions}
          onClose={handleQAModalClose}
          onSubmit={handleQAModalSubmit}
          isOpen={isQAModalOpen}
        />
      )}
    </>
  )
}

export default ArticleModule
