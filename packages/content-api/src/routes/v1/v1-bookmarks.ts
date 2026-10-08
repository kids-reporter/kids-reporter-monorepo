import {
  V1BookmarkPathIdSchema,
  V1BookmarksQuerySchema,
  V1CreateBookmarkBodySchema,
} from '@kids-reporter/api-types'
import { asyncRoute, sendJsonError } from '@kids-reporter/content-api-kit'
import express from 'express'
import { z } from 'zod'

import consts from '../../constants.js'
import {
  createMemberBookmark,
  deleteMemberBookmark,
  listMemberBookmarks,
  type MutationResult,
} from '../../queries/bookmarks.js'
import { findMemberIdRole } from '../../queries/members.js'

const statusCodes = consts.statusCodes

async function requireMember(
  req: express.Request,
  res: express.Response
): Promise<{ id: string } | null> {
  const userId = req.goApiJwtUserId
  if (!userId) {
    sendJsonError(res, statusCodes.unauthorized, 'unauthorized', 'Unauthorized')
    return null
  }
  const m = await findMemberIdRole(userId)
  if (!m) {
    sendJsonError(res, 404, 'not_found', 'Not found')
    return null
  }
  if (m.role !== 'member' && m.role !== 'admin') {
    sendJsonError(res, 403, 'forbidden', 'Forbidden')
    return null
  }
  return { id: m.id }
}

function sendMutationError(
  res: express.Response,
  result: MutationResult<unknown>,
  duplicateReason?: string
): boolean {
  if (result.kind === 'not_found') {
    sendJsonError(res, 404, 'not_found', 'Not found')
    return true
  }
  if (result.kind === 'forbidden') {
    sendJsonError(res, 403, 'forbidden', 'Forbidden')
    return true
  }
  if (result.kind === 'duplicate') {
    sendJsonError(res, 409, 'conflict', 'Conflict', {
      reason: duplicateReason ?? 'duplicate',
    })
    return true
  }
  return false
}

export function createV1BookmarksRouter() {
  const router = express.Router()

  router.get(
    '/me/bookmarks',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const q = V1BookmarksQuerySchema.parse(req.query)
      const rows = await listMemberBookmarks(
        member.id,
        {
          take: q.take ?? 12,
          skip: q.skip ?? 0,
          type: q.type,
          slug: q.slug,
        },
        new Date()
      )
      res.json(rows)
    })
  )

  router.post(
    '/me/bookmarks',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const parsed = V1CreateBookmarkBodySchema.safeParse(req.body ?? {})
      if (!parsed.success) throw new z.ZodError(parsed.error.issues)

      const result = await createMemberBookmark(
        member.id,
        { type: parsed.data.type, slug: parsed.data.slug },
        new Date()
      )
      if (sendMutationError(res, result, 'duplicate_bookmark')) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  router.delete(
    '/me/bookmarks/:id',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const parsed = V1BookmarkPathIdSchema.safeParse(req.params)
      if (!parsed.success) {
        sendJsonError(res, 400, 'invalid_request', 'Invalid id', {
          reason: 'invalid_id',
        })
        return
      }

      const result = await deleteMemberBookmark(member.id, parsed.data.id)
      if (sendMutationError(res, result)) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  return router
}
