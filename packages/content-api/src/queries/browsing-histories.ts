import {
  V1BrowsingHistoriesResponseSchema,
  V1CreateBrowsingHistoryResponseSchema,
} from '@kids-reporter/api-types'
import { Prisma, prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import {
  buildPostBySlugVisibilityWhere,
  buildPublicPostWhere,
  buildPublicProjectWhere,
  mapOgImage,
  mapPostCard,
  mapProjectCard,
  type PhotoFile,
  photoSelect,
  type PostCardRow,
  postCardSelect,
  type ProjectCardRow,
  projectCardSelect,
} from '../utils/v1-helpers.js'

type V1BrowsingHistoriesResponse = z.infer<
  typeof V1BrowsingHistoriesResponseSchema
>
type V1CreateBrowsingHistoryResponse = z.infer<
  typeof V1CreateBrowsingHistoryResponseSchema
>

export type RecordResult<T> = { kind: 'ok'; data: T } | { kind: 'not_found' }

export type BrowsingHistoryType = 'post' | 'project'

const historyPostSelect = {
  ...postCardSelect,
  ogTitle: true,
  ogImage: { select: photoSelect },
} as const

type HistoryPostRow = PostCardRow & {
  ogTitle: string
  ogImage: PhotoFile | null
}

export type ListBrowsingHistoriesOpts = {
  take: number
  skip: number
}

function buildListBrowsingHistoriesWhere(
  memberId: string,
  now: Date
): Prisma.BrowsingHistoryWhereInput {
  return {
    memberId,
    OR: [
      { type: 'post', post: buildPublicPostWhere(now) },
      { type: 'project', project: buildPublicProjectWhere() },
    ],
  }
}

/** `GET /v1/members/me/browsing-histories` */
export async function listMemberBrowsingHistories(
  memberId: string,
  opts: ListBrowsingHistoriesOpts,
  now: Date
): Promise<V1BrowsingHistoriesResponse> {
  const where = buildListBrowsingHistoriesWhere(memberId, now)
  const [rows, browsingHistoriesCount] = await Promise.all([
    prisma.browsingHistory.findMany({
      where,
      orderBy: { visitedAt: 'desc' },
      take: opts.take,
      skip: opts.skip,
      select: {
        id: true,
        type: true,
        visitedAt: true,
        post: { select: historyPostSelect },
        project: { select: projectCardSelect },
      },
    }),
    prisma.browsingHistory.count({ where }),
  ])

  const projectIds = rows.flatMap((row) =>
    row.type === 'project' && row.project ? [row.project.id] : []
  )
  const relatedCounts = new Map<number, number>()
  if (projectIds.length > 0) {
    const counted = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: {
        id: true,
        _count: {
          select: {
            relatedPosts: { where: buildPostBySlugVisibilityWhere(now) },
          },
        },
      },
    })
    for (const project of counted) {
      relatedCounts.set(project.id, project._count.relatedPosts)
    }
  }

  const browsingHistories: V1BrowsingHistoriesResponse['browsingHistories'] = []
  for (const row of rows) {
    const visitedAt = row.visitedAt ? row.visitedAt.toISOString() : null
    if (row.type === 'post') {
      const post = row.post as HistoryPostRow | null
      if (!post) continue
      browsingHistories.push({
        id: String(row.id),
        visitedAt,
        type: 'post',
        post: {
          ...mapPostCard(post),
          ogTitle: post.ogTitle,
          ogImage: mapOgImage(post.ogImage),
        },
      })
      continue
    }
    if (row.type === 'project') {
      const project = row.project as ProjectCardRow | null
      if (!project) continue
      browsingHistories.push({
        id: String(row.id),
        visitedAt,
        type: 'project',
        project: mapProjectCard(project, relatedCounts.get(project.id) ?? 0),
      })
    }
  }
  return { browsingHistories, browsingHistoriesCount }
}

/** `POST /v1/members/me/browsing-histories` (repeat visit updates visitedAt). */
export async function recordMemberBrowsingHistory(
  memberId: string,
  input: { type: BrowsingHistoryType; slug: string },
  now: Date
): Promise<RecordResult<V1CreateBrowsingHistoryResponse>> {
  if (input.type === 'post') {
    const post = await prisma.post.findFirst({
      where: { AND: [{ slug: input.slug }, buildPublicPostWhere(now)] },
      select: { id: true, slug: true },
    })
    if (!post) return { kind: 'not_found' }

    const compositeKey = `post:${post.id}:${memberId}`
    const row = await prisma.browsingHistory.upsert({
      where: { compositeKey },
      create: {
        type: 'post',
        postId: post.id,
        memberId,
        compositeKey,
        visitedAt: now,
      },
      update: { visitedAt: now },
      select: { id: true, visitedAt: true },
    })
    return {
      kind: 'ok',
      data: {
        id: String(row.id),
        type: 'post',
        slug: post.slug,
        visitedAt: row.visitedAt ? row.visitedAt.toISOString() : null,
      },
    }
  }

  const project = await prisma.project.findFirst({
    where: { AND: [{ slug: input.slug }, buildPublicProjectWhere()] },
    select: { id: true, slug: true },
  })
  if (!project) return { kind: 'not_found' }

  const compositeKey = `project:${project.id}:${memberId}`
  const row = await prisma.browsingHistory.upsert({
    where: { compositeKey },
    create: {
      type: 'project',
      projectId: project.id,
      memberId,
      compositeKey,
      visitedAt: now,
    },
    update: { visitedAt: now },
    select: { id: true, visitedAt: true },
  })
  return {
    kind: 'ok',
    data: {
      id: String(row.id),
      type: 'project',
      slug: project.slug,
      visitedAt: row.visitedAt ? row.visitedAt.toISOString() : null,
    },
  }
}
