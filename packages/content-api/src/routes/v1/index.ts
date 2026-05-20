import {
  V1AllPostEssayAnswersQuerySchema,
  V1AuthorAvatarPathParamsSchema,
  V1CallBaodaozaiIntroPathParamsSchema,
  V1CategoryBySlugMetadataQuerySchema,
  V1CategoryPostsQuerySchema,
  V1EditorPicksSettingsQuerySchema,
  V1FeedSlugPathParamsSchema,
  V1PostBySlugPathParamsSchema,
  V1PostBySlugQuerySchema,
  V1PostEssayQuestionAnswersParamsSchema,
  V1PostEssayQuestionAnswersQuerySchema,
  V1PostsEssayAnswersWithLikesQuerySchema,
  V1PostsQuerySchema,
  V1ProjectsQuerySchema,
  V1SitemapsQuerySchema,
  V1SubSubcategoryBySlugPostsQuerySchema,
} from '@kids-reporter/api-types'
import express from 'express'

import {
  fetchAuthorAvatar,
  fetchAuthorFeedPosts,
  fetchAuthorMeta,
  fetchAuthorPostsCount,
} from '../../queries/authors.js'
import {
  fetchEditorPicksSettings,
  fetchPopularKeywords,
} from '../../queries/editor-picks.js'
import { fetchCallBaodaozaiIntro } from '../../queries/intros.js'
import {
  fetchPostDetailBySlug,
  fetchPostEssayQuestionsBySlug,
  fetchPostMetaBySlug,
  fetchPostsEssayAnswersWithLikes,
  fetchPublishedProjectDetailBySlug,
  fetchPublishedProjectMetaBySlug,
} from '../../queries/post-detail.js'
import {
  fetchPostEssayAnswersList,
  fetchPostEssayQuestionWithAnswers,
} from '../../queries/post-essay-qna.js'
import { fetchPostsList } from '../../queries/posts.js'
import {
  fetchPublishedProjectRelatedPostsCount,
  fetchPublishedProjects,
} from '../../queries/projects.js'
import {
  fetchPostsForSitemap,
  fetchProjectsForSitemap,
} from '../../queries/sitemaps.js'
import { fetchTagFeedPosts, fetchTagMeta } from '../../queries/tags.js'
import {
  fetchCategoryFeedPosts,
  fetchCategoryMetadata,
  fetchCategorySubcategoriesTheme,
  fetchSubcategoriesList,
  fetchSubcategoryFeedPosts,
  fetchSubSubcategoryFeedPosts,
} from '../../queries/taxonomy.js'
import { asyncRoute } from '../../utils/async-route.js'
import { sendJsonError } from '../../utils/send-json-error.js'
import { createV1MembersRouter } from './v1-members.js'
import { createV1QnaMembersRouter } from './v1-qna-members.js'

/** Matches idea-hub `GetPostsEssayAnswersWithLikes` filter (inlined; no client `where` blob). */
const POSTS_ESSAY_ANSWERS_WITH_LIKES_WHERE = {
  postEssayQuestions: {
    some: {
      answers: {
        some: {},
      },
    },
  },
} as const

function firstQueryString(v: unknown): string | undefined {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return undefined
}

const sendNotFound = (res: express.Response) =>
  sendJsonError(res, 404, 'not_found', 'Not found')

export function createV1Router() {
  const router = express.Router()

  router.use('/members', createV1MembersRouter())
  router.use('/members', createV1QnaMembersRouter())

  router.get(
    '/posts',
    asyncRoute(async (req, res) => {
      const q = V1PostsQuerySchema.parse(req.query)
      const result = await fetchPostsList(
        { take: q.take ?? 12, skip: q.skip ?? 0 },
        new Date()
      )
      res.json(result)
    })
  )

  router.get(
    '/posts/essay-answers-with-likes',
    asyncRoute(async (req, res) => {
      const q = V1PostsEssayAnswersWithLikesQuerySchema.parse(req.query)
      const posts = await fetchPostsEssayAnswersWithLikes(
        {
          take: q.take,
          skip: q.skip,
          orderBy: [{ publishedDate: 'desc' }],
          answerTake: q.answerTake,
          answerOrderBy: q.answerOrderBy,
          where: POSTS_ESSAY_ANSWERS_WITH_LIKES_WHERE,
        },
        new Date()
      )
      res.json(posts)
    })
  )

  router.get(
    '/posts/by-slug/:slug',
    asyncRoute(async (req, res) => {
      const { slug } = V1PostBySlugPathParamsSchema.parse(req.params)
      const q = V1PostBySlugQuerySchema.parse(req.query)
      const post = await fetchPostDetailBySlug(slug, new Date(), {
        take: q.take,
        postEssayQuestionsTake: q.postEssayQuestionsTake,
        postChoiceQuestionsTake: q.postChoiceQuestionsTake,
      })
      if (!post) return sendNotFound(res)
      res.json(post)
    })
  )

  router.get(
    '/posts/by-slug/:slug/meta',
    asyncRoute(async (req, res) => {
      const { slug } = V1PostBySlugPathParamsSchema.parse(req.params)
      const post = await fetchPostMetaBySlug(slug, new Date())
      if (!post) return sendNotFound(res)
      res.json(post)
    })
  )

  router.get(
    '/posts/by-slug/:slug/essay-questions',
    asyncRoute(async (req, res) => {
      const { slug } = V1PostBySlugPathParamsSchema.parse(req.params)
      const post = await fetchPostEssayQuestionsBySlug(slug, new Date())
      if (!post) return sendNotFound(res)
      res.json(post)
    })
  )

  router.get(
    '/sitemaps/posts',
    asyncRoute(async (req, res) => {
      const q = V1SitemapsQuerySchema.parse(req.query)
      const posts = await fetchPostsForSitemap(q.sinceDays, new Date())
      res.json(posts)
    })
  )

  router.get(
    '/sitemaps/projects',
    asyncRoute(async (req, res) => {
      const q = V1SitemapsQuerySchema.parse(req.query)
      const projects = await fetchProjectsForSitemap(q.sinceDays, new Date())
      res.json(projects)
    })
  )

  router.get(
    '/projects/by-slug/:slug',
    asyncRoute(async (req, res) => {
      const { slug } = V1PostBySlugPathParamsSchema.parse(req.params)
      const project = await fetchPublishedProjectDetailBySlug(slug, new Date())
      if (!project) return sendNotFound(res)
      res.json(project)
    })
  )

  router.get(
    '/projects/by-slug/:slug/meta',
    asyncRoute(async (req, res) => {
      const { slug } = V1PostBySlugPathParamsSchema.parse(req.params)
      const meta = await fetchPublishedProjectMetaBySlug(slug)
      if (!meta) return sendNotFound(res)
      res.json(meta)
    })
  )

  router.get(
    '/projects/by-slug/:slug/related-posts-count',
    asyncRoute(async (req, res) => {
      const { slug } = V1PostBySlugPathParamsSchema.parse(req.params)
      const result = await fetchPublishedProjectRelatedPostsCount(
        slug,
        new Date()
      )
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/editor-picks-settings',
    asyncRoute(async (req, res) => {
      const q = V1EditorPicksSettingsQuerySchema.parse(req.query)
      const settings = await fetchEditorPicksSettings(q.take, new Date())
      res.json(settings)
    })
  )

  router.get(
    '/popular-keywords',
    asyncRoute(async (_req, res) => {
      const popularKeywords = await fetchPopularKeywords()
      res.json(popularKeywords)
    })
  )

  router.get(
    '/projects',
    asyncRoute(async (req, res) => {
      const q = V1ProjectsQuerySchema.parse(req.query)
      const result = await fetchPublishedProjects(
        {
          take: q.take ?? 12,
          skip: q.skip ?? 0,
          includeRelatedPosts: q.includeRelatedPosts ?? false,
        },
        new Date()
      )
      res.json(result)
    })
  )

  router.get(
    '/call-baodaozai-intros/:page',
    asyncRoute(async (req, res) => {
      const { page } = V1CallBaodaozaiIntroPathParamsSchema.parse(req.params)
      const intro = await fetchCallBaodaozaiIntro(page)
      if (!intro) return sendNotFound(res)
      res.json(intro)
    })
  )

  router.get(
    '/subcategories',
    asyncRoute(async (_req, res) => {
      const subcategories = await fetchSubcategoriesList()
      res.json(subcategories)
    })
  )

  router.get(
    '/categories/by-slug/:slug/posts',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const q = V1CategoryPostsQuerySchema.parse(req.query)
      const result = await fetchCategoryFeedPosts(slug, {
        take: q.take ?? 12,
        skip: q.skip ?? 0,
      })
      res.json(result)
    })
  )

  router.get(
    '/categories/by-slug/:slug/metadata',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const { subcategorySlug } = V1CategoryBySlugMetadataQuerySchema.parse({
        ...req.query,
        subcategorySlug: firstQueryString(req.query.subcategorySlug),
      })
      const result = await fetchCategoryMetadata(slug, subcategorySlug)
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/categories/by-slug/:slug/subcategories-theme',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const result = await fetchCategorySubcategoriesTheme(slug)
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/subcategories/by-slug/:slug/posts',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const q = V1CategoryPostsQuerySchema.parse(req.query)
      const result = await fetchSubcategoryFeedPosts(slug, {
        take: q.take ?? 12,
        skip: q.skip ?? 0,
      })
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/sub-subcategories/by-slug/:slug/posts',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const q = V1SubSubcategoryBySlugPostsQuerySchema.parse(req.query)
      const result = await fetchSubSubcategoryFeedPosts(
        slug,
        { take: q.take ?? 12, skip: q.skip ?? 0 },
        new Date()
      )
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/tags/by-slug/:slug/meta',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const result = await fetchTagMeta(slug)
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/tags/by-slug/:slug/posts',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const q = V1SubSubcategoryBySlugPostsQuerySchema.parse(req.query)
      const result = await fetchTagFeedPosts(
        slug,
        { take: q.take ?? 12, skip: q.skip ?? 0 },
        new Date()
      )
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/authors/by-slug/:slug/meta',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const result = await fetchAuthorMeta(slug)
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/authors/by-slug/:slug/posts',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const q = V1SubSubcategoryBySlugPostsQuerySchema.parse(req.query)
      const result = await fetchAuthorFeedPosts(
        slug,
        { take: q.take ?? 12, skip: q.skip ?? 0 },
        new Date()
      )
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/authors/by-slug/:slug/posts-count',
    asyncRoute(async (req, res) => {
      const { slug } = V1FeedSlugPathParamsSchema.parse(req.params)
      const result = await fetchAuthorPostsCount(slug, new Date())
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/post-essay-answers',
    asyncRoute(async (req, res) => {
      const q = V1AllPostEssayAnswersQuerySchema.parse(req.query)
      const rows = await fetchPostEssayAnswersList({
        take: q.take ?? 10,
        orderBy: q.orderBy,
      })
      res.set('Cache-Control', 'public, max-age=60')
      res.json(rows)
    })
  )

  router.get(
    '/post-essay-questions/:questionId',
    asyncRoute(async (req, res) => {
      const { questionId } = V1PostEssayQuestionAnswersParamsSchema.parse(
        req.params
      )
      const q = V1PostEssayQuestionAnswersQuerySchema.parse(req.query)
      const result = await fetchPostEssayQuestionWithAnswers(questionId, {
        answerTake: q.answerTake,
        answerSkip: q.answerSkip ?? 0,
        answerOrderBy: q.answerOrderBy,
      })
      if (!result) return sendNotFound(res)
      res.json(result)
    })
  )

  router.get(
    '/authors/by-slug/:slug/avatar',
    asyncRoute(async (req, res) => {
      const { slug } = V1AuthorAvatarPathParamsSchema.parse(req.params)
      const result = await fetchAuthorAvatar(slug)
      res.json(result)
    })
  )

  return router
}
