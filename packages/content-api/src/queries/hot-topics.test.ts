import { describe, expect, it } from 'vitest'

import {
  type HotTopicCandidate,
  pickLatestUniqueHotTopics,
} from './hot-topics.js'

function row(postId: number, iso: string): HotTopicCandidate {
  return {
    postId,
    slug: `post-${postId}`,
    title: `title-${postId}`,
    answeredAt: new Date(iso),
    member: { nickname: '', name: '', email: 'abc*****' },
  }
}

describe('pickLatestUniqueHotTopics', () => {
  it('keeps the latest answer per post and the 3 newest posts', () => {
    const picked = pickLatestUniqueHotTopics([
      row(1, '2026-01-01T00:00:00.000Z'),
      row(2, '2026-02-01T00:00:00.000Z'),
      row(1, '2026-03-01T00:00:00.000Z'),
      row(3, '2026-04-01T00:00:00.000Z'),
      row(4, '2026-05-01T00:00:00.000Z'),
    ])

    expect(picked.map((topic) => topic.postId)).toEqual([4, 3, 1])
    expect(picked[2]?.answeredAt.toISOString()).toBe('2026-03-01T00:00:00.000Z')
  })

  it('returns an empty list when there are no answers', () => {
    expect(pickLatestUniqueHotTopics([])).toEqual([])
  })
})
