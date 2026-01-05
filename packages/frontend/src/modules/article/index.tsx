'use client'
import './article.css'

import { GetPostQuery } from '__generated__/operations/content.generated'
import { cn, ScrollLevel, useScrollLevel } from '@kids-reporter/routing-ui'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'

import AuthorCard, { Author } from '@/components/author-card'
import DividerLegacy from '@/components/divider-legacy'
import Tags from '@/components/tags'
import { PostSummary } from '@/components/types'
import {
  AUTHOR_ROLES_IN_ORDER,
  AuthorRole,
  DEFAULT_AVATAR,
  DEFAULT_THEME_COLOR,
  FontSizeLevel,
  Theme,
} from '@/constants'
import { BAODAOZAI_DEFAULT_ESSAY_QUESTION_COUNT } from '@/constants/baodaozai-question-count'
import Toolbar from '@/modules/article/components/toolbar'
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
import { getPostSummaries } from '@/utils'
import getLoginUrl from '@/utils/get-login-url'

import Brief, { AuthorGroup } from './brief'
import CallToAction from './call-to-action'
import ArticleBaodaozaiEventTrigger from './components/article-baodaozai-event-trigger'
import RelatedArticles from './components/related-articles'
import StartReadingBaodaozaiEventTrigger from './components/start-reading-baodaozai-event-trigger'
import { ArticleContext } from './context'
import HeroImage from './hero-image'
import useBatchSubmitAnswers from './hooks/use-batch-submit-answers'
import ImageModal from './image-modal'
import { NewsReading } from './news-reading'
import PostRenderer from './post-renderer'
import PublishedDate from './published-date'
import SubSubcategory from './subSubcategory'
import Title from './title'

const getPostContents = (post: NonNullable<GetPostQuery['post']>) => {
  // Assemble authors for brief
  const authorsJSON = post?.authorsJSON as {
    id: string
    name: string
    role: string
    type: 'link' | 'string'
  }[]
  const authorsInBrief: AuthorGroup[] = []
  let currentAuthorRole = '',
    currentAuthors: { name: string; link: string }[] = []

  authorsJSON?.forEach((authorJSON, index) => {
    const author = post?.authors?.find((a) => a?.id === authorJSON?.id)
    const authName = author ? (author.name ?? '') : authorJSON.name
    const authorObj = author
      ? {
          name: authName,
          link: `/author/${author.slug}`,
        }
      : {
          name: authName,
          link: '',
        }
    if (index === 0 || authorJSON.role === authorsJSON[index - 1]?.role) {
      currentAuthorRole = authorJSON.role
      currentAuthors.push(authorObj)
    } else {
      authorsInBrief.push({ title: currentAuthorRole, authors: currentAuthors })
      currentAuthorRole = authorJSON.role
      currentAuthors = [authorObj]
    }

    if (index === authorsJSON?.length - 1) {
      authorsInBrief.push({ title: currentAuthorRole, authors: currentAuthors })
    }
  })

  // Assemble ordered authors for AuthorCard
  type AuthorWithLink = Author & { link: string }
  const authors: AuthorWithLink[] =
    post?.authors
      ?.map((author) => {
        const authorJSON = authorsJSON.find(
          (authorJSON) => authorJSON.id === author?.id
        )
        if (!authorJSON) {
          return undefined
        }
        const avatarURL = author?.avatar?.resized?.tiny
        return {
          slug: author.slug,
          name: author.name ?? '',
          avatar: avatarURL ?? DEFAULT_AVATAR,
          bio: author.bio ?? '',
          role: authorJSON.role as AuthorRole,
          link: authorJSON.type === 'link' ? `/author/${author.slug}` : '',
        }
      })
      .filter((author) => author !== undefined) ?? []

  // Sort authors by AUTHOR_ROLES_IN_ORDER
  const orderedAuthors = authors
    ?.filter((author: AuthorWithLink) => author?.link)
    ?.map((author: AuthorWithLink) => {
      const roles = author?.role?.split('、')
      const priority = AUTHOR_ROLES_IN_ORDER.indexOf(roles?.[0] as AuthorRole)
      return {
        ...author,
        priority: priority === -1 ? AUTHOR_ROLES_IN_ORDER.length : priority,
      }
    })
    ?.sort((a, b) => {
      return a.priority - b.priority
    })

  // Topic related data
  const topic = post?.projects?.[0]

  // Related posts data: related posts or topic's related post
  let relatedPosts: ReturnType<typeof getPostSummaries> = []
  if (
    post?.relatedPostsOrdered?.length &&
    post?.relatedPostsOrdered?.length > 0
  ) {
    relatedPosts = getPostSummaries(post.relatedPostsOrdered ?? [])
  } else if (topic?.relatedPosts?.length && topic?.relatedPosts?.length > 0) {
    relatedPosts = getPostSummaries(topic?.relatedPosts ?? [])
  }

  // Main project data
  // TODO: project/main project are duplicate data, should be refactored
  const mainTopic = post?.mainProject
  const topicURL = mainTopic?.slug ? `/topic/${mainTopic.slug}` : undefined

  // Subcategory related data
  const subSubcategory = post?.subSubcategoriesOrdered?.[0]
  const subcategory = subSubcategory?.subcategory
  const category = subcategory?.category
  const subSubcategoryURL =
    category?.slug && subcategory?.slug && subSubcategory?.slug
      ? `/category/${category.slug}/${subcategory.slug}/${subSubcategory.slug}`
      : ''
  const theme = (category?.themeColor || DEFAULT_THEME_COLOR) as Theme

  const twReporterRelatedPosts: PostSummary[] =
    post?.TWReporterRelatedPostsJSON?.map(
      (twReporterPost: {
        ogTitle: string
        src: string
        ogImgSrc: string
        ogDescription: string
        publishedDate: string
      }) => ({
        title: twReporterPost.ogTitle,
        url: twReporterPost.src,
        image: twReporterPost.ogImgSrc,
        desc: twReporterPost.ogDescription,
        category: '',
        subSubcategory: '',
        publishedDate: twReporterPost.publishedDate,
        theme: DEFAULT_THEME_COLOR,
      })
    ) ?? []

  return {
    theme,
    topicURL,
    mainTopic,
    subSubcategory,
    subSubcategoryURL,
    authorsInBrief,
    orderedAuthors,
    relatedPosts,
    twReporterRelatedPosts,
  }
}

const Article = ({
  post,
  slug,
}: {
  post: NonNullable<GetPostQuery['post']>
  slug: string
}) => {
  const {
    theme,
    topicURL,
    mainTopic,
    subSubcategory,
    subSubcategoryURL,
    authorsInBrief,
    orderedAuthors,
    relatedPosts,
    twReporterRelatedPosts,
  } = getPostContents(post)

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

  const topicBreadCrumb = topicURL && (
    <div className="topic-breadcrumb">
      <Link className="text-sm md:text-base lg:text-lg" href={topicURL}>
        <img src="/assets/images/topic-breadcrumb-icon.svg" loading="lazy" />
        {mainTopic?.title}
      </Link>
    </div>
  )

  const postHeader = post && (
    <div className="hero-section">
      <header className="entry-header">
        <Title
          text={post.title ?? ''}
          subtitle={post.subtitle ?? ''}
          fontSize={fontSize}
        />
        <div className="post-date-category">
          <PublishedDate date={post.publishedDate ?? ''} />
          <SubSubcategory
            text={subSubcategory?.name ?? ''}
            link={subSubcategoryURL}
          />
        </div>
      </header>
    </div>
  )

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

  return (
    <>
      <BaodaozaiVisibilitySetter show={showBaodaozai} />
      <div className={cn('post relative', theme ? ` theme-${theme}` : '')}>
        <ArticleContext.Provider
          value={{
            fontSize,
            onFontSizeChange,
            onImageModalOpen,
            onImageModalClose,
          }}
        >
          <Toolbar topicURL={topicURL ?? '#'} postSlug={slug} />
          {topicBreadCrumb}
          <ImageModal
            isOpen={isImgModalOpen}
            imgProps={imgProps}
            onImageModalClose={onImageModalClose}
          />
          <StartReadingBaodaozaiEventTrigger content={post?.opening ?? ''} />
          {post?.heroImage && post?.heroCaption && (
            <HeroImage
              image={post?.heroImage}
              caption={post?.heroCaption ?? ''}
              onImageModalOpen={onImageModalOpen}
            />
          )}
          {postHeader}
          {post?.newsReadingGroup && (
            <NewsReading items={newsReadingGroupItems} />
          )}

          <ArticleBaodaozaiEventTrigger
            id="hide-start-reading"
            disabled={!isScrollingDown}
            startReadingContent={post?.opening ?? ''}
          />
          <Brief content={post?.brief} authors={authorsInBrief} theme={theme} />
          <DividerLegacy />
          <div className="relative">
            <PostRenderer post={post} theme={theme} />
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

export default Article
