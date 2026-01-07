'use client'

import { GetPostQuery } from '__generated__/operations/content.generated'
import {
  HeaderPostTitleSetter,
  ScrollLevel,
  useScrollLevel,
} from '@kids-reporter/routing-ui'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import AuthorCard from '@/components/author-card'
import Tags from '@/components/tags'
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

import CallToAction from './call-to-action'
import ArticleBaodaozaiEventTrigger from './components/article-baodaozai-event-trigger'
import ArticleSummary from './components/article-summary'
import NewsReading from './components/news-reading'
import RelatedArticles from './components/related-articles'
import StartReadingBaodaozaiEventTrigger from './components/start-reading-baodaozai-event-trigger'
import TableOfContentSideMenu from './components/table-of-content-side-menu'
import TitleHero from './components/title-hero'
import Toolbar from './components/toolbar'
import { ArticleContext } from './context'
import useBatchSubmitAnswers from './hooks/use-batch-submit-answers'
import ImageModal from './image-modal'
import PostRenderer from './post-renderer'
import parsePostToContent from './utils/parse-post-to-content'
import parseTocIndexesFromEntityMap from './utils/parse-toc-indexes-from-entity-map'

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
  const onImageModalOpen = (
    imgProps: React.ImgHTMLAttributes<HTMLImageElement>
  ) => {
    setIsImgModalOpen(true)
    setImgProps(imgProps)
    document.body.classList.add('no-scroll')
  }
  const onImageModalClose = () => {
    setIsImgModalOpen(false)
    setImgProps({})
    document.body.classList.remove('no-scroll')
  }

  const [isQAModalOpen, setIsQAModalOpen] = useState(false)

  const handleBaodaozaiConfirm = useCallback(
    ({
      setHide,
      setIsActive,
      setAction,
    }: Parameters<BaodaozaiActionSetter>[0]) => {
      setIsQAModalOpen(true)
      setHide(true)
      setIsActive(false)
      setAction('none')
    },
    []
  )

  const router = useRouter()

  const { member, tokens } = useHydratedAuthStore()

  const isLogin = !!member

  const handleQAModalClose = useCallback(({ setHide }: QAModalEvent) => {
    setIsQAModalOpen(false)
    setHide(false)
  }, [])

  const newsReadingGroupItems = useMemo(() => {
    if (!post?.newsReadingGroup?.items) return []
    return post?.newsReadingGroup.items.map((item) => ({
      name: item.name ?? '',
      embedCode: item.embedCode ?? '',
    }))
  }, [post?.newsReadingGroup?.items])

  const tags = useMemo(() => {
    if (!post?.tagsOrdered) return []
    return post.tagsOrdered.map((tag) => ({
      name: tag.name ?? '',
      slug: tag.slug ?? '',
    }))
  }, [post.tagsOrdered])

  const showBaodaozai = (() => {
    if (post?.showBaodaozai === true && !isLogin) {
      return true
    }
    if (
      post?.showBaodaozai === true &&
      isLogin &&
      member?.showBaodaozai === true
    ) {
      return true
    }
    return false
  })()

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
      events.setIsActive(true)
      events.setAction('speak')
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

  return (
    <>
      <BaodaozaiVisibilitySetter show={showBaodaozai} />
      <HeaderPostTitleSetter postTitle={post?.title} />
      {tocIndexes.length > 0 && <TableOfContentSideMenu indexes={tocIndexes} />}
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
          <div className="flex w-full max-w-300 flex-col items-center desktop:mx-auto desktop:px-12">
            <ImageModal
              isOpen={isImgModalOpen}
              imgProps={imgProps}
              onImageModalClose={onImageModalClose}
            />

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
              id="hide-start-reading"
              disabled={!isScrollingDown}
              startReadingContent={post?.opening ?? ''}
            />
            <ArticleSummary
              subSubcategoryName={subSubcategory?.name ?? ''}
              subSubcategoryURL={subSubcategoryURL ?? ''}
              publishedDate={post?.publishedDate ?? ''}
              content={post?.brief}
              authors={authorsInBrief}
              fontSizeLevel={fontSize}
            />
            <SeparateIcon />
            <div className="relative w-full">
              <PostRenderer content={post?.content ?? {}} />
              {/* middle of the article content enters 50% of the viewport*/}
              <div className="absolute top-[calc(50%+50vh)]">
                <ArticleBaodaozaiEventTrigger
                  id="change-ask-questions"
                  disabled={!isScrollingDown}
                  onAskQuestionsConfirm={handleBaodaozaiConfirm}
                />
                <ArticleBaodaozaiEventTrigger
                  id="change-start-reading"
                  disabled={isScrollingDown}
                  startReadingContent={post?.opening ?? ''}
                />
              </div>
            </div>

            {post?.tagsOrdered && <Tags title="常用關鍵字" tags={tags} />}
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

      <AuthorCard title="誰幫我們完成這篇文章" authors={orderedAuthors} />

      <div className="relative w-full">
        {/* related posts enters 50% of the viewport*/}
        <div className="absolute top-[calc(50%+50vh)]">
          <ArticleBaodaozaiEventTrigger
            id="show-related-articles"
            disabled={!isScrollingDown}
          />
        </div>
        <RelatedArticles
          articles={relatedPosts ?? []}
          twReporterArticles={twReporterRelatedPosts ?? []}
        />
      </div>

      <CallToAction />
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
