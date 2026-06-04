import jwt from 'jsonwebtoken'
import { describe, expect, it, vi } from 'vitest'

import { verifyGoApiJwt } from './go-api-jwt.js'

describe('verifyGoApiJwt', () => {
  it('returns 401 when Authorization header is missing', () => {
    const req = { headers: {}, method: 'GET', originalUrl: '/x' } as any
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: {},
    } as any
    const next = vi.fn()

    const onReject = vi.fn()
    verifyGoApiJwt({ secret: 's', onReject })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'missing_authorization_header' }),
      res
    )
  })

  it('returns 401 when Bearer token is empty', () => {
    const req = {
      headers: { authorization: 'Bearer   ' },
      method: 'GET',
      originalUrl: '/x',
    } as any
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: {},
    } as any
    const next = vi.fn()

    const onReject = vi.fn()
    verifyGoApiJwt({ secret: 's', onReject })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'empty_bearer_token' }),
      res
    )
  })

  it('returns 401 and calls onReject when token verification fails', () => {
    const req = {
      headers: { authorization: 'Bearer t' },
      method: 'GET',
      originalUrl: '/x',
    } as any
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: {},
    } as any
    const next = vi.fn()

    const onReject = vi.fn()
    verifyGoApiJwt({ secret: 's', onReject })(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
    expect(onReject).toHaveBeenCalled()
  })

  it('sets req.goApiJwtUserId and calls next on success', () => {
    const token = jwt.sign({ user_id: 'u1' }, 's', {
      algorithm: 'HS256',
      expiresIn: '1h',
    })

    const req = { headers: { authorization: `Bearer ${token}` } } as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any
    const next = vi.fn()

    verifyGoApiJwt({ secret: 's' })(req, res, next)

    expect(req.goApiJwtUserId).toBe('u1')
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
