import jwt from 'jsonwebtoken'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createApp } from './app.js'

const { mockUpsert } = vi.hoisted(() => ({
  mockUpsert: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@kids-reporter/db', () => ({
  prisma: {
    member: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}))

vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('POST /auth/access-token', () => {
  const secret = process.env.GO_API_JWT_SECRET!
  const issuer = process.env.GO_API_JWT_ISSUER!
  const audience = process.env.GO_API_JWT_AUDIENCE!

  beforeEach(async () => {
    mockUpsert.mockClear()
    const axios = (await import('axios')).default
    vi.mocked(axios.post).mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns access token and upserts member when upstream returns a valid JWT', async () => {
    const accessJwt = jwt.sign(
      {
        user_id: 'tw-user-42',
        email: 'member@vitest.example',
        iss: issuer,
        aud: audience,
      },
      secret,
      { algorithm: 'HS256' }
    )

    const axios = (await import('axios')).default
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { jwt: accessJwt } },
      status: 200,
    })

    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/auth/access-token')
      .set('Cookie', 'id_token=fake-id-token')
      .set('Origin', 'https://kids.twreporter.org')

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      accessToken: accessJwt,
      twreporterUserId: 'tw-user-42',
      expiresAt: expect.any(Number),
    })
    expect(mockUpsert).toHaveBeenCalledWith({
      where: { twreporter_user_id: 'tw-user-42' },
      create: {
        twreporter_user_id: 'tw-user-42',
        email: 'member@vitest.example',
      },
      update: {},
    })
  })

  it('forwards X-Cloud-Trace-Context to upstream token axios call', async () => {
    const traceHeader = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa;o=1'
    const accessJwt = jwt.sign(
      {
        user_id: 'tw-user-trace',
        email: 'trace@vitest.example',
        iss: issuer,
        aud: audience,
      },
      secret,
      { algorithm: 'HS256' }
    )

    const axios = (await import('axios')).default
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { jwt: accessJwt } },
      status: 200,
    })

    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/auth/access-token')
      .set('Cookie', 'id_token=fake-id-token')
      .set('Origin', 'https://kids.twreporter.org')
      .set('X-Cloud-Trace-Context', traceHeader)

    expect(res.status).toBe(200)
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      undefined,
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Cloud-Trace-Context': traceHeader,
        }),
      })
    )
  })

  it('responds 401 when upstream JWT fails verification', async () => {
    const badJwt = jwt.sign(
      { user_id: 'x', iss: issuer, aud: audience },
      'wrong-secret',
      { algorithm: 'HS256' }
    )

    const axios = (await import('axios')).default
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { jwt: badJwt } },
      status: 200,
    })

    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/auth/access-token')
      .set('Cookie', 'id_token=fake')
      .set('Origin', 'https://kids.twreporter.org')

    expect(res.status).toBe(401)
    expect(res.body?.error?.code).toBe('unauthorized')
    expect(mockUpsert).not.toHaveBeenCalled()
  })

  it('returns 500 when CORS_ALLOW_ORIGINS is * (disallowed for credentialed /auth/*)', async () => {
    const accessJwt = jwt.sign(
      {
        user_id: 'tw-user-99',
        email: 'x@y.z',
        iss: issuer,
        aud: audience,
      },
      secret,
      { algorithm: 'HS256' }
    )

    const axiosMod = await import('axios')
    vi.mocked(axiosMod.default.post).mockResolvedValue({
      data: { data: { jwt: accessJwt } },
      status: 200,
    })

    vi.resetModules()
    vi.stubEnv('CORS_ALLOW_ORIGINS', '*')
    const { createApp: createAppFresh } = await import('./app.js')
    const app = createAppFresh({ corsAllowOrigin: '*' })
    const res = await request(app)
      .post('/auth/access-token')
      .set('Cookie', 'id_token=fake-id-token')
      .set('Origin', 'https://kids.twreporter.org')

    expect(res.status).toBe(500)
    expect(res.body?.error?.code).toBe('internal_server_error')
  })

  it('accepts aud as array when it contains configured audience', async () => {
    const accessJwt = jwt.sign(
      {
        user_id: 'tw-user-100',
        email: 'arr@aud.example',
        iss: issuer,
        aud: [audience, 'extra-aud'],
      },
      secret,
      { algorithm: 'HS256' }
    )

    const axios = (await import('axios')).default
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { jwt: accessJwt } },
      status: 200,
    })

    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/auth/access-token')
      .set('Cookie', 'id_token=fake-id-token')
      .set('Origin', 'https://kids.twreporter.org')

    expect(res.status).toBe(200)
    expect(res.body?.twreporterUserId).toBe('tw-user-100')
  })

  it('rejects JWT with not-before in the future', async () => {
    const nowSeconds = Math.floor(Date.now() / 1000)
    const accessJwt = jwt.sign(
      {
        user_id: 'tw-user-101',
        iss: issuer,
        aud: audience,
        nbf: nowSeconds + 60,
      },
      secret,
      { algorithm: 'HS256' }
    )

    const axios = (await import('axios')).default
    vi.mocked(axios.post).mockResolvedValue({
      data: { data: { jwt: accessJwt } },
      status: 200,
    })

    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/auth/access-token')
      .set('Cookie', 'id_token=fake-id-token')
      .set('Origin', 'https://kids.twreporter.org')

    expect(res.status).toBe(401)
    expect(res.body?.error?.code).toBe('unauthorized')
  })

  it('OPTIONS /auth/access-token returns 204', async () => {
    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .options('/auth/access-token')
      .set('Origin', 'https://kids.twreporter.org')
      .set('Access-Control-Request-Method', 'POST')

    expect(res.status).toBe(204)
  })

  it('OPTIONS /auth/access-token returns credentialed CORS when OpenAPI is enabled at root', async () => {
    const origin = 'http://localhost:3001'
    const app = createApp({
      corsAllowOrigin: [origin],
      enableOpenApi: true,
    })
    const res = await request(app)
      .options('/auth/access-token')
      .set('Origin', origin)
      .set('Access-Control-Request-Method', 'POST')

    expect(res.status).toBe(204)
    expect(res.headers['access-control-allow-credentials']).toBe('true')
    expect(res.headers['access-control-allow-origin']).toBe(origin)
  })
})
