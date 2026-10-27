import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createApp } from './app.js'
import { listMemberBrowsingHistories } from './queries/browsing-histories.js'
import {
  buildPublicPostWhere,
  buildPublicProjectWhere,
} from './utils/v1-helpers.js'

const {
  mockFindMember,
  mockUpsertHistory,
  mockFindPost,
  mockFindManyHistories,
  mockCountHistories,
  mockFindManyProjects,
} = vi.hoisted(() => ({
  mockFindMember: vi.fn(),
  mockUpsertHistory: vi.fn(),
  mockFindPost: vi.fn(),
  mockFindManyHistories: vi.fn(),
  mockCountHistories: vi.fn(),
  mockFindManyProjects: vi.fn(),
}))

vi.mock('@kids-reporter/db', () => ({
  Prisma: {
    PrismaClientKnownRequestError: class PrismaClientKnownRequestError extends Error {
      code: string
      constructor(message: string, { code }: { code: string }) {
        super(message)
        this.code = code
      }
    },
  },
  prisma: {
    member: {
      findUnique: (...args: unknown[]) => mockFindMember(...args),
    },
    post: {
      findFirst: (...args: unknown[]) => mockFindPost(...args),
    },
    project: {
      findFirst: vi.fn(),
      findMany: (...args: unknown[]) => mockFindManyProjects(...args),
    },
    browsingHistory: {
      upsert: (...args: unknown[]) => mockUpsertHistory(...args),
      findMany: (...args: unknown[]) => mockFindManyHistories(...args),
      count: (...args: unknown[]) => mockCountHistories(...args),
    },
  },
}))

describe('listMemberBrowsingHistories', () => {
  const now = new Date('2026-01-15T00:00:00.000Z')
  const where = {
    memberId: 'member-cuid-1',
    OR: [
      { type: 'post', post: buildPublicPostWhere(now) },
      { type: 'project', project: buildPublicProjectWhere() },
    ],
  }

  beforeEach(() => {
    mockFindManyHistories.mockReset()
    mockFindManyHistories.mockResolvedValue([])
    mockCountHistories.mockReset()
    mockCountHistories.mockResolvedValue(0)
    mockFindManyProjects.mockReset()
    mockFindManyProjects.mockResolvedValue([])
  })

  it('hides non-public targets and orders by visitedAt desc', async () => {
    const result = await listMemberBrowsingHistories(
      'member-cuid-1',
      { take: 12, skip: 0 },
      now
    )

    expect(mockFindManyHistories).toHaveBeenCalledWith(
      expect.objectContaining({
        where,
        orderBy: { visitedAt: 'desc' },
        take: 12,
        skip: 0,
      })
    )
    expect(mockCountHistories).toHaveBeenCalledWith({ where })
    expect(result).toEqual({ browsingHistories: [], browsingHistoriesCount: 0 })
  })
})

describe('POST /v1/members/me/browsing-histories', () => {
  const secret = process.env.GO_API_JWT_SECRET!
  const issuer = process.env.GO_API_JWT_ISSUER!
  const audience = process.env.GO_API_JWT_AUDIENCE!

  const accessJwt = () =>
    jwt.sign(
      {
        user_id: 'tw-user-history',
        email: 'history@vitest.example',
        iss: issuer,
        aud: audience,
      },
      secret,
      { algorithm: 'HS256' }
    )

  beforeEach(() => {
    mockFindMember.mockReset()
    mockUpsertHistory.mockReset()
    mockFindPost.mockReset()
  })

  it('returns 401 without Authorization', async () => {
    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/v1/members/me/browsing-histories')
      .send({ type: 'post', slug: 'hello' })

    expect(res.status).toBe(401)
    expect(mockUpsertHistory).not.toHaveBeenCalled()
  })

  it('creates a post visit for an authenticated member', async () => {
    mockFindMember.mockResolvedValue({
      id: 'member-cuid-1',
      role: 'member',
    })
    mockFindPost.mockResolvedValue({ id: 42, slug: 'hello-article' })
    mockUpsertHistory.mockResolvedValue({
      id: 7,
      visitedAt: new Date('2026-01-02T00:00:00.000Z'),
    })

    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/v1/members/me/browsing-histories')
      .set('Authorization', `Bearer ${accessJwt()}`)
      .send({ type: 'post', slug: 'hello-article' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: '7',
      type: 'post',
      slug: 'hello-article',
      visitedAt: '2026-01-02T00:00:00.000Z',
    })
    expect(mockUpsertHistory).toHaveBeenCalledWith({
      where: { compositeKey: 'post:42:member-cuid-1' },
      create: {
        type: 'post',
        postId: 42,
        memberId: 'member-cuid-1',
        compositeKey: 'post:42:member-cuid-1',
        visitedAt: expect.any(Date),
      },
      update: { visitedAt: expect.any(Date) },
      select: { id: true, visitedAt: true },
    })
  })

  it('updates visitedAt on a repeat visit instead of inserting another row', async () => {
    mockFindMember.mockResolvedValue({
      id: 'member-cuid-1',
      role: 'member',
    })
    mockFindPost.mockResolvedValue({ id: 42, slug: 'hello-article' })
    mockUpsertHistory
      .mockResolvedValueOnce({
        id: 7,
        visitedAt: new Date('2026-01-02T00:00:00.000Z'),
      })
      .mockResolvedValueOnce({
        id: 7,
        visitedAt: new Date('2026-01-03T00:00:00.000Z'),
      })

    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const first = await request(app)
      .post('/v1/members/me/browsing-histories')
      .set('Authorization', `Bearer ${accessJwt()}`)
      .send({ type: 'post', slug: 'hello-article' })
    const second = await request(app)
      .post('/v1/members/me/browsing-histories')
      .set('Authorization', `Bearer ${accessJwt()}`)
      .send({ type: 'post', slug: 'hello-article' })

    expect(first.status).toBe(200)
    expect(second.status).toBe(200)
    expect(second.body).toMatchObject({
      id: '7',
      visitedAt: '2026-01-03T00:00:00.000Z',
    })
    expect(mockUpsertHistory).toHaveBeenCalledTimes(2)
    expect(mockUpsertHistory.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        where: { compositeKey: 'post:42:member-cuid-1' },
        update: { visitedAt: expect.any(Date) },
      })
    )
  })
})
