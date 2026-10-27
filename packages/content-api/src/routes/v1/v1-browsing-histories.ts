import {
  V1BrowsingHistoriesQuerySchema,
  V1CreateBrowsingHistoryBodySchema,
} from '@kids-reporter/api-types'
import { asyncRoute, sendJsonError } from '@kids-reporter/content-api-kit'
import express from 'express'
import { z } from 'zod'

import consts from '../../constants.js'
import {
  listMemberBrowsingHistories,
  recordMemberBrowsingHistory,
  type RecordResult,
} from '../../queries/browsing-histories.js'
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

function sendRecordError(
  res: express.Response,
  result: RecordResult<unknown>
): boolean {
  if (result.kind === 'not_found') {
    sendJsonError(res, 404, 'not_found', 'Not found')
    return true
  }
  return false
}

export function createV1BrowsingHistoriesRouter() {
  const router = express.Router()

  router.get(
    '/me/browsing-histories',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const q = V1BrowsingHistoriesQuerySchema.parse(req.query)
      const rows = await listMemberBrowsingHistories(
        member.id,
        {
          take: q.take ?? 12,
          skip: q.skip ?? 0,
        },
        new Date()
      )
      res.json(rows)
    })
  )

  router.post(
    '/me/browsing-histories',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const parsed = V1CreateBrowsingHistoryBodySchema.safeParse(req.body ?? {})
      if (!parsed.success) throw new z.ZodError(parsed.error.issues)

      const result = await recordMemberBrowsingHistory(
        member.id,
        { type: parsed.data.type, slug: parsed.data.slug },
        new Date()
      )
      if (sendRecordError(res, result)) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  return router
}
