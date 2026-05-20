import { emitStructured } from '@kids-reporter/logger'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import consts from '../constants.js'
import { verifyGoApiAccessToken } from '../go-api-jwt.js'
import { sendJsonError } from '../utils/send-json-error.js'

const statusCodes = consts.statusCodes

/** Machine-readable reason for logs/metrics; responses stay a generic 401. */
type GoApiJwtAuthFailureReason =
  | 'missing_authorization_header'
  | 'empty_bearer_token'
  | 'jwt_expired'
  | 'jwt_not_yet_active'
  | 'jwt_invalid_signature'
  | 'jwt_invalid_issuer'
  | 'jwt_invalid_audience'
  | 'jwt_missing_user_id'
  | 'go_api_jwt_secret_not_configured'
  | 'jwt_verification_failed'

function logGoApiJwtAuthFailure(
  res: Response,
  reason: GoApiJwtAuthFailureReason,
  extra?: Record<string, unknown>
) {
  emitStructured({
    severity: 'WARNING',
    message: 'Go API JWT request rejected',
    goApiJwtAuthFailureReason: reason,
    ...extra,
    ...(res.locals?.globalLogFields ?? {}),
  })
}

function classifyGoApiJwtVerificationError(
  err: unknown
): GoApiJwtAuthFailureReason {
  if (err instanceof jwt.TokenExpiredError) {
    return 'jwt_expired'
  }
  if (err instanceof jwt.NotBeforeError) {
    return 'jwt_not_yet_active'
  }
  if (err instanceof jwt.JsonWebTokenError) {
    const msg = err.message
    if (msg === 'invalid signature' || msg.includes('invalid signature')) {
      return 'jwt_invalid_signature'
    }
    if (msg.startsWith('jwt issuer invalid')) {
      return 'jwt_invalid_issuer'
    }
    if (msg.startsWith('jwt audience invalid')) {
      return 'jwt_invalid_audience'
    }
    return 'jwt_verification_failed'
  }
  if (err instanceof Error) {
    if (err.message === 'GO_API_JWT_SECRET is not configured') {
      return 'go_api_jwt_secret_not_configured'
    }
    if (err.message === 'Missing user_id claim') {
      return 'jwt_missing_user_id'
    }
    if (err.message === 'Missing token') {
      return 'empty_bearer_token'
    }
  }
  return 'jwt_verification_failed'
}

export function verifyGoApiJwt(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    logGoApiJwtAuthFailure(res, 'missing_authorization_header', {
      path: req.originalUrl,
      method: req.method,
    })
    sendJsonError(res, statusCodes.unauthorized, 'unauthorized', 'Unauthorized')
    return
  }

  const token = auth.slice('Bearer '.length).trim()
  if (!token) {
    logGoApiJwtAuthFailure(res, 'empty_bearer_token', {
      path: req.originalUrl,
      method: req.method,
    })
    sendJsonError(res, statusCodes.unauthorized, 'unauthorized', 'Unauthorized')
    return
  }

  try {
    const decoded = verifyGoApiAccessToken(token)
    req.goApiJwtUserId = `${decoded.user_id}`
    next()
  } catch (err) {
    const reason = classifyGoApiJwtVerificationError(err)
    const extra: Record<string, unknown> = {
      path: req.originalUrl,
      method: req.method,
    }
    if (reason === 'jwt_verification_failed' && err instanceof Error) {
      extra.jwtLibraryErrorName = err.name
    }
    logGoApiJwtAuthFailure(res, reason, extra)
    sendJsonError(res, statusCodes.unauthorized, 'unauthorized', 'Unauthorized')
  }
}
