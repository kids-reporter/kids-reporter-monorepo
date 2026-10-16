import jwt from 'jsonwebtoken'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createApp } from './app.js'
import { listMemberBookmarks } from './queries/bookmarks.js'
import {
  buildPublicPostWhere,
  buildPublicProjectWhere,
} from './utils/v1-helpers.js'

const {
  mockFindMember,
  mockCreateBookmark,
  mockFindPost,
  mockFindManyBookmarks,
  mockCountBookmarks,
  mockFindManyProjects,
} = vi.hoisted(() => ({
  mockFindMember: vi.fn(),
  mockCreateBookmark: vi.fn(),
  mockFindPost: vi.fn(),
  mockFindManyBookmarks: vi.fn(),
  mockCountBookmarks: vi.fn(),
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
    bookmark: {
      create: (...args: unknown[]) => mockCreateBookmark(...args),
      findMany: (...args: unknown[]) => mockFindManyBookmarks(...args),
      count: (...args: unknown[]) => mockCountBookmarks(...args),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

describe('listMemberBookmarks', () => {
  const now = new Date('2026-01-15T00:00:00.000Z')
  const where = {
    memberId: 'member-cuid-1',
    OR: [
      { type: 'post', post: buildPublicPostWhere(now) },
      { type: 'project', project: buildPublicProjectWhere() },
    ],
  }

  beforeEach(() => {
    mockFindManyBookmarks.mockReset()
    mockFindManyBookmarks.mockResolvedValue([])
    mockCountBookmarks.mockReset()
    mockCountBookmarks.mockResolvedValue(0)
    mockFindManyProjects.mockReset()
    mockFindManyProjects.mockResolvedValue([])
  })

  it('applies public visibility in findMany before take/skip', async () => {
    const result = await listMemberBookmarks(
      'member-cuid-1',
      { take: 12, skip: 0 },
      now
    )

    expect(mockFindManyBookmarks).toHaveBeenCalledWith(
      expect.objectContaining({
        where,
        take: 12,
        skip: 0,
      })
    )
    expect(mockCountBookmarks).toHaveBeenCalledWith({ where })
    expect(mockFindManyProjects).not.toHaveBeenCalled()
    expect(result).toEqual({ bookmarks: [], bookmarksCount: 0 })
  })

  it('returns og fields and one batched related-post count', async () => {
    mockCountBookmarks.mockResolvedValue(2)
    mockFindManyBookmarks.mockResolvedValue([
      {
        id: 1,
        type: 'post',
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        post: {
          id: 9,
          title: 'Title',
          slug: 'post-slug',
          ogDescription: '',
          ogTitle: 'OG title',
          publishedDate: new Date('2025-06-06T00:00:00.000Z'),
          heroImage: null,
          ogImage: { imageFile_id: 'og-file', imageFile_extension: 'jpg' },
          subSubcategories: [],
          subSubcategoriesOrderJson: [],
        },
        project: null,
      },
      {
        id: 2,
        type: 'project',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        post: null,
        project: {
          id: 5,
          title: 'Topic',
          subtitle: '',
          slug: 'topic-slug',
          ogTitle: 'Topic OG',
          ogDescription: '',
          publishedDate: new Date('2025-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-07-22T00:00:00.000Z'),
          heroImage: null,
          ogImage: { imageFile_id: 'topic-og', imageFile_extension: 'jpg' },
        },
      },
    ])
    mockFindManyProjects.mockResolvedValue([
      { id: 5, _count: { relatedPosts: 5 } },
    ])

    const result = await listMemberBookmarks(
      'member-cuid-1',
      { take: 12, skip: 0 },
      now
    )

    expect(mockFindManyProjects).toHaveBeenCalledTimes(1)
    expect(result.bookmarksCount).toBe(2)
    expect(result.bookmarks[0]).toMatchObject({
      type: 'post',
      post: {
        ogTitle: 'OG title',
        slug: 'post-slug',
        ogImage: {
          resized: { small: expect.stringContaining('og-file-800.webp') },
        },
      },
    })
    expect(result.bookmarks[1]).toMatchObject({
      type: 'project',
      project: {
        ogTitle: 'Topic OG',
        slug: 'topic-slug',
        updatedAt: '2026-07-22T00:00:00.000Z',
        relatedPostsCount: 5,
      },
    })
  })
})

describe('POST /v1/members/me/bookmarks', () => {
  const secret = process.env.GO_API_JWT_SECRET!
  const issuer = process.env.GO_API_JWT_ISSUER!
  const audience = process.env.GO_API_JWT_AUDIENCE!

  beforeEach(() => {
    mockFindMember.mockReset()
    mockCreateBookmark.mockReset()
    mockFindPost.mockReset()
  })

  it('returns 401 without Authorization', async () => {
    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/v1/members/me/bookmarks')
      .send({ type: 'post', slug: 'hello' })

    expect(res.status).toBe(401)
    expect(mockCreateBookmark).not.toHaveBeenCalled()
  })

  it('creates a post bookmark for an authenticated member', async () => {
    const accessJwt = jwt.sign(
      {
        user_id: 'tw-user-bookmark',
        email: 'bookmark@vitest.example',
        iss: issuer,
        aud: audience,
      },
      secret,
      { algorithm: 'HS256' }
    )

    mockFindMember.mockResolvedValue({
      id: 'member-cuid-1',
      role: 'member',
    })
    mockFindPost.mockResolvedValue({ id: 42, slug: 'hello-article' })
    mockCreateBookmark.mockResolvedValue({ id: 7 })

    const app = createApp({ corsAllowOrigin: ['https://kids.twreporter.org'] })
    const res = await request(app)
      .post('/v1/members/me/bookmarks')
      .set('Authorization', `Bearer ${accessJwt}`)
      .send({ type: 'post', slug: 'hello-article' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      id: '7',
      type: 'post',
      slug: 'hello-article',
    })
    expect(mockCreateBookmark).toHaveBeenCalledWith({
      data: {
        type: 'post',
        postId: 42,
        memberId: 'member-cuid-1',
        compositeKey: 'post:42:member-cuid-1',
      },
      select: { id: true },
    })
  })
})
