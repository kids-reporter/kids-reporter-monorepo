import {
  V1EssayAnswersHasLikedResponseSchema,
  V1MemberPostsWithAnswersResponseSchema,
} from '@kids-reporter/api-types'
import { Prisma, prisma } from '@kids-reporter/db'
import type { z } from 'zod'

type RawPostRow = {
  id: number
  title: string
  slug: string
  published_date: Date | null
  last_answered_time: Date
}

type V1MemberPostsWithAnswersResponse = z.infer<
  typeof V1MemberPostsWithAnswersResponseSchema
>
type V1EssayAnswersHasLikedResponse = z.infer<
  typeof V1EssayAnswersHasLikedResponseSchema
>

type ChoiceOptionRaw = { content?: unknown; isCorrectAnswer?: unknown }

const mapChoiceOpts = (raw: unknown) => {
  if (!Array.isArray(raw)) return []
  return raw.map((o: ChoiceOptionRaw) => ({
    content:
      typeof o?.content === 'string' ? o.content : String(o?.content ?? ''),
    isCorrectAnswer: !!o?.isCorrectAnswer,
  }))
}

export type FetchMemberPostsWithAnswersOpts = {
  take: number
  cursor: string | undefined
}

/** `GET /v1/members/me/posts-with-answers` */
export async function fetchMemberPostsWithAnswers(
  memberId: string,
  opts: FetchMemberPostsWithAnswersOpts
): Promise<V1MemberPostsWithAnswersResponse> {
  const whereClause = opts.cursor
    ? Prisma.sql`WHERE pla.last_answered_time < ${opts.cursor}::timestamp`
    : Prisma.empty

  const sqlQuery = Prisma.sql`
    WITH all_answer_times AS (
      SELECT 
        peq."post" as post_id,
        COALESCE(pea."updatedAt", pea."createdAt") as answer_time
      FROM "PostEssayAnswer" pea
      INNER JOIN "PostEssayQuestion" peq ON peq.id = pea."question"
      WHERE pea."member" = ${memberId}
      
      UNION ALL
      
      SELECT 
        pcq."post" as post_id,
        COALESCE(pca."updatedAt", pca."createdAt") as answer_time
      FROM "PostChoiceAnswer" pca
      INNER JOIN "PostChoiceQuestion" pcq ON pcq.id = pca."question"
      WHERE pca."member" = ${memberId}
    ),
    post_last_answered AS (
      SELECT 
        post_id,
        MAX(answer_time) as last_answered_time
      FROM all_answer_times
      GROUP BY post_id
    )
    SELECT 
      p.id,
      p.title,
      p.slug,
      p."publishedDate" as published_date,
      pla.last_answered_time
    FROM "Post" p
    INNER JOIN post_last_answered pla ON pla.post_id = p.id
    ${whereClause}
    ORDER BY pla.last_answered_time DESC
    LIMIT ${opts.take + 1}
  `

  const postsRaw = await prisma.$queryRaw<RawPostRow[]>(sqlQuery)

  if (postsRaw.length === 0) {
    return { posts: [], nextCursor: null as string | null }
  }

  const hasNextPage = postsRaw.length > opts.take
  const postsToReturn = postsRaw.slice(0, opts.take)
  const postIds = postsToReturn.map((p) => p.id)

  const [essayAnswersData, choiceAnswersData] = await Promise.all([
    prisma.postEssayAnswer.findMany({
      where: {
        memberId,
        question: { postId: { in: postIds } },
      },
      select: {
        id: true,
        content: true,
        likesCount: true,
        createdAt: true,
        updatedAt: true,
        question: {
          select: {
            id: true,
            title: true,
            hint: true,
            post: { select: { id: true } },
          },
        },
      },
    }),
    prisma.postChoiceAnswer.findMany({
      where: {
        memberId,
        question: { postId: { in: postIds } },
      },
      select: {
        id: true,
        choiceIndex: true,
        correct: true,
        createdAt: true,
        updatedAt: true,
        question: {
          select: {
            id: true,
            title: true,
            options: true,
            reason: true,
            post: { select: { id: true } },
          },
        },
      },
    }),
  ])

  const posts = postsToReturn.map((post) => {
    const postIdStr = post.id.toString()
    const essayAnswers = essayAnswersData
      .filter((a) => a.question?.post?.id?.toString() === postIdStr)
      .map((a) => ({
        id: String(a.id),
        content: a.content,
        likesCount: a.likesCount,
        createdAt: a.createdAt?.toISOString() ?? '',
        updatedAt: a.updatedAt?.toISOString() ?? '',
        question: {
          id: String(a.question!.id),
          title: a.question!.title,
          hint: a.question!.hint,
          post: { id: String(a.question!.post!.id) },
        },
      }))
    const choiceAnswers = choiceAnswersData
      .filter((a) => a.question?.post?.id?.toString() === postIdStr)
      .map((a) => ({
        id: String(a.id),
        choiceIndex: a.choiceIndex,
        correct: a.correct,
        createdAt: a.createdAt?.toISOString() ?? '',
        updatedAt: a.updatedAt?.toISOString() ?? '',
        question: {
          id: String(a.question!.id),
          title: a.question!.title,
          options: mapChoiceOpts(a.question!.options),
          reason: a.question!.reason,
          post: { id: String(a.question!.post!.id) },
        },
      }))
    return {
      id: String(post.id),
      title: post.title,
      slug: post.slug,
      publishedDate: post.published_date
        ? post.published_date.toISOString()
        : '',
      essayAnswers,
      choiceAnswers,
      lastAnsweredTime: post.last_answered_time.toISOString(),
    }
  })

  const nextCursor: string | null = hasNextPage
    ? (posts[posts.length - 1]?.lastAnsweredTime ?? null)
    : null

  return { posts, nextCursor }
}

/** `GET /v1/members/me/essay-answers/has-liked` */
export async function fetchMemberEssayAnswerLikes(
  memberId: string,
  essayAnswerIds: string[]
): Promise<V1EssayAnswersHasLikedResponse> {
  if (!essayAnswerIds.length) return []

  const ids = essayAnswerIds
    .map((id) => Number.parseInt(id, 10))
    .filter((n) => Number.isFinite(n))

  const likes = await prisma.postEssayAnswerLike.findMany({
    where: {
      memberId,
      answerId: { in: ids },
    },
    select: {
      id: true,
      answerId: true,
    },
  })

  return essayAnswerIds.map((idStr) => {
    const idNum = Number.parseInt(idStr, 10)
    const hit = likes.find((l) => l.answerId === idNum)
    return {
      essayAnswerId: idStr,
      hasLiked: !!hit,
      essayAnswerLikeId: hit ? String(hit.id) : '',
    }
  })
}
