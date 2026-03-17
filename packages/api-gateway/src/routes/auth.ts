import { emitStructured } from '@kids-reporter/logger'
// @ts-ignore `@twreporter/errors` does not have typescript definition file yet
import _errors from '@twreporter/errors'
import axios from 'axios'
import express from 'express'

import consts from '../constants.js'
import envVar from '../environment-variables.js'

// @twreporter/errors is a CommonJS module, so we must access its `default` property
const errors = _errors.default

const statusCodes = consts.statusCodes

const apiOrigin = envVar.apis.goApi.origin
const upstreamTokenEndpoint = `${apiOrigin}/v2/auth/token`

function decodeJwtPayload(jwtToken: string): {
  user_id?: string
  exp?: number
} {
  const segments = jwtToken.split('.')
  if (segments.length < 2) {
    throw new Error('Invalid JWT: payload segment is missing')
  }

  const payload = segments[1]
  let decodedString

  try {
    const buffer = Buffer.from(payload, 'base64')
    decodedString = buffer.toString('utf8')
  } catch (_err) {
    throw errors.helpers.wrap(
      _err,
      'DecodeJwtPayloadError',
      'Invalid JWT: failed to decode base64 payload',
      {
        decodedString: decodedString,
      }
    )
  }

  try {
    return JSON.parse(decodedString)
  } catch (_err) {
    throw errors.helpers.wrap(
      _err,
      'DecodeJwtPayloadError',
      'Invalid JWT: failed to parse payload as JSON',
      {
        decodedString: decodedString,
      }
    )
  }
}

const ensureIdTokenCookie: express.RequestHandler = (req, res, next) => {
  const idToken = req.cookies?.['id_token']
  if (!idToken) {
    emitStructured({
      severity: 'INFO',
      message: 'Skip handling /auth/access-token, id_token cookie is missing',
      ...res?.locals?.globalLogFields,
    })
    res.status(statusCodes.badRequest).send({
      status: 'fail',
      data: {
        reason: 'id_token cookie is required',
      },
    })
    return
  }

  next()
}

/**
 * Creates and returns an Express router for authentication routes.
 *
 * This router exposes the `/auth/access-token` endpoint,
 * which exchanges the go-api-issued `id_token` cookie for an
 * access token by calling the go-api (`/v2/auth/token`).
 */
export function createAuthRouter() {
  const router = express.Router()

  // Enable preflight requests (CORS OPTIONS)
  router.options('/auth/access-token')

  router.post('/auth/access-token', ensureIdTokenCookie, async (req, res) => {
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
            cookie: `id_token=${idToken}`,
            'content-type': 'application/json',
          },
          timeout: 10000, // 10 seconds
        }
      )

      const accessToken = upstreamResponse.data?.data?.jwt
      const decodedPayload = decodeJwtPayload(accessToken)
      const twreporterUserId = decodedPayload?.user_id?.toString()
      const expiresAt =
        typeof decodedPayload?.exp === 'number'
          ? decodedPayload?.exp
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
        status: 'success',
        data: {
          accessToken,
          twreporterUserId,
          expiresAt,
        },
      })
    } catch (_err) {
      let err = _err instanceof Error ? _err : new Error(String(_err))

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
          res.status(statusCodes.unauthorized).send({
            status: 'fail',
            data: {
              reason: 'Invalid id_token cookie.',
            },
          })
          return
        }
      }

      emitStructured({
        severity: 'ERROR',
        message:
          'Error to issue access token.' +
          errors.helpers.printAll(
            err,
            {
              withStack: true,
              withPayload: true,
            },
            0,
            0
          ),
        ...res?.locals?.globalLogFields,
      })

      res.status(statusCodes.internalServerError).send({
        status: 'error',
        error: err.message,
      })
      return
    }
  })

  return router
}
