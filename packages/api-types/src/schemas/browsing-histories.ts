import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

import { RestErrorBodySchema } from '../rest.js'
import {
  PostContentSchema,
  PostHeroImageSchema,
  registry,
  V1ProjectsItemSchema,
} from './content.js'

extendZodWithOpenApi(z)

export const V1BrowsingHistoryTypeSchema = z.enum(['post', 'project'])

export const V1CreateBrowsingHistoryBodySchema = z.object({
  type: V1BrowsingHistoryTypeSchema,
  slug: z.string().min(1),
})

export const V1CreateBrowsingHistoryResponseSchema = z.object({
  id: z.string(),
  type: V1BrowsingHistoryTypeSchema,
  slug: z.string(),
  visitedAt: z.iso.datetime().nullable(),
})

export const V1BrowsingHistoriesQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional(),
  skip: z.coerce.number().int().min(0).max(5000).optional(),
})

const BrowsingHistoryPostCardSchema = PostContentSchema.extend({
  ogTitle: z.string(),
  ogImage: PostHeroImageSchema.nullable(),
})

const BrowsingHistoryProjectCardSchema = V1ProjectsItemSchema.omit({
  relatedPostsOrdered: true,
}).extend({
  ogTitle: z.string(),
  ogImage: PostHeroImageSchema.nullable(),
  updatedAt: z.iso.datetime().nullable(),
  relatedPostsCount: z.number().int().min(0),
})

export const V1BrowsingHistoryItemSchema = z
  .discriminatedUnion('type', [
    z.object({
      id: z.string(),
      visitedAt: z.iso.datetime().nullable(),
      type: z.literal('post'),
      post: BrowsingHistoryPostCardSchema,
    }),
    z.object({
      id: z.string(),
      visitedAt: z.iso.datetime().nullable(),
      type: z.literal('project'),
      project: BrowsingHistoryProjectCardSchema,
    }),
  ])
  .openapi('BrowsingHistoryItem')

export const V1BrowsingHistoriesResponseSchema = z
  .object({
    browsingHistories: z.array(V1BrowsingHistoryItemSchema),
    browsingHistoriesCount: z.number().int().min(0),
  })
  .openapi('BrowsingHistoriesResponse')

registry.registerPath({
  method: 'post',
  path: '/v1/members/me/browsing-histories',
  tags: ['Member Browsing History'],
  description:
    'Record a visit to a published post or project for the authenticated member. A repeat visit updates visitedAt.',
  request: {
    body: {
      content: {
        'application/json': { schema: V1CreateBrowsingHistoryBodySchema },
      },
    },
  },
  responses: {
    200: {
      description: 'Recorded',
      content: {
        'application/json': { schema: V1CreateBrowsingHistoryResponseSchema },
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
  },
})

registry.registerPath({
  method: 'get',
  path: '/v1/members/me/browsing-histories',
  tags: ['Member Browsing History'],
  description:
    'List the authenticated member browsing history, most recently visited first. Response includes `browsingHistories` and total `browsingHistoriesCount`.',
  request: {
    query: V1BrowsingHistoriesQuerySchema,
  },
  responses: {
    200: {
      description: 'Success',
      content: {
        'application/json': { schema: V1BrowsingHistoriesResponseSchema },
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
