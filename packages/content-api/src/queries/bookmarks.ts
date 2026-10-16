import {
  V1BookmarksResponseSchema,
  V1CreateBookmarkResponseSchema,
  V1DeleteBookmarkResponseSchema,
} from '@kids-reporter/api-types'
import { Prisma, prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import {
  buildPostBySlugVisibilityWhere,
  buildPublicPostWhere,
  buildPublicProjectWhere,
  buildResizedMedium,
  buildResizedSmall,
  mapPostCard,
  type PostCardRow,
  postCardSelect,
} from '../utils/v1-helpers.js'

type V1BookmarksResponse = z.infer<typeof V1BookmarksResponseSchema>
type V1CreateBookmarkResponse = z.infer<typeof V1CreateBookmarkResponseSchema>
type V1DeleteBookmarkResponse = z.infer<typeof V1DeleteBookmarkResponseSchema>

export type MutationResult<T> =
  | { kind: 'ok'; data: T }
  | { kind: 'not_found' }
  | { kind: 'forbidden' }
  | { kind: 'duplicate' }

export type BookmarkType = 'post' | 'project'

type PhotoFile = {
  imageFile_id: string | null
  imageFile_extension: string | null
}

const photoSelect = {
  imageFile_id: true,
  imageFile_extension: true,
} as const

const bookmarkPostSelect = {
  ...postCardSelect,
  ogTitle: true,
  ogImage: { select: photoSelect },
} as const

const projectCardSelect = {
  id: true,
  title: true,
  subtitle: true,
  slug: true,
  ogTitle: true,
  ogDescription: true,
  publishedDate: true,
  updatedAt: true,
  heroImage: { select: photoSelect },
  ogImage: { select: photoSelect },
} as const

type BookmarkPostRow = PostCardRow & {
  ogTitle: string
  ogImage: PhotoFile | null
}

type ProjectCardRow = {
  id: number
  title: string
  subtitle: string
  slug: string
  ogTitle: string
  ogDescription: string
  publishedDate: Date | null
  updatedAt: Date | null
  heroImage: PhotoFile | null
  ogImage: PhotoFile | null
}

const mapOgImage = (photo: PhotoFile | null) => {
  if (!photo?.imageFile_id) return null
  return { resized: { small: buildResizedSmall(photo) } }
}

const mapProjectCard = (p: ProjectCardRow, relatedPostsCount: number) => {
  const hero = p.heroImage
  return {
    title: p.title,
    subtitle: p.subtitle,
    slug: p.slug,
    ogTitle: p.ogTitle,
    ogDescription: p.ogDescription,
    publishedDate: p.publishedDate ? p.publishedDate.toISOString() : null,
    updatedAt: p.updatedAt ? p.updatedAt.toISOString() : null,
    relatedPostsCount,
    heroImage: hero
      ? {
          resized: {
            small: buildResizedSmall(hero),
            medium: buildResizedMedium(hero),
          },
        }
      : null,
    ogImage: mapOgImage(p.ogImage),
  }
}

export type ListBookmarksOpts = {
  take: number
  skip: number
  type?: BookmarkType
  slug?: string
}

function buildListBookmarksWhere(
  memberId: string,
  opts: ListBookmarksOpts,
  now: Date
): Prisma.BookmarkWhereInput {
  const publicPost = {
    ...buildPublicPostWhere(now),
    ...(opts.slug ? { slug: opts.slug } : {}),
  }
  const publicProject = {
    ...buildPublicProjectWhere(),
    ...(opts.slug ? { slug: opts.slug } : {}),
  }

  if (opts.type === 'post') {
    return { memberId, type: 'post', post: publicPost }
  }
  if (opts.type === 'project') {
    return { memberId, type: 'project', project: publicProject }
  }
  return {
    memberId,
    OR: [
      { type: 'post', post: buildPublicPostWhere(now) },
      { type: 'project', project: buildPublicProjectWhere() },
    ],
  }
}

/** `GET /v1/members/me/bookmarks` */
export async function listMemberBookmarks(
  memberId: string,
  opts: ListBookmarksOpts,
  now: Date
): Promise<V1BookmarksResponse> {
  const where = buildListBookmarksWhere(memberId, opts, now)
  const [rows, bookmarksCount] = await Promise.all([
    prisma.bookmark.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: opts.take,
      skip: opts.skip,
      select: {
        id: true,
        type: true,
        createdAt: true,
        post: { select: bookmarkPostSelect },
        project: { select: projectCardSelect },
      },
    }),
    prisma.bookmark.count({ where }),
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

  const bookmarks: V1BookmarksResponse['bookmarks'] = []
  for (const row of rows) {
    if (row.type === 'post') {
      const post = row.post as BookmarkPostRow | null
      if (!post) continue
      bookmarks.push({
        id: String(row.id),
        createdAt: row.createdAt ? row.createdAt.toISOString() : null,
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
      bookmarks.push({
        id: String(row.id),
        createdAt: row.createdAt ? row.createdAt.toISOString() : null,
        type: 'project',
        project: mapProjectCard(project, relatedCounts.get(project.id) ?? 0),
      })
    }
  }
  return { bookmarks, bookmarksCount }
}

/** `POST /v1/members/me/bookmarks` (P2002 → duplicate). */
export async function createMemberBookmark(
  memberId: string,
  input: { type: BookmarkType; slug: string },
  now: Date
): Promise<MutationResult<V1CreateBookmarkResponse>> {
  if (input.type === 'post') {
    const post = await prisma.post.findFirst({
      where: { AND: [{ slug: input.slug }, buildPublicPostWhere(now)] },
      select: { id: true, slug: true },
    })
    if (!post) return { kind: 'not_found' }

    const compositeKey = `post:${post.id}:${memberId}`
    try {
      const row = await prisma.bookmark.create({
        data: {
          type: 'post',
          postId: post.id,
          memberId,
          compositeKey,
        },
        select: { id: true },
      })
      return {
        kind: 'ok',
        data: { id: String(row.id), type: 'post', slug: post.slug },
      }
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        return { kind: 'duplicate' }
      }
      throw e
    }
  }

  const project = await prisma.project.findFirst({
    where: { AND: [{ slug: input.slug }, buildPublicProjectWhere()] },
    select: { id: true, slug: true },
  })
  if (!project) return { kind: 'not_found' }

  const compositeKey = `project:${project.id}:${memberId}`
  try {
    const row = await prisma.bookmark.create({
      data: {
        type: 'project',
        projectId: project.id,
        memberId,
        compositeKey,
      },
      select: { id: true },
    })
    return {
      kind: 'ok',
      data: { id: String(row.id), type: 'project', slug: project.slug },
    }
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return { kind: 'duplicate' }
    }
    throw e
  }
}

/** `DELETE /v1/members/me/bookmarks/:id` */
export async function deleteMemberBookmark(
  memberId: string,
  bookmarkId: number
): Promise<MutationResult<V1DeleteBookmarkResponse>> {
  const existing = await prisma.bookmark.findUnique({
    where: { id: bookmarkId },
    select: { id: true, memberId: true },
  })
  if (!existing) return { kind: 'not_found' }
  if (existing.memberId !== memberId) return { kind: 'forbidden' }

  await prisma.bookmark.delete({ where: { id: existing.id } })
  return { kind: 'ok', data: { id: String(existing.id) } }
}
