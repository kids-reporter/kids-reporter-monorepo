import jwt from 'jsonwebtoken'

import envVar from './environment-variables.js'

export type GoApiAccessTokenPayload = jwt.JwtPayload & {
  user_id: string | number
}

/**
 * HS256 Bearer access token from Go API; same verification as CMS `getSessionFromGoApiJwt`.
 * @throws jwt.JsonWebTokenError or Error for invalid issuer, audience, or missing identity
 */
export function verifyGoApiAccessToken(token: string): GoApiAccessTokenPayload {
  if (!envVar.goApiJwt.secret) {
    throw new Error('GO_API_JWT_SECRET is not configured')
  }

  const trimmed = typeof token === 'string' ? token.trim() : ''
  if (!trimmed) {
    throw new Error('Missing token')
  }

  const decoded = jwt.verify(trimmed, envVar.goApiJwt.secret, {
    algorithms: ['HS256'],
    issuer: envVar.goApiJwt.issuer,
    audience: envVar.goApiJwt.audience,
    // Allow small clock skew without disabling `nbf` enforcement entirely.
    clockTolerance: 10,
  }) as jwt.JwtPayload

  if (decoded.user_id === undefined || decoded.user_id === null) {
    throw new Error('Missing user_id claim')
  }

  return decoded as GoApiAccessTokenPayload
}
