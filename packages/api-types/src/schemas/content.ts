import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
} from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { RestErrorBodySchema } from '../rest.js'
import {
  V1PostDetailBodySchema,
  V1PostEssayQuestionsBodySchema,
  V1PostMetaBodySchema,
  V1PostsEssayAnswersWithLikesResponseSchema,
  V1ProjectDetailRelatedPostOrderedItemSchema,
} from './content-post-detail.js'

extendZodWithOpenApi(z)

export const registry = new OpenAPIRegistry()

export const PhotoResizedSchema = z
  .object({
    small: z
      .string()
      .default('')
      .openapi({ example: 'https://kids.twreporter.org/resized/abc-800.webp' }),
  })
  .openapi('ResizedPhoto')

export const PostHeroImageSchema = z
  .object({
    resized: PhotoResizedSchema,
  })
  .openapi('PostHeroImage')

/**
 * Lightweight sub-subcategory shape for **feeds and list payloads** (`PostContentSchema`,
 * e.g. `/v1/posts`, editor picks). Omits sub-subcategory / subcategory slugs on purpose —
 * callers only need labels + category slug for cards. For the **full tree with slugs**
 * (article detail, related-post cards), see `SubSubcategoryFullItemSchema` in
 * `content-post-detail.ts`.
 */
export const PostSubSubcategorySchema = z
  .object({
    name: z.string(),
    subcategory: z
      .object({
        name: z.string(),
        category: z
          .object({
            slug: z.string(),
            themeColor: z.string().nullable().optional(),
          })
          .nullable()
          .optional(),
      })
      .nullable()
      .optional(),
  })
  .openapi('PostSubSubcategory')

export const PostContentSchema = z
  .object({
    title: z.string(),
    slug: z.string(),
    ogDescription: z.string().nullable().optional(),
    heroImage: PostHeroImageSchema.nullable().optional(),
    subSubcategoriesOrdered: z.array(PostSubSubcategorySchema).default([]),
    publishedDate: z.iso.datetime().nullable().optional(),
  })
  .openapi('PostContent')

export type PostContent = z.infer<typeof PostContentSchema>

export const SubcategoryItemSchema = z
  .object({
    id: z.union([z.string(), z.number().int()]),
    name: z.string(),
    slug: z.string(),
    category: z.object({ slug: z.string() }).nullable().optional(),
  })
  .openapi('Subcategory')

export const CallBaodaozaiIntroItemSchema = z
  .object({
    id: z.union([z.string(), z.number().int()]),
    page: z.string(),
    content: z.string(),
  })
  .openapi('CallBaodaozaiIntro')

export const EditorPicksSettingItemSchema = z
  .object({
    id: z.union([z.string(), z.number().int()]),
    editorPicksOfPostsOrdered: z.array(PostContentSchema).default([]),
    editorPicksOfTags: z
      .array(z.object({ name: z.string(), slug: z.string() }))
      .default([]),
    popularKeywordsOrdered: z.array(z.object({ name: z.string() })).default([]),
  })
  .openapi('EditorPicksSetting')

export const V1PostsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional(),
  skip: z.coerce.number().int().min(0).max(5000).optional(),
  orderBy: z.enum(['publishedDate:desc']).optional(),
})

export const V1PostsResponseSchema = z.object({
  posts: z.array(PostContentSchema),
  page: z.object({
    take: z.number().int().min(1).max(50),
    skip: z.number().int().min(0),
  }),
})

registry.registerPath({
  method: 'get',
  path: '/v1/posts',
  tags: ['Posts'],
  description: 'List latest published posts.',
  request: {
    query: V1PostsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1PostsResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

export const V1SubcategoriesResponseSchema = z.array(SubcategoryItemSchema)

registry.registerPath({
  method: 'get',
  path: '/v1/subcategories',
  tags: ['Taxonomy'],
  description: 'All subcategories with parent category slug.',
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1SubcategoriesResponseSchema,
        },
      },
    },
  },
})

export const V1AuthorAvatarPathParamsSchema = z.object({
  slug: z.string().min(1),
})

export const V1AuthorAvatarResponseSchema = z
  .object({
    tiny: z.string(),
  })
  .openapi('AuthorAvatarTiny')

registry.registerPath({
  method: 'get',
  path: '/v1/authors/by-slug/{slug}/avatar',
  tags: ['Taxonomy'],
  description:
    'Author avatar tiny image URL by slug. `tiny` is empty when the author or avatar is missing.',
  request: {
    params: V1AuthorAvatarPathParamsSchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1AuthorAvatarResponseSchema,
        },
      },
    },
  },
})

export const V1PopularKeywordsResponseSchema = z.array(
  z.object({ name: z.string() })
)

registry.registerPath({
  method: 'get',
  path: '/v1/popular-keywords',
  tags: ['Editor'],
  description: 'Popular keywords from editor picks ordering.',
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1PopularKeywordsResponseSchema,
        },
      },
    },
  },
})

export const V1CallBaodaozaiIntroPathParamsSchema = z.object({
  page: z.enum([
    'home',
    'all',
    'topics',
    'news',
    'storytelling',
    'campus',
    'listeningNews',
    'classroom',
  ]),
})

export const V1CallBaodaozaiIntroResponseSchema = CallBaodaozaiIntroItemSchema

registry.registerPath({
  method: 'get',
  path: '/v1/call-baodaozai-intros/{page}',
  tags: ['Editor'],
  description: 'Get Call Baodaozai intro content by page.',
  request: {
    params: V1CallBaodaozaiIntroPathParamsSchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1CallBaodaozaiIntroResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

/** Query for `GET /v1/projects`. */
export const V1ProjectsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional(),
  skip: z.coerce.number().int().min(0).max(5000).optional(),
  orderBy: z.enum(['publishedDate:desc']).optional(),
  includeRelatedPosts: z
    .union([z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => v === 'true'),
})

export const V1ProjectsItemSchema = z
  .object({
    title: z.string(),
    subtitle: z.string(),
    slug: z.string(),
    ogDescription: z.string().nullable().optional(),
    publishedDate: z.iso.datetime().nullable().optional(),
    heroImage: z
      .object({
        resized: z.object({
          small: z.string(),
          medium: z.string(),
        }),
      })
      .nullable()
      .optional(),
    relatedPostsOrdered: z.array(PostContentSchema).optional(),
  })
  .openapi('ProjectsItem')

export const V1ProjectsResponseSchema = z.object({
  projects: z.array(V1ProjectsItemSchema),
  projectsCount: z.number().int().min(0),
})

registry.registerPath({
  method: 'get',
  path: '/v1/projects',
  tags: ['Projects'],
  description:
    'List published projects. Response always includes `projects` and total `projectsCount`. Optional `relatedPostsOrdered` on each item appears only when `includeRelatedPosts=true`.',
  request: {
    query: V1ProjectsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1ProjectsResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

export const V1EditorPicksSettingsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(20).optional().default(5),
})

export const V1EditorPicksSettingsResponseSchema = z.array(
  EditorPicksSettingItemSchema
)

registry.registerPath({
  method: 'get',
  path: '/v1/editor-picks-settings',
  tags: ['Editor'],
  description: 'Editor picks configuration rows.',
  request: {
    query: V1EditorPicksSettingsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1EditorPicksSettingsResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

export const V1MemberAvatarSchema = z
  .object({
    id: z.string(),
    fileUrl: z.string(),
  })
  .openapi('MemberAvatar')

export const V1MemberProfileSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    nickname: z.string(),
    contactEmail: z.string(),
    twreporter_user_id: z.string(),
    showBaodaozai: z.boolean(),
    essayQuestionCount: z.number().int().nullable().optional(),
    avatar: V1MemberAvatarSchema.nullable().optional(),
    createdAt: z.iso.datetime().nullable().optional(),
  })
  .openapi('MemberProfile')

export const V1MemberProfileResponseSchema = V1MemberProfileSchema

export const V1MemberProfilePatchBodySchema = z
  .strictObject({
    name: z.string().optional(),
    nickname: z.string().optional(),
    contactEmail: z.string().optional(),
    showBaodaozai: z.boolean().optional(),
    essayQuestionCount: z.number().int().min(0).max(3).optional(),
  })
  .openapi('MemberProfilePatch')

/** Successful `POST /auth/access-token` response JSON. */
export const V1AccessTokenResponseSchema = z.object({
  accessToken: z.string(),
  twreporterUserId: z.string(),
  expiresAt: z.number(),
})

/** GET `/v1/members/me/posts-with-answers` query string. */
export const V1MemberPostsWithAnswersQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional().default(5),
  cursor: z.string().optional(),
})

registry.registerPath({
  method: 'get',
  path: '/v1/members/me',
  tags: ['Members'],
  description: 'Authenticated member profile (Bearer JWT).',
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1MemberProfileResponseSchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
    404: {
      description: 'Member not found',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/v1/members/me',
  tags: ['Members'],
  description: 'Update authenticated member profile (Bearer JWT).',
  request: {
    body: {
      content: {
        'application/json': {
          schema: V1MemberProfilePatchBodySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1MemberProfileResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
    401: {
      description: 'Unauthorized',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
    404: {
      description: 'Member not found',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

export const V1PostBySlugPathParamsSchema = z.object({
  slug: z.string().min(1),
})

/** Flat query for `GET /v1/posts/by-slug/{slug}` (news-reading order + related-posts filter are fixed server-side). */
export const V1PostBySlugQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional().default(5),
  postEssayQuestionsTake: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(3),
  postChoiceQuestionsTake: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .default(3),
})

export const V1SitemapsQuerySchema = z.object({
  sinceDays: z.coerce.number().int().min(1).max(365).optional().default(60),
})

export const V1SitemapEntrySchema = z.object({
  slug: z.string(),
  publishedDate: z.iso.datetime().nullable(),
})

export const V1SitemapPostsResponseSchema = z.array(V1SitemapEntrySchema)
export const V1SitemapProjectsResponseSchema = z.array(V1SitemapEntrySchema)

export const V1ProjectBySlugMetaResponseSchema = z.object({
  publishedDate: z.iso.datetime().optional(),
  ogTitle: z.string(),
  ogDescription: z.string().nullable(),
  ogImage: z
    .object({
      resized: z.object({ small: z.string() }),
    })
    .nullable(),
})

/** Hero image payloads returned by `/v1/projects/by-slug/{slug}` match Prisma-mapper targets. */
export const V1ProjectDetailPhotoResizedSchema = z.object({
  resized: z.object({
    small: z.string(),
    medium: z.string(),
    large: z.string(),
  }),
})

export const V1ProjectBySlugDetailResponseSchema = z.object({
  title: z.string(),
  titlePosition: z.string().nullable().optional(),
  subtitle: z.string(),
  /** Draft.js JSON etc.; `z.json()` overflows zod-to-openapi union expansion. */
  content: z.unknown().nullable().optional(),
  credits: z.unknown().nullable().optional(),
  publishedDate: z.iso.datetime().optional(),
  heroImage: V1ProjectDetailPhotoResizedSchema.optional(),
  mobileHeroImage: V1ProjectDetailPhotoResizedSchema.optional(),
  relatedPostsOrdered: z.array(V1ProjectDetailRelatedPostOrderedItemSchema),
})

export const V1ProjectRelatedPostsCountResponseSchema = z.object({
  relatedPostsCount: z.number().int().min(0),
})

export const V1AuthorPostsCountResponseSchema = z.object({
  postsCount: z.number().int().min(0),
})

registry.registerPath({
  method: 'get',
  path: '/v1/sitemaps/posts',
  tags: ['Sitemaps'],
  description:
    'Post slugs + published dates for sitemap (public posts only). Query `sinceDays` (1–365, default 60): include posts with `publishedDate` on/after start of day `now - sinceDays`.',
  request: {
    query: V1SitemapsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1SitemapPostsResponseSchema },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': { schema: RestErrorBodySchema },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/sitemaps/projects',
  tags: ['Sitemaps'],
  description:
    'Published project slugs + dates for sitemap. Query `sinceDays` (1–365, default 60): include projects with `publishedDate` on/after start of day `now - sinceDays`.',
  request: {
    query: V1SitemapsQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1SitemapProjectsResponseSchema },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': { schema: RestErrorBodySchema },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/projects/by-slug/{slug}',
  tags: ['Projects'],
  description:
    'Published project detail for topic page (matches GraphQL `GetProject`).',
  request: {
    params: V1PostBySlugPathParamsSchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1ProjectBySlugDetailResponseSchema },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': { schema: RestErrorBodySchema },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/projects/by-slug/{slug}/meta',
  tags: ['Projects'],
  description:
    'Published project OG metadata (matches GraphQL `GetProjectMeta`).',
  request: {
    params: V1PostBySlugPathParamsSchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1ProjectBySlugMetaResponseSchema },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': { schema: RestErrorBodySchema },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/projects/by-slug/{slug}/related-posts-count',
  tags: ['Projects'],
  description:
    'Count of public posts linked to a published project (matches GraphQL `relatedPostsCount` on project).',
  request: {
    params: V1PostBySlugPathParamsSchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1ProjectRelatedPostsCountResponseSchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': { schema: RestErrorBodySchema },
      },
    },
  },
})

export const V1PostsEssayAnswersWithLikesQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional().default(12),
  skip: z.coerce.number().int().min(0).max(5000).optional().default(0),
  orderBy: z
    .enum(['publishedDate:desc'])
    .optional()
    .default('publishedDate:desc'),
  answerTake: z.coerce.number().int().min(1).max(50).optional().default(10),
  answerOrderBy: z
    .enum(['likesCount:desc', 'createdAt:desc'])
    .optional()
    .default('likesCount:desc'),
})

registry.registerPath({
  method: 'get',
  path: '/v1/posts/by-slug/{slug}',
  tags: ['Posts'],
  description:
    'Single post article payload (matches GraphQL `GetPost`). Flat query: `take`, `postEssayQuestionsTake`, `postChoiceQuestionsTake` (1–50 each, defaults 5/3/3). News-reading item order and nested related-posts filter are fixed server-side.',
  request: {
    params: V1PostBySlugPathParamsSchema,
    query: V1PostBySlugQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1PostDetailBodySchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': { schema: RestErrorBodySchema },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/posts/by-slug/{slug}/meta',
  tags: ['Posts'],
  description:
    'Post SEO / Open Graph metadata (matches GraphQL `GetPostMeta`).',
  request: {
    params: V1PostBySlugPathParamsSchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1PostMetaBodySchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/posts/by-slug/{slug}/essay-questions',
  tags: ['Posts'],
  description:
    'Post card plus essay questions (matches GraphQL `GetPostEssayQuestions`).',
  request: {
    params: V1PostBySlugPathParamsSchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1PostEssayQuestionsBodySchema,
        },
      },
    },
    404: {
      description: 'Not found',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/posts/essay-answers-with-likes',
  tags: ['Posts'],
  description:
    'Paged posts with nested essay answers and member avatars (matches GraphQL `GetPostsEssayAnswersWithLikes`). Flat query: `take`, `skip`, `orderBy` (`publishedDate:desc` only), `answerTake`, `answerOrderBy` (`likesCount:desc` | `createdAt:desc`). Post filter (posts with answered essay questions) is fixed server-side.',
  request: {
    query: V1PostsEssayAnswersWithLikesQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1PostsEssayAnswersWithLikesResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: {
        'application/json': {
          schema: RestErrorBodySchema,
        },
      },
    },
  },
})

export * from './content-post-detail.js'
