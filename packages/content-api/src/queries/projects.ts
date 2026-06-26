import {
  V1ProjectRelatedPostsCountResponseSchema,
  V1ProjectsResponseSchema,
} from '@kids-reporter/api-types'
import { prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import {
  asOrderJson,
  buildPostBySlugVisibilityWhere,
  buildProjectBySlugVisibilityWhere,
  buildResizedMedium,
  buildResizedSmall,
  mapPostCard,
  orderTargetsByOrderJson,
  type PostCardRow,
  postCardSelect,
} from '../utils/v1-helpers.js'

type V1ProjectsResponse = z.infer<typeof V1ProjectsResponseSchema>
type V1ProjectRelatedPostsCountResponse = z.infer<
  typeof V1ProjectRelatedPostsCountResponseSchema
>

const PUBLISHED_PROJECT_WHERE = { status: 'published' as const }

/** Server-side default ordering; `orderBy` query param is currently fixed to `publishedDate:desc`. */
const PROJECTS_LIST_ORDER = { publishedDate: 'desc' } as const

const projectListBaseSelect = {
  title: true,
  subtitle: true,
  slug: true,
  ogDescription: true,
  publishedDate: true,
  heroImage: {
    select: { imageFile_id: true, imageFile_extension: true },
  },
  relatedPostsOrderJson: true,
} as const

export type FetchPublishedProjectsOpts = {
  take: number
  skip: number
  includeRelatedPosts: boolean
}

/** `GET /v1/projects` */
export async function fetchPublishedProjects(
  opts: FetchPublishedProjectsOpts,
  now: Date
): Promise<V1ProjectsResponse> {
  const projectsCount = await prisma.project.count({
    where: PUBLISHED_PROJECT_WHERE,
  })

  const projects = await prisma.project.findMany({
    take: opts.take,
    skip: opts.skip,
    where: PUBLISHED_PROJECT_WHERE,
    orderBy: PROJECTS_LIST_ORDER,
    select: opts.includeRelatedPosts
      ? {
          ...projectListBaseSelect,
          relatedPosts: {
            where: buildPostBySlugVisibilityWhere(now),
            orderBy: [{ publishedDate: 'desc' }],
            select: postCardSelect,
          },
        }
      : projectListBaseSelect,
  })

  const result = {
    projects: projects.map((p) => {
      const row = p as typeof p & {
        relatedPosts?: PostCardRow[]
      }
      const relatedPostsOrdered =
        opts.includeRelatedPosts && row.relatedPosts
          ? orderTargetsByOrderJson(
              row.relatedPosts,
              asOrderJson(row.relatedPostsOrderJson)
            ).map(mapPostCard)
          : undefined
      const hero = p.heroImage
      return {
        title: p.title,
        subtitle: p.subtitle,
        slug: p.slug,
        ogDescription: p.ogDescription,
        publishedDate: p.publishedDate ? p.publishedDate.toISOString() : null,
        heroImage: hero
          ? {
              resized: {
                small: buildResizedSmall(hero),
                medium: buildResizedMedium(hero),
              },
            }
          : null,
        ...(relatedPostsOrdered !== undefined ? { relatedPostsOrdered } : {}),
      }
    }),
    projectsCount,
  }
  return result
}

/** `GET /v1/projects/:slug/related-posts-count` returns null when the project is not found. */
export async function fetchPublishedProjectRelatedPostsCount(
  slug: string,
  now: Date
): Promise<V1ProjectRelatedPostsCountResponse | null> {
  const project = await prisma.project.findFirst({
    where: { AND: [{ slug }, buildProjectBySlugVisibilityWhere()] },
    select: { id: true },
  })
  if (!project) return null

  const relatedPostsCount = await prisma.post.count({
    where: {
      AND: [
        buildPostBySlugVisibilityWhere(now),
        { projects: { some: { id: project.id } } },
      ],
    },
  })
  return { relatedPostsCount }
}
