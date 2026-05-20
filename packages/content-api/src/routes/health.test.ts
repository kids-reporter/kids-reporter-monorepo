import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'

import { createApp } from '../app.js'

const { mockQueryRaw } = vi.hoisted(() => ({
  mockQueryRaw: vi.fn(),
}))

vi.mock('@kids-reporter/db', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => mockQueryRaw(...args),
  },
}))

describe('health routes', () => {
  it('GET /health returns 200 with timestamp when DB ok', async () => {
    mockQueryRaw.mockResolvedValueOnce(1)
    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(typeof res.body?.timestamp).toBe('string')
  })

  it('GET /health returns 503 with timestamp in details when DB fails', async () => {
    mockQueryRaw.mockRejectedValueOnce(new Error('db down'))
    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app).get('/health')
    expect(res.status).toBe(503)
    expect(res.body?.error?.code).toBe('service_unavailable')
    expect(typeof res.body?.error?.details?.timestamp).toBe('string')
  })
})
