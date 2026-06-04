import {
  essayAnswerIdsFromCommaSeparatedParam,
  essayAnswerIdsQueryToString,
  V1EssayAnswersHasLikedQuerySchema,
  V1MemberPostsWithAnswersQuerySchema,
  V1MemberProfilePatchBodySchema,
} from '@kids-reporter/api-types'
import { asyncRoute, sendJsonError } from '@kids-reporter/content-api-kit'
import { verifyGoApiJwt } from '@kids-reporter/content-api-kit/auth/go-api-jwt'
import { emitStructured } from '@kids-reporter/logger'
import express from 'express'
import multer from 'multer'
import { z } from 'zod'

import consts from '../../constants.js'
import envVar from '../../environment-variables.js'
import {
  fetchMemberEssayAnswerLikes,
  fetchMemberPostsWithAnswers,
} from '../../queries/member-activity.js'
import {
  findMemberForAvatarUpload,
  findMemberIdRole,
  findMemberProfile,
  MEMBER_AVATAR_MIMES,
  removeMemberAvatar,
  replaceMemberAvatar,
  updateMemberProfile,
} from '../../queries/members.js'

const statusCodes = consts.statusCodes

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
})

/** Resolve the JWT user id or send 401. */
const requireUserId = (
  req: express.Request,
  res: express.Response
): string | null => {
  const userId = req.goApiJwtUserId
  if (!userId) {
    sendJsonError(res, statusCodes.unauthorized, 'unauthorized', 'Unauthorized')
    return null
  }
  return userId
}

export function createV1MembersRouter() {
  const router = express.Router()
  router.use(
    verifyGoApiJwt({
      secret: envVar.goApiJwt.secret,
      issuer: envVar.goApiJwt.issuer,
      audience: envVar.goApiJwt.audience,
      onReject: (info, res) => {
        emitStructured({
          severity: 'WARNING',
          message: 'Go API JWT request rejected',
          goApiJwtAuthFailureReason: info.reason,
          path: info.path,
          method: info.method,
          jwtLibraryErrorName: info.jwtLibraryErrorName,
          ...res.locals?.globalLogFields,
        })
      },
    })
  )

  router.get(
    '/me',
    asyncRoute(async (req, res) => {
      const userId = requireUserId(req, res)
      if (!userId) return

      const member = await findMemberProfile(userId)
      if (!member) {
        sendJsonError(res, 404, 'not_found', 'Not found')
        return
      }
      res.json(member)
    })
  )

  router.patch(
    '/me',
    asyncRoute(async (req, res) => {
      const userId = requireUserId(req, res)
      if (!userId) return

      const parsedBody = V1MemberProfilePatchBodySchema.safeParse(
        req.body ?? {}
      )
      if (!parsedBody.success) {
        throw new z.ZodError(parsedBody.error.issues)
      }

      if (Object.keys(parsedBody.data).length === 0) {
        sendJsonError(
          res,
          statusCodes.badRequest,
          'invalid_request',
          'Empty body'
        )
        return
      }

      const updated = await updateMemberProfile(userId, parsedBody.data)
      if (!updated) {
        sendJsonError(res, 404, 'not_found', 'Not found')
        return
      }
      res.json(updated)
    })
  )

  router.get(
    '/me/posts-with-answers',
    asyncRoute(async (req, res) => {
      const userId = requireUserId(req, res)
      if (!userId) return
      const member = await findMemberIdRole(userId)
      if (!member) {
        sendJsonError(res, 404, 'not_found', 'Not found')
        return
      }
      if (member.role !== 'member' && member.role !== 'admin') {
        sendJsonError(res, 403, 'forbidden', 'Forbidden')
        return
      }

      const parsedQ = V1MemberPostsWithAnswersQuerySchema.parse(req.query)
      const result = await fetchMemberPostsWithAnswers(member.id, {
        take: parsedQ.take,
        cursor: parsedQ.cursor,
      })
      res.json(result)
    })
  )

  router.get(
    '/me/essay-answers/has-liked',
    asyncRoute(async (req, res) => {
      const userId = requireUserId(req, res)
      if (!userId) return
      const member = await findMemberIdRole(userId)
      if (!member) {
        sendJsonError(res, 404, 'not_found', 'Not found')
        return
      }
      if (member.role !== 'member' && member.role !== 'admin') {
        sendJsonError(res, 403, 'forbidden', 'Forbidden')
        return
      }

      const queryStr = essayAnswerIdsQueryToString(
        req.query.essayAnswerIds as string | string[] | undefined
      )
      const parsedQ = V1EssayAnswersHasLikedQuerySchema.safeParse({
        essayAnswerIds: queryStr,
      })
      if (!parsedQ.success) {
        sendJsonError(
          res,
          statusCodes.badRequest,
          'invalid_request',
          'Invalid request'
        )
        return
      }

      const essayAnswerIds = essayAnswerIdsFromCommaSeparatedParam(
        parsedQ.data.essayAnswerIds
      )
      const result = await fetchMemberEssayAnswerLikes(
        member.id,
        essayAnswerIds
      )
      res.json(result)
    })
  )

  router.post(
    '/me/avatar',
    upload.single('file'),
    asyncRoute(async (req, res) => {
      const userId = requireUserId(req, res)
      if (!userId) return

      if (!envVar.images.storagePath) {
        sendJsonError(
          res,
          statusCodes.internalServerError,
          'internal_server_error',
          'Images storage is not configured',
          { reason: 'images_storage_not_configured' }
        )
        return
      }

      const file = req.file
      if (!file?.buffer || !file.mimetype) {
        sendJsonError(
          res,
          statusCodes.badRequest,
          'invalid_request',
          'Missing file',
          { reason: 'missing_file' }
        )
        return
      }

      if (!MEMBER_AVATAR_MIMES.has(file.mimetype)) {
        sendJsonError(
          res,
          statusCodes.badRequest,
          'invalid_request',
          'Invalid file type',
          { reason: 'invalid_file_type' }
        )
        return
      }

      const found = await findMemberForAvatarUpload(userId)
      if (found.kind === 'not_found') {
        sendJsonError(res, 404, 'not_found', 'Not found')
        return
      }
      if (found.kind === 'forbidden') {
        sendJsonError(res, 403, 'forbidden', 'Forbidden')
        return
      }

      const uploadName =
        typeof req.body?.name === 'string' && req.body.name
          ? req.body.name
          : 'memberAvatar'

      const created = await replaceMemberAvatar({
        memberId: found.member.id,
        prevAvatarId: found.member.avatarId,
        fileBuffer: file.buffer,
        fileSize: file.size,
        mime: file.mimetype,
        uploadName,
      })

      res.json(created)
    })
  )

  router.delete(
    '/me/avatar',
    asyncRoute(async (req, res) => {
      const userId = requireUserId(req, res)
      if (!userId) return

      const result = await removeMemberAvatar(userId)
      if (result.kind === 'not_found') {
        sendJsonError(res, 404, 'not_found', 'Not found')
        return
      }
      res.json(result.data)
    })
  )

  return router
}
