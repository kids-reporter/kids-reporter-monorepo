import './express-augmentation.js'

import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import { sendJsonError } from '../utils/send-json-error.js'

export type GoApiJwtOptions = {
  secret: string
  issuer?: string
  audience?: string
  /**
   * Optional callback for logging/metrics. The kit does not dictate any logging
   * library; consumers can integrate with their own structured logger.
   */
  onReject?: (
    info: {
      reason: GoApiJwtAuthFailureReason
      path?: string
      method?: string
      jwtLibraryErrorName?: string
    },
    res: Response
  ) => void
}

/** Machine-readable reason for logs/metrics; responses stay a generic 401. */
export type GoApiJwtAuthFailureReason =
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

export type GoApiAccessTokenPayload = jwt.JwtPayload & {
  user_id: string | number
}

function classifyGoApiJwtVerificationError(
  err: unknown
): GoApiJwtAuthFailureReason {
  if (err instanceof jwt.TokenExpiredError) return 'jwt_expired'
  if (err instanceof jwt.NotBeforeError) return 'jwt_not_yet_active'
  if (err instanceof jwt.JsonWebTokenError) {
    const msg = err.message
    if (msg === 'invalid signature' || msg.includes('invalid signature')) {
      return 'jwt_invalid_signature'
    }
    if (msg.startsWith('jwt issuer invalid')) return 'jwt_invalid_issuer'
    if (msg.startsWith('jwt audience invalid')) return 'jwt_invalid_audience'
    return 'jwt_verification_failed'
  }
  if (err instanceof Error) {
    if (err.message === 'GO_API_JWT_SECRET is not configured') {
      return 'go_api_jwt_secret_not_configured'
    }
    if (err.message === 'Missing user_id claim') return 'jwt_missing_user_id'
    if (err.message === 'Missing token') return 'empty_bearer_token'
  }
  return 'jwt_verification_failed'
}

export function verifyGoApiAccessToken(
  token: string,
  opts: GoApiJwtOptions
): GoApiAccessTokenPayload {
  if (!opts?.secret) {
    throw new Error('GO_API_JWT_SECRET is not configured')
  }

  const trimmed = typeof token === 'string' ? token.trim() : ''
  if (!trimmed) {
    throw new Error('Missing token')
  }

  const decoded = jwt.verify(trimmed, opts.secret, {
    algorithms: ['HS256'],
    issuer: opts.issuer,
    audience: opts.audience,
    // Allow small clock skew without disabling `nbf` enforcement entirely.
    clockTolerance: 10,
  }) as jwt.JwtPayload

  if (decoded.user_id === undefined || decoded.user_id === null) {
    throw new Error('Missing user_id claim')
  }

  return decoded as GoApiAccessTokenPayload
}

export function verifyGoApiJwt(opts: GoApiJwtOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const reject = (
      reason: GoApiJwtAuthFailureReason,
      extra?: { jwtLibraryErrorName?: string }
    ) => {
      opts?.onReject?.(
        {
          reason,
          path: req.originalUrl,
          method: req.method,
          ...extra,
        },
        res
      )
      sendJsonError(res, 401, 'unauthorized', 'Unauthorized')
    }

    const auth = req.headers.authorization
    if (!auth?.startsWith('Bearer ')) {
      reject('missing_authorization_header')
      return
    }

    const token = auth.slice('Bearer '.length).trim()
    if (!token) {
      reject('empty_bearer_token')
      return
    }

    try {
      const decoded = verifyGoApiAccessToken(token, opts)
      req.goApiJwtUserId = `${decoded.user_id}`
      next()
    } catch (err) {
      const reason = classifyGoApiJwtVerificationError(err)
      const extra: { jwtLibraryErrorName?: string } = {}
      if (reason === 'jwt_verification_failed' && err instanceof Error) {
        extra.jwtLibraryErrorName = err.name
      }
      reject(reason, extra)
    }
  }
}
