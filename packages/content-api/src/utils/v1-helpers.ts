import type { Prisma } from '@kids-reporter/db'

import envVar from '../environment-variables.js'

/** Match Keystone manual-order virtual: only IDs listed in JSON appear, in order (no trailing extras). */
export const orderTargetsByOrderJson = <T extends { id: unknown }>(
  targets: T[],
  orderJson: Array<{ id?: unknown }> | null | undefined
): T[] => {
  const orderedIds = (Array.isArray(orderJson) ? orderJson : [])
    .map((o) => `${o?.id ?? ''}`)
    .filter(Boolean)

  if (!orderedIds.length) return targets

  const byId = new Map<string, T>()
  targets.forEach((t) => byId.set(`${t.id}`, t))

  return orderedIds
    .map((id) => byId.get(id))
    .filter((t): t is T => t !== undefined)
}

/** Match Keystone `Post` access for FrontendHeadlessAccount (published or scheduled+past). */
export const buildPublicPostWhere = (now: Date) => ({
  OR: [
    { status: 'published' },
    {
      AND: [{ status: 'scheduled' }, { publishedDate: { lt: now } }],
    },
  ],
})

/** Post visibility for by-slug reads. Preview server matches CMS preview_headless (no status filter). */
export const buildPostBySlugVisibilityWhere = (
  now: Date
): Prisma.PostWhereInput =>
  envVar.isPreviewServer ? {} : buildPublicPostWhere(now)

/** Match Keystone `Project` access for FrontendHeadlessAccount (published only). */
export const buildPublicProjectWhere = (): Prisma.ProjectWhereInput => ({
  status: 'published',
})

/** Project visibility for by-slug reads. Preview server matches CMS preview_headless (no status filter). */
export const buildProjectBySlugVisibilityWhere =
  (): Prisma.ProjectWhereInput =>
    envVar.isPreviewServer ? {} : buildPublicProjectWhere()

/** Category/subcategory virtual `relatedPosts` uses published OR archived only (see `packages/cms/lists/category.ts`). */
export const buildCategoryFeedPostWhere = (subSubcategoryIds: number[]) => ({
  OR: [{ status: 'published' }, { status: 'archived' }],
  subSubcategories: { some: { id: { in: subSubcategoryIds } } },
})

export const postCardSelect = {
  id: true,
  title: true,
  slug: true,
  ogDescription: true,
  publishedDate: true,
  heroImage: {
    select: { imageFile_id: true, imageFile_extension: true },
  },
  subSubcategories: {
    select: {
      id: true,
      name: true,
      subcategory: {
        select: {
          name: true,
          category: {
            select: {
              slug: true,
              themeColor: true,
            },
          },
        },
      },
    },
  },
  subSubcategoriesOrderJson: true,
} as const

export type PostCardRow = {
  id: unknown
  title: string
  slug: string
  ogDescription: string | null
  publishedDate: Date | null
  heroImage: {
    imageFile_id: string | null
    imageFile_extension: string | null
  } | null
  subSubcategories: Array<{
    id: number
    name: string
    subcategory: {
      name: string
      category: { slug: string; themeColor: string | null } | null
    } | null
  }>
  subSubcategoriesOrderJson: unknown
}

export type OrderJson = Array<{ id?: unknown }>
export const asOrderJson = (value: unknown): OrderJson =>
  Array.isArray(value) ? (value as OrderJson) : []

export const buildResizedSmall = (
  photo:
    | {
        imageFile_id: string | null
        imageFile_extension: string | null
      }
    | null
    | undefined
) => {
  const filename = photo?.imageFile_id
  if (!filename) return ''
  return `${envVar.gcs.origin}/resized/${filename}-800.webp`
}

export const buildResizedMedium = (
  photo:
    | {
        imageFile_id: string | null
        imageFile_extension: string | null
      }
    | null
    | undefined
) => {
  const filename = photo?.imageFile_id
  if (!filename) return ''
  return `${envVar.gcs.origin}/resized/${filename}-1200.webp`
}

/** Matches Keystone `Photo.resized` large target (see `packages/cms/lists/photo.ts`). */
export const buildResizedLarge = (
  photo:
    | {
        imageFile_id: string | null
        imageFile_extension: string | null
      }
    | null
    | undefined
) => {
  const filename = photo?.imageFile_id
  if (!filename) return ''
  return `${envVar.gcs.origin}/resized/${filename}-2000.webp`
}

export const buildResizedTiny = (
  photo:
    | {
        imageFile_id: string | null
        imageFile_extension: string | null
      }
    | null
    | undefined
) => {
  const filename = photo?.imageFile_id
  if (!filename) return ''
  return `${envVar.gcs.origin}/resized/${filename}-400.webp`
}

export const mapPostCard = (p: PostCardRow) => {
  const subSubcategoriesOrdered = orderTargetsByOrderJson(
    p.subSubcategories,
    asOrderJson(p.subSubcategoriesOrderJson)
  )
  return {
    title: p.title,
    slug: p.slug,
    ogDescription: p.ogDescription,
    publishedDate: p.publishedDate ? p.publishedDate.toISOString() : null,
    heroImage: p.heroImage
      ? { resized: { small: buildResizedSmall(p.heroImage) } }
      : null,
    subSubcategoriesOrdered,
  }
}
