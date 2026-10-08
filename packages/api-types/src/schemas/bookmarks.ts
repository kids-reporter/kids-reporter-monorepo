import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { RestErrorBodySchema } from '../rest.js'
import { PostContentSchema, registry, V1ProjectsItemSchema } from './content.js'

extendZodWithOpenApi(z)

export const V1BookmarkTypeSchema = z.enum(['post', 'project'])

export const V1CreateBookmarkBodySchema = z.object({
  type: V1BookmarkTypeSchema,
  slug: z.string().min(1),
})

export const V1CreateBookmarkResponseSchema = z.object({
  id: z.string(),
  type: V1BookmarkTypeSchema,
  slug: z.string(),
})

export const V1DeleteBookmarkResponseSchema = z.object({
  id: z.string(),
})

export const V1BookmarkPathIdSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const V1BookmarksQuerySchema = z
  .object({
    take: z.coerce.number().int().min(1).max(50).optional(),
    skip: z.coerce.number().int().min(0).max(5000).optional(),
    type: V1BookmarkTypeSchema.optional(),
    slug: z.string().min(1).optional(),
  })
  .superRefine((q, ctx) => {
    if (q.slug != null && q.type == null) {
      ctx.addIssue({
        code: 'custom',
        path: ['type'],
        message: 'type is required when slug is provided',
      })
    }
  })

const BookmarkProjectCardSchema = V1ProjectsItemSchema.omit({
  relatedPostsOrdered: true,
})

export const V1BookmarkItemSchema = z
  .discriminatedUnion('type', [
    z.object({
      id: z.string(),
      createdAt: z.iso.datetime().nullable(),
      type: z.literal('post'),
      post: PostContentSchema,
    }),
    z.object({
      id: z.string(),
      createdAt: z.iso.datetime().nullable(),
      type: z.literal('project'),
      project: BookmarkProjectCardSchema,
    }),
  ])
  .openapi('BookmarkItem')

export const V1BookmarksResponseSchema = z.array(V1BookmarkItemSchema)

registry.registerPath({
  method: 'post',
  path: '/v1/members/me/bookmarks',
  tags: ['Member Bookmarks'],
  description:
    'Bookmark a published post or project for the authenticated member. Duplicate returns 409.',
  request: {
    body: {
      content: {
        'application/json': { schema: V1CreateBookmarkBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Created',
      content: {
        'application/json': { schema: V1CreateBookmarkResponseSchema },
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
      description: 'Member or target not found / not public',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    409: {
      description: 'Already bookmarked',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'delete',
  path: '/v1/members/me/bookmarks/{id}',
  tags: ['Member Bookmarks'],
  description: 'Remove a bookmark by row id. Only the owner can delete.',
  request: {
    params: V1BookmarkPathIdSchema,
  },
  responses: {
    200: {
      description: 'Deleted',
      content: {
        'application/json': { schema: V1DeleteBookmarkResponseSchema },
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
      description: 'Not owner of this bookmark',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
    404: {
      description: 'Bookmark not found',
      content: { 'application/json': { schema: RestErrorBodySchema } },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/members/me/bookmarks',
  tags: ['Member Bookmarks'],
  description:
    'List the authenticated member bookmarks, newest first. Optional `type` filters; optional `slug` (requires `type`) returns the matching row if saved.',
  request: {
    query: V1BookmarksQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1BookmarksResponseSchema },
      },
    },
    400: {
      description: 'Invalid query',
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
