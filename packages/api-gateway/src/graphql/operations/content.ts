import {
  GET_AUTHOR_AVATAR_QUERY,
  GET_AUTHOR_META_QUERY,
  GET_AUTHOR_POSTS_COUNT_QUERY,
  GET_AUTHOR_POSTS_QUERY,
  GET_CALL_BAODAOZAI_INTRO_QUERY,
  GET_CATEGORY_METADATA_QUERY,
  GET_CATEGORY_POSTS_QUERY,
  GET_CATEGORY_SUBCATEGORIES_AND_THEME_COLOR_QUERY,
  GET_EDITOR_PICKS_SETTINGS_QUERY,
  GET_LATEST_POSTS_QUERY,
  GET_POPULAR_KEYWORDS_QUERY,
  GET_POST_ESSAY_QUESTIONS_QUERY,
  GET_POST_META_QUERY,
  GET_POST_QUERY,
  GET_POSTS_COUNT_QUERY,
  GET_POSTS_ESSAY_ANSWERS_WITH_LIKES_QUERY,
  GET_POSTS_FOR_SITEMAP_QUERY,
  GET_POSTS_QUERY,
  GET_PROJECT_META_QUERY,
  GET_PROJECT_QUERY,
  GET_PROJECT_RELATED_POSTS_COUNT_QUERY,
  GET_PROJECTS_FOR_SITEMAP_QUERY,
  GET_PROJECTS_QUERY,
  GET_SUB_SUBCATEGORY_POSTS_QUERY,
  GET_SUBCATEGORIES_QUERY,
  GET_SUBCATEGORY_POSTS_QUERY,
  GET_TAG_META_QUERY,
  GET_TAG_POSTS_QUERY,
  GET_TOPIC_PROJECTS_QUERY,
} from '../documents/content.js'
import {
  ensureArray,
  ensureRecord,
  normalizeBoolean,
  normalizeOrderBy,
  Operation,
  toInt,
} from './shared.js'

export const operations: Record<string, Operation> = {
  'latest-posts': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetLatestPosts',
    document: GET_LATEST_POSTS_QUERY,
    buildVariables: (input) => {
      const take = toInt(input.take)
      const orderBy = normalizeOrderBy(input.orderBy, [
        { publishedDate: 'desc' },
      ])
      return { orderBy, take }
    },
  },
  'editor-picks-settings': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetEditorPicksSettings',
    document: GET_EDITOR_PICKS_SETTINGS_QUERY,
    buildVariables: (input) => {
      return { take: toInt(input.take) }
    },
  },
  'popular-keywords': {
    method: 'GET',
    cacheTtl: 300,
    auth: 'public',
    operationName: 'GetPopularKeywords',
    document: GET_POPULAR_KEYWORDS_QUERY,
    buildVariables: () => {
      return {}
    },
  },
  'call-baodaozai-intro': {
    method: 'GET',
    cacheTtl: 300,
    auth: 'public',
    operationName: 'GetCallBaodaozaiIntro',
    document: GET_CALL_BAODAOZAI_INTRO_QUERY,
    buildVariables: (input) => {
      const where = ensureRecord(input.where, 'Missing where')
      const page = where.page
      if (typeof page !== 'string') {
        throw new Error('Missing where.page')
      }
      return { where: { page } }
    },
  },
  'category-posts': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetCategoryPosts',
    document: GET_CATEGORY_POSTS_QUERY,
    buildVariables: (input) => {
      return {
        where: ensureRecord(input.where, 'Missing where'),
        take: toInt(input.take),
        skip: toInt(input.skip),
      }
    },
  },
  'category-metadata': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetCategoryMetadata',
    document: GET_CATEGORY_METADATA_QUERY,
    buildVariables: (input) => {
      return {
        categoryWhere: ensureRecord(
          input.categoryWhere,
          'Missing categoryWhere'
        ),
        subcategoryWhere: ensureRecord(
          input.subcategoryWhere,
          'Missing subcategoryWhere'
        ),
      }
    },
  },
  'category-subcategories-and-theme-color': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetCategorySubcategoriesAndThemeColor',
    document: GET_CATEGORY_SUBCATEGORIES_AND_THEME_COLOR_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'subcategory-posts': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetSubcategoryPosts',
    document: GET_SUBCATEGORY_POSTS_QUERY,
    buildVariables: (input) => {
      return {
        where: ensureRecord(input.where, 'Missing where'),
        take: toInt(input.take),
        skip: toInt(input.skip),
      }
    },
  },
  'sub-subcategory-posts': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetSubSubcategoryPosts',
    document: GET_SUB_SUBCATEGORY_POSTS_QUERY,
    buildVariables: (input) => {
      return {
        where: ensureRecord(input.where, 'Missing where'),
        take: toInt(input.take),
        skip: toInt(input.skip),
        orderBy: ensureArray(input.orderBy, 'Missing orderBy'),
      }
    },
  },
  'topic-projects': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetTopicProjects',
    document: GET_TOPIC_PROJECTS_QUERY,
    buildVariables: (input) => {
      return {
        orderBy: ensureArray(input.orderBy, 'Missing orderBy'),
        take: toInt(input.take),
      }
    },
  },
  'post-detail': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetPost',
    document: GET_POST_QUERY,
    buildVariables: (input) => {
      return {
        where: ensureRecord(input.where, 'Missing where'),
        orderBy: ensureArray(input.orderBy, 'Missing orderBy'),
        take: toInt(input.take),
        relatedPostsWhere: ensureRecord(
          input.relatedPostsWhere,
          'Missing relatedPostsWhere'
        ),
        postEssayQuestionsTake: toInt(input.postEssayQuestionsTake),
        postChoiceQuestionsTake: toInt(input.postChoiceQuestionsTake),
      }
    },
  },
  'post-meta': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetPostMeta',
    document: GET_POST_META_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'posts-count': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'PostsCount',
    document: GET_POSTS_COUNT_QUERY,
    buildVariables: () => ({}),
  },
  'posts-paged': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetPosts',
    document: GET_POSTS_QUERY,
    buildVariables: (input) => {
      return {
        orderBy: normalizeOrderBy(input.orderBy, [{ publishedDate: 'desc' }]),
        take: toInt(input.take),
        skip: toInt(input.skip),
      }
    },
  },
  'posts-essay-answers-with-likes': {
    method: 'GET',
    auth: 'public',
    operationName: 'GetPostsEssayAnswersWithLikes',
    document: GET_POSTS_ESSAY_ANSWERS_WITH_LIKES_QUERY,
    buildVariables: (input) => {
      return {
        orderBy: normalizeOrderBy(input.orderBy, [{ publishedDate: 'desc' }]),
        take: toInt(input.take),
        skip: toInt(input.skip),
        answerOrderBy: normalizeOrderBy(input.answerOrderBy, [
          { createdAt: 'desc' },
        ]),
        answerTake: toInt(input.answerTake),
        where: ensureRecord(input.where, 'Missing where'),
      }
    },
  },
  'post-essay-questions': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetPostEssayQuestions',
    document: GET_POST_ESSAY_QUESTIONS_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'tag-posts': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetTagPosts',
    document: GET_TAG_POSTS_QUERY,
    buildVariables: (input) => {
      return {
        where: ensureRecord(input.where, 'Missing where'),
        orderBy: normalizeOrderBy(input.orderBy, [{ publishedDate: 'desc' }]),
        take: toInt(input.take),
        skip: toInt(input.skip),
      }
    },
  },
  'tag-meta': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetTagMeta',
    document: GET_TAG_META_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'project-detail': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetProject',
    document: GET_PROJECT_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'project-meta': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetProjectMeta',
    document: GET_PROJECT_META_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'projects-paged': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetProjects',
    document: GET_PROJECTS_QUERY,
    buildVariables: (input) => {
      return {
        orderBy: normalizeOrderBy(input.orderBy, [{ publishedDate: 'desc' }]),
        take: toInt(input.take),
        skip: toInt(input.skip),
        includeRelatedPosts: normalizeBoolean(input.includeRelatedPosts),
      }
    },
  },
  'project-related-posts-count': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetProjectRelatedPostsCount',
    document: GET_PROJECT_RELATED_POSTS_COUNT_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'author-posts': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetAuthorPosts',
    document: GET_AUTHOR_POSTS_QUERY,
    buildVariables: (input) => {
      return {
        where: ensureRecord(input.where, 'Missing where'),
        orderBy: normalizeOrderBy(input.orderBy, [{ publishedDate: 'desc' }]),
        take: toInt(input.take),
        skip: toInt(input.skip),
      }
    },
  },
  'author-meta': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetAuthorMeta',
    document: GET_AUTHOR_META_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'author-avatar': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetAuthorAvatar',
    document: GET_AUTHOR_AVATAR_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'author-posts-count': {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetAuthorPostsCount',
    document: GET_AUTHOR_POSTS_COUNT_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'posts-sitemap': {
    method: 'GET',
    cacheTtl: 300,
    auth: 'public',
    operationName: 'GetPostsForSitemap',
    document: GET_POSTS_FOR_SITEMAP_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  'projects-sitemap': {
    method: 'GET',
    cacheTtl: 300,
    auth: 'public',
    operationName: 'GetProjectsForSitemap',
    document: GET_PROJECTS_FOR_SITEMAP_QUERY,
    buildVariables: (input) => {
      return { where: ensureRecord(input.where, 'Missing where') }
    },
  },
  subcategories: {
    method: 'GET',
    cacheTtl: 120,
    auth: 'public',
    operationName: 'GetSubcategories',
    document: GET_SUBCATEGORIES_QUERY,
    buildVariables: () => ({}),
  },
}
