import { beforeEach, describe, expect, it, vi } from 'vitest'

const findMany = vi.fn()
const count = vi.fn()

vi.mock('@kids-reporter/db', () => ({
  prisma: {
    post: {
      findMany: (...args: unknown[]) => findMany(...args),
      count: (...args: unknown[]) => count(...args),
    },
  },
}))

describe('fetchVideoPostsList', () => {
  beforeEach(() => {
    findMany.mockReset()
    count.mockReset()
  })

  it('returns the public video list plus total', async () => {
    findMany.mockResolvedValue([])
    count.mockResolvedValue(4)
    const { fetchVideoPostsList } = await import('./posts.js')
    const { buildVideoListWhere } = await import('../utils/v1-helpers.js')
    const now = new Date('2026-01-01T00:00:00.000Z')

    const result = await fetchVideoPostsList({ take: 3, skip: 0 }, now)

    expect(result).toMatchObject({
      posts: [],
      page: { take: 3, skip: 0 },
      total: 4,
    })
    const where = buildVideoListWhere(now)
    expect(count).toHaveBeenCalledWith({ where })
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 3, skip: 0, where })
    )
  })
})
