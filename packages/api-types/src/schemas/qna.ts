import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { RestErrorBodySchema } from '../rest.js'
import { registry } from './content.js'

extendZodWithOpenApi(z)

const QnaMemberAvatarSchema = z
  .object({
    id: z.string(),
    fileUrl: z.string(),
  })
  .openapi('QnaMemberAvatar')

const QnaMemberPublicSchema = z
  .object({
    id: z.string(),
    avatar: QnaMemberAvatarSchema.nullable().optional(),
    nickname: z.string(),
    name: z.string(),
    email: z.string(),
  })
  .openapi('QnaMemberPublic')

const EssayAnswerPublicItemSchema = z
  .object({
    id: z.string(),
    createdAt: z.string().optional(),
    question: z
      .object({
        id: z.string(),
        post: z.object({ slug: z.string() }).optional(),
        title: z.string(),
      })
      .optional(),
    member: QnaMemberPublicSchema.optional(),
    content: z.string(),
    likesCount: z.number().int(),
  })
  .openapi('EssayAnswerPublicItem')

export const V1AllPostEssayAnswersQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(100).optional(),
  orderBy: z.enum(['createdAt:desc']).optional().default('createdAt:desc'),
})

export const V1AllPostEssayAnswersResponseSchema = z.array(
  EssayAnswerPublicItemSchema
)

registry.registerPath({
  method: 'get',
  path: '/v1/post-essay-answers',
  tags: ['Public Q&A'],
  description: 'Flat `orderBy`: `createdAt:desc` only.',
  request: {
    query: V1AllPostEssayAnswersQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1AllPostEssayAnswersResponseSchema },
      },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

export const V1PostEssayQuestionAnswersParamsSchema = z.object({
  questionId: z.coerce.number().int().positive(),
})

export const V1PostEssayQuestionAnswersQuerySchema = z.object({
  answerTake: z.coerce.number().int().min(1).max(100),
  answerSkip: z.coerce.number().int().min(0).max(5000).optional(),
  answerOrderBy: z
    .enum(['createdAt:desc', 'likesCount:desc'])
    .optional()
    .default('createdAt:desc'),
})

const EssayAnswerThreadItemSchema = z
  .object({
    id: z.string(),
    content: z.string(),
    member: QnaMemberPublicSchema.optional(),
    likesCount: z.number().int(),
    createdAt: z.string().optional(),
  })
  .openapi('EssayAnswerThreadItem')

export const V1PostEssayQuestionWithAnswersResponseSchema = z.object({
  id: z.string(),
  title: z.string(),
  hint: z.string(),
  answers: z.array(EssayAnswerThreadItemSchema),
})

registry.registerPath({
  method: 'get',
  path: '/v1/post-essay-questions/{questionId}',
  tags: ['Public Q&A'],
  description:
    'Question detail with answers thread. Flat `answerOrderBy`: `createdAt:desc` or `likesCount:desc`.',
  request: {
    params: V1PostEssayQuestionAnswersParamsSchema,
    query: V1PostEssayQuestionAnswersQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': {
          schema: V1PostEssayQuestionWithAnswersResponseSchema,
        },
      },
    },
    400: {
      description: 'Bad request',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Question not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

const ChoiceAnswerItemSchema = z
  .object({
    id: z.string(),
    question: z.object({ id: z.string() }).optional(),
    choiceIndex: z.number().int(),
    correct: z.boolean(),
  })
  .openapi('ChoiceAnswerItem')

export const V1MemberPostChoiceAnswersQuerySchema = z.object({
  postSlug: z.string().optional(),
})

export const V1MemberPostChoiceAnswersResponseSchema = z.array(
  ChoiceAnswerItemSchema
)

registry.registerPath({
  method: 'get',
  path: '/v1/members/me/post-choice-answers',
  tags: ['Member Q&A'],
  description: 'Choice answers for the authenticated member.',
  request: {
    query: V1MemberPostChoiceAnswersQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1MemberPostChoiceAnswersResponseSchema },
      },
    },
    401: {
      description: 'Unauthorized',
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

const EssayAnswerMemberItemSchema = z
  .object({
    id: z.string(),
    question: z.object({ id: z.string() }).optional(),
    content: z.string(),
  })
  .openapi('EssayAnswerMemberItem')

export const V1MemberPostEssayAnswersQuerySchema = z.object({
  postSlug: z.string().optional(),
})

export const V1MemberPostEssayAnswersResponseSchema = z.array(
  EssayAnswerMemberItemSchema
)

registry.registerPath({
  method: 'get',
  path: '/v1/members/me/post-essay-answers',
  tags: ['Member Q&A'],
  description: 'Essay answers for the authenticated member.',
  request: {
    query: V1MemberPostEssayAnswersQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1MemberPostEssayAnswersResponseSchema },
      },
    },
    401: {
      description: 'Unauthorized',
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

const connectIdSchema = z.union([z.string(), z.number()])

/** Native REST: `questionId` coerces to numeric id server-side. */
export const V1CreatePostChoiceAnswerBodySchema = z.object({
  questionId: connectIdSchema,
  choiceIndex: z.number().int(),
})

/** PATCH body: `id` is in the URL path. */
export const V1PatchPostChoiceAnswerBodySchema = z.object({
  choiceIndex: z.number().int().optional(),
})

export const V1CreatePostEssayAnswerBodySchema = z.object({
  questionId: connectIdSchema,
  content: z.string(),
})

/** PATCH body: `id` is in the URL path. */
export const V1PatchPostEssayAnswerBodySchema = z.object({
  content: z.string(),
})

/** Native REST: essay answer id to like (`PostEssayAnswer.id`). */
export const V1CreatePostEssayAnswerLikeBodySchema = z.object({
  answerId: connectIdSchema,
})

export const V1CreatePostChoiceAnswerResponseSchema = z.object({
  id: z.string(),
  choiceIndex: z.number().int(),
  correct: z.boolean(),
  question: z.object({ id: z.string() }).optional(),
})

export const V1UpdatePostChoiceAnswerResponseSchema = z.object({
  id: z.string(),
  choiceIndex: z.number().int(),
  correct: z.boolean(),
})

export const V1CreatePostEssayAnswerResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
  question: z.object({ id: z.string() }).optional(),
})

export const V1UpdatePostEssayAnswerResponseSchema = z.object({
  id: z.string(),
  content: z.string(),
})

export const V1CreatePostEssayAnswerLikeResponseSchema = z.object({
  id: z.string(),
  answer: z.object({ id: z.string() }),
  member: z.object({ id: z.string() }),
})

export const V1DeletePostEssayAnswerLikeResponseSchema = z.object({
  id: z.string(),
})

const V1PostChoiceAnswerPathIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

const V1PostEssayAnswerPathIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

/** Path `id` for DELETE like (numeric `PostEssayAnswerLike.id`). */
export const V1PostEssayAnswerLikePathIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

registry.registerPath({
  method: 'post',
  path: '/v1/members/me/post-choice-answers',
  tags: ['Member Q&A'],
  description: 'Create a choice answer for the authenticated member.',
  request: {
    body: {
      content: {
        'application/json': { schema: V1CreatePostChoiceAnswerBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Created',
      content: {
        'application/json': { schema: V1CreatePostChoiceAnswerResponseSchema },
      },
    },
    400: {
      description: 'Invalid body',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Member not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/v1/members/me/post-choice-answers/{id}',
  tags: ['Member Q&A'],
  description: 'Update a choice answer for the authenticated member.',
  request: {
    params: V1PostChoiceAnswerPathIdSchema,
    body: {
      content: {
        'application/json': { schema: V1PatchPostChoiceAnswerBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated',
      content: {
        'application/json': { schema: V1UpdatePostChoiceAnswerResponseSchema },
      },
    },
    400: {
      description: 'Invalid id or body',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Not owner or forbidden',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/v1/members/me/post-essay-answers',
  tags: ['Member Q&A'],
  description: 'Create an essay answer for the authenticated member.',
  request: {
    body: {
      content: {
        'application/json': { schema: V1CreatePostEssayAnswerBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Created',
      content: {
        'application/json': { schema: V1CreatePostEssayAnswerResponseSchema },
      },
    },
    400: {
      description: 'Invalid body',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Member not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'patch',
  path: '/v1/members/me/post-essay-answers/{id}',
  tags: ['Member Q&A'],
  description: 'Update an essay answer for the authenticated member.',
  request: {
    params: V1PostEssayAnswerPathIdSchema,
    body: {
      content: {
        'application/json': { schema: V1PatchPostEssayAnswerBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Updated',
      content: {
        'application/json': { schema: V1UpdatePostEssayAnswerResponseSchema },
      },
    },
    400: {
      description: 'Invalid id or content',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Not owner or forbidden',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'post',
  path: '/v1/members/me/post-essay-answer-likes',
  tags: ['Member Q&A'],
  description:
    'Like an essay answer (increments `likesCount`). Duplicate like returns 409.',
  request: {
    body: {
      content: {
        'application/json': { schema: V1CreatePostEssayAnswerLikeBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Created',
      content: {
        'application/json': {
          schema: V1CreatePostEssayAnswerLikeResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid body',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Forbidden',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Member not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    409: {
      description: 'Already liked (unique key)',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/v1/members/me/post-essay-answer-likes/{id}',
  tags: ['Member Q&A'],
  description:
    'Unlike an essay answer by like row `id`. Decrements `likesCount` on the answer.',
  request: {
    params: V1PostEssayAnswerLikePathIdSchema,
  },
  responses: {
    200: {
      description: 'Deleted',
      content: {
        'application/json': {
          schema: V1DeletePostEssayAnswerLikeResponseSchema,
        },
      },
    },
    400: {
      description: 'Invalid path id',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    401: {
      description: 'Unauthorized',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    403: {
      description: 'Not owner of this like',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Like not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})
