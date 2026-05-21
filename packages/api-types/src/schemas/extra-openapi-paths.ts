import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { RestErrorBodySchema } from '../rest.js'
import {
  registry,
  V1AccessTokenResponseSchema,
  V1AuthorPostsCountResponseSchema,
  V1MemberPostsWithAnswersQuerySchema,
} from './content.js'
import {
  V1AuthorBySlugPostsQuerySchema,
  V1CategoryBySlugMetadataQuerySchema,
  V1CategoryPostsQuerySchema,
  V1FeedSlugPathParamsSchema,
  V1SubSubcategoryBySlugPostsQuerySchema,
  V1TagBySlugPostsQuerySchema,
} from './content-feed-queries.js'
import {
  V1AuthorBySlugMetaResponseSchema,
  V1AuthorBySlugPostsResponseSchema,
  V1CategoryBySlugCategoryPostsResponseSchema,
  V1CategoryBySlugMetadataResponseSchema,
  V1CategoryBySlugSubcategoriesThemeResponseSchema,
  V1SubcategoryBySlugPostsResponseSchema,
  V1SubSubcategoryBySlugPostsResponseSchema,
  V1TagBySlugMetaResponseSchema,
  V1TagBySlugPostsResponseSchema,
} from './content-feed-responses.js'
import {
  V1EssayAnswersHasLikedQuerySchema,
  V1EssayAnswersHasLikedResponseSchema,
} from './member-essay-answers-has-liked.js'

extendZodWithOpenApi(z)

const HealthOkWithTimestampSchema = z.object({ timestamp: z.string() })

const MemberPostEssayAnswerInListSchema = z
  .strictObject({
    id: z.string(),
    content: z.string(),
    likesCount: z.number().int(),
    createdAt: z.string(),
    updatedAt: z.string(),
    question: z.strictObject({
      id: z.string(),
      title: z.string(),
      hint: z.string(),
      post: z.strictObject({ id: z.string() }),
    }),
  })
  .openapi('MemberPostEssayAnswerInList')

const MemberPostChoiceOptionSchema = z.strictObject({
  content: z.string(),
  isCorrectAnswer: z.boolean(),
})

const MemberPostChoiceAnswerInListSchema = z
  .strictObject({
    id: z.string(),
    choiceIndex: z.number().int(),
    correct: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
    question: z.strictObject({
      id: z.string(),
      title: z.string(),
      options: z.array(MemberPostChoiceOptionSchema),
      reason: z.unknown().nullable(),
      post: z.strictObject({ id: z.string() }),
    }),
  })
  .openapi('MemberPostChoiceAnswerInList')

const V1MemberPostsWithAnswersItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    publishedDate: z.string(),
    lastAnsweredTime: z.string(),
    essayAnswers: z.array(MemberPostEssayAnswerInListSchema),
    choiceAnswers: z.array(MemberPostChoiceAnswerInListSchema),
  })
  .openapi('MemberPostWithAnswersItem')

export const V1MemberPostsWithAnswersResponseSchema = z.object({
  posts: z.array(V1MemberPostsWithAnswersItemSchema),
  nextCursor: z.string().nullable(),
})

export const V1MemberAvatarUploadResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
})

export const V1MemberAvatarDeleteResponseSchema = z.object({
  id: z.string(),
})

/* --- Infra: health, OpenAPI, auth */

registry.registerPath({
  method: 'get',
  path: '/health',
  tags: ['Infra'],
  description: 'Health: DB connectivity plus timestamp in success payload.',
  responses: {
    200: {
      description: 'OK',
      content: {
        'application/json': { schema: HealthOkWithTimestampSchema },
      },
    },
    503: {
      description: 'Unhealthy',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'options',
  path: '/auth/access-token',
  tags: ['Auth'],
  description:
    'CORS preflight for the access token exchange (browser + cookies).',
  responses: { 204: { description: 'No content' } },
})

registry.registerPath({
  method: 'post',
  path: '/auth/access-token',
  tags: ['Auth'],
  description:
    'Exchanges the `id_token` **cookie** (forwarded to Go API) for a **Bearer** JWT. Requires `Origin` or `Referer` from an allowlisted origin. Used by the frontend; not for unauthenticated server-to-server calls.',
  responses: {
    200: {
      description: 'Access token issued',
      content: {
        'application/json': { schema: V1AccessTokenResponseSchema },
      },
    },
    400: {
      description: 'Missing id_token cookie',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description:
        'Unauthorized: invalid id_token when exchanging upstream (Go API **400**/**401**), **or** upstream returned a JWT body that failed local verification (**iss** / **aud** / **user_id**).',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Origin not allowed, missing, or invalid',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    500: {
      description: 'Internal error or upstream issue',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

/* --- Public: categories, tags, authors */

registry.registerPath({
  method: 'get',
  path: '/v1/categories/{slug}/posts',
  tags: ['Taxonomy'],
  description:
    'Posts for a top-level **category** slug. Aggregates all sub-subcategories under that category. Empty list if slug is unknown (no 404).',
  request: {
    params: V1FeedSlugPathParamsSchema,
    query: V1CategoryPostsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1CategoryBySlugCategoryPostsResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/categories/{slug}/metadata',
  tags: ['Taxonomy'],
  description:
    'OG metadata for a category, optionally filtered to one subcategory by `subcategorySlug`.',
  request: {
    params: V1FeedSlugPathParamsSchema,
    query: V1CategoryBySlugMetadataQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1CategoryBySlugMetadataResponseSchema,
        },
      },
    },
    404: {
      description: 'Category not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/categories/{slug}/subcategories-theme',
  tags: ['Taxonomy'],
  description:
    'Display name, theme color, and subcategory list for a category tab UI.',
  request: { params: V1FeedSlugPathParamsSchema },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1CategoryBySlugSubcategoriesThemeResponseSchema,
        },
      },
    },
    404: {
      description: 'Category not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/subcategories/{slug}/posts',
  tags: ['Taxonomy'],
  description:
    'Feed posts for a **subcategory** slug (published/archived, sub-subcategory membership).',
  request: {
    params: V1FeedSlugPathParamsSchema,
    query: V1CategoryPostsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1SubcategoryBySlugPostsResponseSchema },
      },
    },
    404: {
      description: 'Subcategory not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/sub-subcategories/{slug}/posts',
  tags: ['Taxonomy'],
  description: 'Public posts for a **sub-subcategory** slug, latest-first.',
  request: {
    params: V1FeedSlugPathParamsSchema,
    query: V1SubSubcategoryBySlugPostsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1SubSubcategoryBySlugPostsResponseSchema,
        },
      },
    },
    404: {
      description: 'Sub-subcategory not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/tags/{slug}/meta',
  tags: ['Taxonomy'],
  description: 'OG metadata for a tag page.',
  request: { params: V1FeedSlugPathParamsSchema },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1TagBySlugMetaResponseSchema },
      },
    },
    404: {
      description: 'Tag not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/tags/{slug}/posts',
  tags: ['Taxonomy'],
  description: 'Public posts for a tag (with count).',
  request: {
    params: V1FeedSlugPathParamsSchema,
    query: V1TagBySlugPostsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1TagBySlugPostsResponseSchema },
      },
    },
    404: {
      description: 'Tag not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/authors/{slug}/meta',
  tags: ['Taxonomy'],
  description: 'Author bio, name, and small image for a profile/SEO surface.',
  request: { params: V1FeedSlugPathParamsSchema },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1AuthorBySlugMetaResponseSchema },
      },
    },
    404: {
      description: 'Author not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/authors/{slug}/posts',
  tags: ['Taxonomy'],
  description: 'Author posts and profile fields for the list view.',
  request: {
    params: V1FeedSlugPathParamsSchema,
    query: V1AuthorBySlugPostsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1AuthorBySlugPostsResponseSchema },
      },
    },
    404: {
      description: 'Author not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/authors/{slug}/posts-count',
  tags: ['Taxonomy'],
  description:
    'Public post count for an author (matches GraphQL `GetAuthorPostsCount`).',
  request: { params: V1FeedSlugPathParamsSchema },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1AuthorPostsCountResponseSchema },
      },
    },
    404: {
      description: 'Author not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

/* --- Authenticated: member (Bearer JWT) */

registry.registerPath({
  method: 'get',
  path: '/v1/members/me/posts-with-answers',
  tags: ['Members'],
  description: 'Cursor-paginated; role must be `member` or `admin`.',
  request: { query: V1MemberPostsWithAnswersQuerySchema },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1MemberPostsWithAnswersResponseSchema },
      },
    },
    401: {
      description: 'Missing or invalid JWT',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Role not allowed',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Member not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/members/me/essay-answers/has-liked',
  tags: ['Members'],
  description: 'Batch check liked state per ID.',
  request: { query: V1EssayAnswersHasLikedQuerySchema },
  responses: {
    200: {
      description: 'Success: root array (empty if no ids or none match).',
      content: {
        'application/json': { schema: V1EssayAnswersHasLikedResponseSchema },
      },
    },
    400: {
      description: 'Invalid query (e.g. validation failure)',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description: 'Missing or invalid JWT',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Role not allowed',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Member not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/v1/members/me/avatar',
  tags: ['Members'],
  description:
    'Upload: `multipart/form-data` field `file` (jpeg/png/gif/webp, max 5MB). `IMAGES_STORAGE_PATH` must be configured. Role `member` or `admin`.',
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            file: z.string().openapi({ type: 'string', format: 'binary' }),
            name: z.string().optional().openapi({
              description: 'Display name, default `memberAvatar`.',
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Created',
      content: {
        'application/json': { schema: V1MemberAvatarUploadResponseSchema },
      },
    },
    400: {
      description: 'Missing file, invalid type, etc.',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description: 'Missing or invalid JWT',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Role not allowed',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Member not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    500: {
      description: 'Storage not configured',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/v1/members/me/avatar',
  tags: ['Members'],
  description: 'Removes current avatar and deletes the stored file.',
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1MemberAvatarDeleteResponseSchema },
      },
    },
    401: {
      description: 'Missing or invalid JWT',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'No avatar to delete',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})
