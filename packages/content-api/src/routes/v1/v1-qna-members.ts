import {
  V1CreatePostChoiceAnswerBodySchema,
  V1CreatePostEssayAnswerBodySchema,
  V1CreatePostEssayAnswerLikeBodySchema,
  V1MemberPostChoiceAnswersQuerySchema,
  V1MemberPostEssayAnswersQuerySchema,
  V1PatchPostChoiceAnswerBodySchema,
  V1PatchPostEssayAnswerBodySchema,
} from '@kids-reporter/api-types'
import express from 'express'
import { z } from 'zod'

import consts from '../../constants.js'
import { verifyGoApiJwt } from '../../middlewares/verify-go-api-jwt.js'
import { findMemberIdRole } from '../../queries/members.js'
import {
  createMemberEssayAnswerLike,
  createMemberPostChoiceAnswer,
  createMemberPostEssayAnswer,
  deleteMemberEssayAnswerLike,
  listMemberPostChoiceAnswers,
  listMemberPostEssayAnswers,
  type MutationResult,
  updateMemberPostChoiceAnswer,
  updateMemberPostEssayAnswer,
} from '../../queries/qna-members.js'
import { asyncRoute } from '../../utils/async-route.js'
import { sendJsonError } from '../../utils/send-json-error.js'

const statusCodes = consts.statusCodes

function questionIdFromBody(raw: string | number): number | null {
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

/** Q&A mutations and member-scoped lists; parity with CMS list hooks in packages/cms/lists/post-*-answer*.ts */

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

/** Map a `MutationResult` short-circuit to a JSON error.
 *  Returns true when an error response was sent. */
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

function parseNumericIdParam(
  req: express.Request,
  res: express.Response
): number | null {
  const id = Number(req.params.id)
  if (!Number.isFinite(id)) {
    sendJsonError(res, 400, 'invalid_request', 'Invalid id', {
      reason: 'invalid_id',
    })
    return null
  }
  return id
}

export function createV1QnaMembersRouter() {
  const router = express.Router()
  router.use(verifyGoApiJwt)

  router.get(
    '/me/post-choice-answers',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const q = V1MemberPostChoiceAnswersQuerySchema.parse(req.query)
      const rows = await listMemberPostChoiceAnswers(member.id, q.postSlug)
      res.json(rows)
    })
  )

  router.get(
    '/me/post-essay-answers',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const q = V1MemberPostEssayAnswersQuerySchema.parse(req.query)
      const rows = await listMemberPostEssayAnswers(member.id, q.postSlug)
      res.json(rows)
    })
  )

  router.post(
    '/me/post-choice-answers',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const parsed = V1CreatePostChoiceAnswerBodySchema.safeParse(
        req.body ?? {}
      )
      if (!parsed.success) throw new z.ZodError(parsed.error.issues)

      const questionId = questionIdFromBody(parsed.data.questionId)
      const choiceIndex = parsed.data.choiceIndex
      if (questionId == null || typeof choiceIndex !== 'number') {
        sendJsonError(res, 400, 'invalid_request', 'Invalid body', {
          reason: 'invalid_body',
        })
        return
      }

      const result = await createMemberPostChoiceAnswer(member.id, {
        questionId,
        choiceIndex,
      })
      if (sendMutationError(res, result, 'duplicate_choice_answer')) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  router.patch(
    '/me/post-choice-answers/:id',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const id = parseNumericIdParam(req, res)
      if (id == null) return

      const parsed = V1PatchPostChoiceAnswerBodySchema.safeParse(req.body ?? {})
      if (!parsed.success) throw new z.ZodError(parsed.error.issues)

      const result = await updateMemberPostChoiceAnswer(
        member.id,
        id,
        parsed.data as { choiceIndex?: number }
      )
      if (sendMutationError(res, result)) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  router.post(
    '/me/post-essay-answers',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const parsed = V1CreatePostEssayAnswerBodySchema.safeParse(req.body ?? {})
      if (!parsed.success) throw new z.ZodError(parsed.error.issues)

      const questionId = questionIdFromBody(parsed.data.questionId)
      const content = parsed.data.content
      if (questionId == null || typeof content !== 'string') {
        sendJsonError(res, 400, 'invalid_request', 'Invalid body', {
          reason: 'invalid_body',
        })
        return
      }

      const result = await createMemberPostEssayAnswer(member.id, {
        questionId,
        content,
      })
      if (sendMutationError(res, result, 'duplicate_essay_answer')) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  router.patch(
    '/me/post-essay-answers/:id',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const id = parseNumericIdParam(req, res)
      if (id == null) return

      const parsed = V1PatchPostEssayAnswerBodySchema.safeParse(req.body ?? {})
      if (!parsed.success) throw new z.ZodError(parsed.error.issues)

      const content = (parsed.data as { content?: unknown }).content
      if (typeof content !== 'string') {
        sendJsonError(res, 400, 'invalid_request', 'Invalid body', {
          reason: 'invalid_body',
        })
        return
      }

      const result = await updateMemberPostEssayAnswer(member.id, id, content)
      if (sendMutationError(res, result)) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  router.post(
    '/me/post-essay-answer-likes',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const parsed = V1CreatePostEssayAnswerLikeBodySchema.safeParse(
        req.body ?? {}
      )
      if (!parsed.success) throw new z.ZodError(parsed.error.issues)

      const answerId = questionIdFromBody(parsed.data.answerId)
      if (answerId == null) {
        sendJsonError(res, 400, 'invalid_request', 'Invalid body', {
          reason: 'invalid_body',
        })
        return
      }

      const result = await createMemberEssayAnswerLike(member.id, answerId)
      if (sendMutationError(res, result, 'duplicate_like')) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  router.delete(
    '/me/post-essay-answer-likes/:id',
    asyncRoute(async (req, res) => {
      const member = await requireMember(req, res)
      if (!member) return

      const likeId = parseNumericIdParam(req, res)
      if (likeId == null) return

      const result = await deleteMemberEssayAnswerLike(member.id, likeId)
      if (sendMutationError(res, result)) return
      res.json(result.kind === 'ok' ? result.data : undefined)
    })
  )

  return router
}
