import { prisma } from '@kids-reporter/db'
import { emitStructured } from '@kids-reporter/logger'
import axios from 'axios'
import express from 'express'

import consts from '../constants.js'
import envVar from '../environment-variables.js'
import {
  type GoApiAccessTokenPayload,
  verifyGoApiAccessToken,
} from '../go-api-jwt.js'
import { sendJsonError } from '../utils/send-json-error.js'

const statusCodes = consts.statusCodes

const apiOrigin = envVar.apis.goApi.origin
const upstreamTokenEndpoint = `${apiOrigin}/v2/auth/token`

const ensureIdTokenCookie: express.RequestHandler = (req, res, next) => {
  const idToken = req.cookies?.['id_token']
  if (!idToken) {
    emitStructured({
      severity: 'INFO',
      message: 'Skip handling /auth/access-token, id_token cookie is missing',
      ...res?.locals?.globalLogFields,
    })
    sendJsonError(
      res,
      statusCodes.badRequest,
      'invalid_request',
      'id_token cookie is required'
    )
    return
  }

  next()
}

function createEnsureSameOrigin({
  corsAllowOrigin,
}: {
  corsAllowOrigin: string[] | string
}): express.RequestHandler {
  return (req, res, next) => {
    const origin = req.get('Origin') || ''
    const referer = req.get('Referer') || ''

    // Credentialed /auth/* must never be configured as "any origin".
    if (corsAllowOrigin === '*') {
      sendJsonError(
        res,
        500,
        'internal_server_error',
        'CORS_ALLOW_ORIGINS cannot be * for /auth/*'
      )
      return
    }

    // For credentialed cookie-based routes, require browser-supplied origin signals.
    const source = origin || referer
    if (!source) {
      sendJsonError(res, 403, 'forbidden', 'Origin is required')
      return
    }

    const parsedSourceOrigin = (() => {
      try {
        if (origin) return new URL(origin).origin
        return new URL(referer).origin
      } catch {
        return ''
      }
    })()

    if (!parsedSourceOrigin) {
      sendJsonError(res, 403, 'forbidden', 'Origin is invalid')
      return
    }

    const allowlist = Array.isArray(corsAllowOrigin)
      ? corsAllowOrigin
      : [corsAllowOrigin]

    const allowed = allowlist.includes(parsedSourceOrigin)

    if (!allowed) {
      sendJsonError(res, 403, 'forbidden', 'Origin is not allowed')
      return
    }

    next()
  }
}

function emailFromJwtPayload(decoded: GoApiAccessTokenPayload): string {
  return typeof decoded.email === 'string' ? decoded.email : ''
}

export function createAuthRouter({
  corsAllowOrigin,
}: {
  corsAllowOrigin: string[] | string
}) {
  const router = express.Router()
  const ensureSameOrigin = createEnsureSameOrigin({ corsAllowOrigin })

  router.options('/access-token', (_req, res) => {
    res.sendStatus(204)
  })

  router.post(
    '/access-token',
    ensureSameOrigin,
    ensureIdTokenCookie,
    async (req, res) => {
      const idToken = req.cookies?.['id_token']
      const requestStartTime = Date.now()

      emitStructured({
        severity: 'DEBUG',
        message: 'Calling upstream token endpoint.',
        context: {
          upstreamTokenEndpoint,
        },
        ...res?.locals?.globalLogFields,
      })

      try {
        const upstreamResponse = await axios.post(
          upstreamTokenEndpoint,
          undefined,
          {
            headers: {
              ...res.locals.traceContext?.traceHeaders,
              cookie: `id_token=${encodeURIComponent(String(idToken))}`,
              'content-type': 'application/json',
            },
            timeout: envVar.apis.requestTimeoutMs,
          }
        )

        const accessToken = upstreamResponse.data?.data?.jwt
        if (typeof accessToken !== 'string' || !accessToken) {
          throw new Error('Upstream token is missing')
        }

        let decoded: GoApiAccessTokenPayload
        try {
          decoded = verifyGoApiAccessToken(accessToken)
        } catch {
          emitStructured({
            severity: 'INFO',
            message: 'Upstream returned JWT that failed verification.',
            ...res?.locals?.globalLogFields,
          })
          sendJsonError(
            res,
            statusCodes.unauthorized,
            'unauthorized',
            'Invalid access token'
          )
          return
        }

        const twreporterUserId = `${decoded.user_id}`
        const email = emailFromJwtPayload(decoded)

        try {
          await prisma.member.upsert({
            where: { twreporter_user_id: twreporterUserId },
            create: {
              twreporter_user_id: twreporterUserId,
              email,
            },
            update: {},
          })
        } catch (dbErr) {
          const message =
            dbErr instanceof Error
              ? (dbErr.stack ?? dbErr.message)
              : String(dbErr)
          emitStructured({
            severity: 'ERROR',
            message: 'Failed to upsert member for access token.',
            error: message,
            ...res?.locals?.globalLogFields,
          })
          sendJsonError(
            res,
            statusCodes.internalServerError,
            'internal_server_error',
            'Internal server error'
          )
          return
        }

        const expiresAt =
          typeof decoded.exp === 'number'
            ? decoded.exp
            : Math.round(Date.now() / 1000) + 3600
        const ttlSeconds = expiresAt - Math.round(Date.now() / 1000)
        const durationMs = Date.now() - requestStartTime

        emitStructured({
          severity: 'INFO',
          message: 'Issued access token.',
          context: {
            statusCode: statusCodes.ok,
            upstreamStatus: upstreamResponse.status,
            durationMs,
            twreporterUserId,
            expiresAt,
            ttlSeconds,
          },
          ...res?.locals?.globalLogFields,
        })
        res.status(statusCodes.ok).json({
          accessToken,
          twreporterUserId,
          expiresAt,
        })
      } catch (_err) {
        const err = _err instanceof Error ? _err : new Error(String(_err))

        if (axios.isAxiosError(err)) {
          const statusCode = err.response?.status || err.status
          if (
            statusCode === statusCodes.badRequest ||
            statusCode === statusCodes.unauthorized
          ) {
            emitStructured({
              severity: 'INFO',
              message: 'Invalid id_token cookie.',
              ...res?.locals?.globalLogFields,
            })
            sendJsonError(
              res,
              statusCodes.unauthorized,
              'unauthorized',
              'Invalid id_token cookie'
            )
            return
          }
        }

        emitStructured({
          severity: 'ERROR',
          message: 'Error to issue access token.',
          context: {
            errorMessage: err.message,
            upstreamTokenEndpoint,
          },
          ...res?.locals?.globalLogFields,
        })

        sendJsonError(
          res,
          statusCodes.internalServerError,
          'internal_server_error',
          'Internal server error'
        )
      }
    }
  )

  return router
}
