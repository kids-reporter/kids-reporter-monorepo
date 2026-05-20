import jwt from 'jsonwebtoken'
import { describe, expect, it, vi } from 'vitest'

import { verifyGoApiJwt } from './verify-go-api-jwt.js'

const emitStructuredMock = vi.hoisted(() => vi.fn())

vi.mock('@kids-reporter/logger', () => ({
  emitStructured: emitStructuredMock,
}))

describe('verifyGoApiJwt', () => {
  it('returns 401 when Authorization header is missing', () => {
    emitStructuredMock.mockClear()
    const req = { headers: {}, method: 'GET', originalUrl: '/x' } as any
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      locals: {},
    } as any
    const next = vi.fn()

    verifyGoApiJwt(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
    expect(emitStructuredMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goApiJwtAuthFailureReason: 'missing_authorization_header',
        severity: 'WARNING',
      })
    )
  })

  it('returns 401 when Bearer token is empty', () => {
    emitStructuredMock.mockClear()
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

    verifyGoApiJwt(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
    expect(emitStructuredMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goApiJwtAuthFailureReason: 'empty_bearer_token',
      })
    )
  })

  it('returns 401 and logs jwt_expired when token is expired', async () => {
    emitStructuredMock.mockClear()
    const mod = await import('../go-api-jwt.js')
    vi.spyOn(mod, 'verifyGoApiAccessToken').mockImplementation(() => {
      throw new jwt.TokenExpiredError('jwt expired', new Date())
    })

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

    verifyGoApiJwt(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
    expect(emitStructuredMock).toHaveBeenCalledWith(
      expect.objectContaining({ goApiJwtAuthFailureReason: 'jwt_expired' })
    )
  })

  it('returns 401 and logs jwt_invalid_signature', async () => {
    emitStructuredMock.mockClear()
    const mod = await import('../go-api-jwt.js')
    vi.spyOn(mod, 'verifyGoApiAccessToken').mockImplementation(() => {
      throw new jwt.JsonWebTokenError('invalid signature')
    })

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

    verifyGoApiJwt(req, res, next)

    expect(emitStructuredMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goApiJwtAuthFailureReason: 'jwt_invalid_signature',
      })
    )
  })

  it('returns 401 and logs jwt_invalid_issuer', async () => {
    emitStructuredMock.mockClear()
    const mod = await import('../go-api-jwt.js')
    vi.spyOn(mod, 'verifyGoApiAccessToken').mockImplementation(() => {
      throw new jwt.JsonWebTokenError(
        'jwt issuer invalid. expected: https://issuer'
      )
    })

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

    verifyGoApiJwt(req, res, next)

    expect(emitStructuredMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goApiJwtAuthFailureReason: 'jwt_invalid_issuer',
      })
    )
  })

  it('returns 401 and logs jwt_invalid_audience', async () => {
    emitStructuredMock.mockClear()
    const mod = await import('../go-api-jwt.js')
    vi.spyOn(mod, 'verifyGoApiAccessToken').mockImplementation(() => {
      throw new jwt.JsonWebTokenError('jwt audience invalid. expected: my-aud')
    })

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

    verifyGoApiJwt(req, res, next)

    expect(emitStructuredMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goApiJwtAuthFailureReason: 'jwt_invalid_audience',
      })
    )
  })

  it('returns 401 and logs jwt_not_yet_active for nbf errors', async () => {
    emitStructuredMock.mockClear()
    const mod = await import('../go-api-jwt.js')
    vi.spyOn(mod, 'verifyGoApiAccessToken').mockImplementation(() => {
      throw new jwt.NotBeforeError('jwt not active', new Date())
    })

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

    verifyGoApiJwt(req, res, next)

    expect(emitStructuredMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goApiJwtAuthFailureReason: 'jwt_not_yet_active',
      })
    )
  })

  it('returns 401 when token verification throws unknown Error', async () => {
    emitStructuredMock.mockClear()
    const mod = await import('../go-api-jwt.js')
    vi.spyOn(mod, 'verifyGoApiAccessToken').mockImplementation(() => {
      throw new Error('bad token')
    })

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

    verifyGoApiJwt(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
    expect(emitStructuredMock).toHaveBeenCalledWith(
      expect.objectContaining({
        goApiJwtAuthFailureReason: 'jwt_verification_failed',
        jwtLibraryErrorName: 'Error',
      })
    )
  })

  it('sets req.goApiJwtUserId and calls next on success', async () => {
    emitStructuredMock.mockClear()
    const mod = await import('../go-api-jwt.js')
    vi.spyOn(mod, 'verifyGoApiAccessToken').mockReturnValue({
      user_id: 'u1',
    } as any)

    const req = { headers: { authorization: 'Bearer t' } } as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as any
    const next = vi.fn()

    verifyGoApiJwt(req, res, next)

    expect(req.goApiJwtUserId).toBe('u1')
    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
    expect(emitStructuredMock).not.toHaveBeenCalled()
  })
})
