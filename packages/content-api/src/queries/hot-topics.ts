import { V1HotTopicsResponseSchema } from '@kids-reporter/api-types'
import { Prisma, prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import { maskEmail } from '../utils/mask-email.js'

type V1HotTopicsResponse = z.infer<typeof V1HotTopicsResponseSchema>

export type HotTopicCandidate = {
  postId: number
  slug: string
  title: string
  answeredAt: Date
  member: {
    nickname: string
    name: string
    email: string
  }
}

/** Latest answer wins. Same post keeps one row. */
export function pickLatestUniqueHotTopics(
  rows: HotTopicCandidate[],
  limit = 3
): HotTopicCandidate[] {
  const sorted = [...rows].sort(
    (a, b) => b.answeredAt.getTime() - a.answeredAt.getTime()
  )
  const seen = new Set<number>()
  const picked: HotTopicCandidate[] = []
  for (const row of sorted) {
    if (seen.has(row.postId)) continue
    seen.add(row.postId)
    picked.push(row)
    if (picked.length >= limit) break
  }
  return picked
}

type HotTopicSqlRow = {
  post_id: number
  slug: string
  og_title: string
  title: string
  answered_at: Date
  nickname: string
  name: string
  email: string
}

/** `GET /v1/hot-topics` */
export async function fetchHotTopics(now: Date): Promise<V1HotTopicsResponse> {
  const rows = await prisma.$queryRaw<HotTopicSqlRow[]>(Prisma.sql`
    WITH answers AS (
      SELECT
        peq."post" AS post_id,
        pea."member" AS member_id,
        pea."createdAt" AS answered_at
      FROM "PostEssayAnswer" pea
      INNER JOIN "PostEssayQuestion" peq ON peq.id = pea."question"
      WHERE peq."post" IS NOT NULL
        AND pea."member" IS NOT NULL
        AND pea."createdAt" IS NOT NULL

      UNION ALL

      SELECT
        pcq."post" AS post_id,
        pca."member" AS member_id,
        pca."createdAt" AS answered_at
      FROM "PostChoiceAnswer" pca
      INNER JOIN "PostChoiceQuestion" pcq ON pcq.id = pca."question"
      WHERE pcq."post" IS NOT NULL
        AND pca."member" IS NOT NULL
        AND pca."createdAt" IS NOT NULL
    ),
    latest AS (
      SELECT DISTINCT ON (post_id)
        post_id,
        member_id,
        answered_at
      FROM answers
      ORDER BY post_id, answered_at DESC
    )
    SELECT
      p.id AS post_id,
      p.slug,
      p."ogTitle" AS og_title,
      p.title,
      latest.answered_at,
      m.nickname,
      m.name,
      m.email
    FROM latest
    INNER JOIN "Post" p ON p.id = latest.post_id
    INNER JOIN "Member" m ON m.id = latest.member_id
    WHERE p.status = 'published'
      OR (p.status = 'scheduled' AND p."publishedDate" < ${now})
    ORDER BY latest.answered_at DESC
    LIMIT 3
  `)

  return pickLatestUniqueHotTopics(
    rows.map((row) => ({
      postId: Number(row.post_id),
      slug: row.slug,
      title: row.og_title.trim() || row.title,
      answeredAt: new Date(row.answered_at),
      member: {
        nickname: row.nickname,
        name: row.name,
        email: maskEmail(row.email),
      },
    }))
  ).map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    answeredAt: topic.answeredAt.toISOString(),
    member: topic.member,
  }))
}
