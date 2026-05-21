import {
  V1CategoryBySlugCategoryPostsResponseSchema,
  V1CategoryBySlugMetadataResponseSchema,
  V1CategoryBySlugSubcategoriesThemeResponseSchema,
  V1SubcategoriesResponseSchema,
  V1SubcategoryBySlugPostsResponseSchema,
  V1SubSubcategoryBySlugPostsResponseSchema,
} from '@kids-reporter/api-types'
import { prisma } from '@kids-reporter/db'
import type { z } from 'zod'

import {
  buildCategoryFeedPostWhere,
  buildPublicPostWhere,
  buildResizedMedium,
  mapPostCard,
  postCardSelect,
} from '../utils/v1-helpers.js'

const PUBLISHED_FEED_ORDER = { publishedDate: 'desc' } as const

const ogImageSelect = {
  imageFile_id: true,
  imageFile_extension: true,
} as const

const mapOgImageMedium = (
  img: {
    imageFile_id: string | null
    imageFile_extension: string | null
  } | null
) =>
  img
    ? {
        resized: {
          medium: buildResizedMedium(img),
        },
      }
    : null

type V1SubcategoriesResponse = z.infer<typeof V1SubcategoriesResponseSchema>
type V1CategoryBySlugMetadataResponse = z.infer<
  typeof V1CategoryBySlugMetadataResponseSchema
>
type V1CategoryBySlugSubcategoriesThemeResponse = z.infer<
  typeof V1CategoryBySlugSubcategoriesThemeResponseSchema
>
type V1CategoryBySlugCategoryPostsResponse = z.infer<
  typeof V1CategoryBySlugCategoryPostsResponseSchema
>
type V1SubcategoryBySlugPostsResponse = z.infer<
  typeof V1SubcategoryBySlugPostsResponseSchema
>
type V1SubSubcategoryBySlugPostsResponse = z.infer<
  typeof V1SubSubcategoryBySlugPostsResponseSchema
>

export type FeedPagination = {
  take: number
  skip: number
}

/** `GET /v1/subcategories` */
export async function fetchSubcategoriesList(): Promise<V1SubcategoriesResponse> {
  const result = await prisma.subcategory.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  })
  return result
}

/** `GET /v1/categories/:slug/metadata` */
export async function fetchCategoryMetadata(
  slug: string,
  subcategorySlug: string | undefined
): Promise<V1CategoryBySlugMetadataResponse | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      ogTitle: true,
      ogDescription: true,
      ogImage: { select: ogImageSelect },
      subcategories: {
        where: subcategorySlug ? { slug: subcategorySlug } : undefined,
        select: {
          ogTitle: true,
          ogDescription: true,
          ogImage: { select: ogImageSelect },
        },
      },
    },
  })
  if (!category) return null
  const result = {
    ogTitle: category.ogTitle,
    ogDescription: category.ogDescription,
    ogImage: mapOgImageMedium(category.ogImage),
    subcategories: category.subcategories.map((s) => ({
      ogTitle: s.ogTitle,
      ogDescription: s.ogDescription,
      ogImage: mapOgImageMedium(s.ogImage),
    })),
  }
  return result
}

/** `GET /v1/categories/:slug/subcategories-theme` */
export async function fetchCategorySubcategoriesTheme(
  slug: string
): Promise<V1CategoryBySlugSubcategoriesThemeResponse | null> {
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      name: true,
      themeColor: true,
      subcategories: {
        select: { name: true, slug: true },
        orderBy: { name: 'asc' },
      },
    },
  })
  if (!category) return null
  const result = {
    name: category.name,
    themeColor: category.themeColor,
    subcategories: category.subcategories,
  }
  return result
}

/** Collect all sub-subcategory ids under a category slug. Empty array if category missing. */
async function collectSubSubcategoryIdsForCategorySlug(
  slug: string
): Promise<number[]> {
  const rows = await prisma.subSubcategory.findMany({
    where: { subcategory: { category: { slug } } },
    select: { id: true },
  })
  return rows.map((r) => r.id)
}

/** `GET /v1/categories/:slug/posts` (unknown category → empty feed; not 404). */
export async function fetchCategoryFeedPosts(
  slug: string,
  opts: FeedPagination
): Promise<V1CategoryBySlugCategoryPostsResponse> {
  const subIds = await collectSubSubcategoryIdsForCategorySlug(slug)
  if (subIds.length === 0) {
    return { relatedPosts: [], relatedPostsCount: 0 }
  }
  const where = buildCategoryFeedPostWhere(subIds)
  const [posts, relatedPostsCount] = await Promise.all([
    prisma.post.findMany({
      take: opts.take,
      skip: opts.skip,
      where,
      orderBy: PUBLISHED_FEED_ORDER,
      select: postCardSelect,
    }),
    prisma.post.count({ where }),
  ])
  const result = {
    relatedPosts: posts.map(mapPostCard),
    relatedPostsCount,
  }
  return result
}

/** `GET /v1/subcategories/:slug/posts` (404 when subcategory missing). */
export async function fetchSubcategoryFeedPosts(
  slug: string,
  opts: FeedPagination
): Promise<V1SubcategoryBySlugPostsResponse | null> {
  const sub = await prisma.subcategory.findUnique({
    where: { slug },
    select: {
      id: true,
      category: { select: { slug: true } },
      subSubcategories: { select: { id: true } },
    },
  })
  if (!sub) return null

  const categorySlug = sub.category?.slug ?? ''
  const subIds = sub.subSubcategories.map((x) => x.id)
  if (subIds.length === 0) {
    return {
      relatedPosts: [],
      relatedPostsCount: 0,
      category: { slug: categorySlug },
    }
  }
  const where = buildCategoryFeedPostWhere(subIds)
  const [posts, relatedPostsCount] = await Promise.all([
    prisma.post.findMany({
      take: opts.take,
      skip: opts.skip,
      where,
      orderBy: PUBLISHED_FEED_ORDER,
      select: postCardSelect,
    }),
    prisma.post.count({ where }),
  ])
  const result = {
    relatedPosts: posts.map(mapPostCard),
    relatedPostsCount,
    category: { slug: categorySlug },
  }
  return result
}

/** `GET /v1/sub-subcategories/:slug/posts` (404 when sub-subcategory missing). */
export async function fetchSubSubcategoryFeedPosts(
  slug: string,
  opts: FeedPagination,
  now: Date
): Promise<V1SubSubcategoryBySlugPostsResponse | null> {
  const ss = await prisma.subSubcategory.findUnique({
    where: { slug },
    select: {
      id: true,
      subcategory: {
        select: {
          slug: true,
          category: { select: { slug: true } },
        },
      },
    },
  })
  if (!ss) return null

  const where = {
    AND: [
      buildPublicPostWhere(now),
      { subSubcategories: { some: { id: ss.id } } },
    ],
  }
  const [posts, relatedPostsCount] = await Promise.all([
    prisma.post.findMany({
      take: opts.take,
      skip: opts.skip,
      where,
      orderBy: PUBLISHED_FEED_ORDER,
      select: postCardSelect,
    }),
    prisma.post.count({ where }),
  ])
  const result = {
    relatedPosts: posts.map(mapPostCard),
    relatedPostsCount,
    subcategory: {
      slug: ss.subcategory?.slug ?? '',
      category: { slug: ss.subcategory?.category?.slug ?? '' },
    },
  }
  return result
}
