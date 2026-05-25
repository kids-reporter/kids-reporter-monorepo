import { z } from 'zod'

import { PostContentSchema } from './content.js'

/** OG image with medium resized URL (category metadata). */
export const OgResizedMediumSchema = z
  .object({ resized: z.object({ medium: z.string() }) })
  .nullable()
  .optional()

/** Response JSON; category slug is in the path. */
export const V1CategoryBySlugCategoryPostsResponseSchema = z.object({
  relatedPosts: z.array(PostContentSchema),
  relatedPostsCount: z.number().int().min(0),
})

export const V1CategoryBySlugMetadataResponseSchema = z.object({
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: OgResizedMediumSchema,
  subcategories: z
    .array(
      z.object({
        ogTitle: z.string().nullable().optional(),
        ogDescription: z.string().nullable().optional(),
        ogImage: OgResizedMediumSchema,
      })
    )
    .default([]),
})

export const V1CategoryBySlugSubcategoriesThemeResponseSchema = z.object({
  name: z.string(),
  themeColor: z.string().nullable().optional(),
  subcategories: z.array(z.object({ name: z.string(), slug: z.string() })),
})

export const V1SubcategoryBySlugPostsResponseSchema = z.object({
  relatedPosts: z.array(PostContentSchema),
  relatedPostsCount: z.number().int().min(0),
  category: z.object({ slug: z.string() }),
})

export const V1SubSubcategoryBySlugPostsResponseSchema = z.object({
  relatedPosts: z.array(PostContentSchema),
  relatedPostsCount: z.number().int().min(0),
  subcategory: z.object({
    slug: z.string(),
    category: z.object({ slug: z.string() }),
  }),
})

export const V1TagBySlugMetaResponseSchema = z.object({
  ogTitle: z.string().nullable().optional(),
  ogDescription: z.string().nullable().optional(),
  ogImage: z
    .object({
      resized: z.object({
        small: z.string(),
      }),
    })
    .nullable()
    .optional(),
})

export const V1TagBySlugPostsResponseSchema = z.object({
  posts: z.array(PostContentSchema),
  postsCount: z.number().int().min(0),
  name: z.string(),
})

export const V1AuthorBySlugMetaResponseSchema = z.object({
  slug: z.string(),
  name: z.string(),
  bio: z.string().nullable().optional(),
  image: z
    .object({
      resized: z.object({
        small: z.string(),
      }),
    })
    .nullable()
    .optional(),
})

export const V1AuthorBySlugPostsResponseSchema = z.object({
  bio: z.string().nullable().optional(),
  name: z.string(),
  email: z.string().nullable().optional(),
  avatar: z
    .object({
      resized: z.object({
        tiny: z.string(),
      }),
    })
    .nullable()
    .optional(),
  posts: z.array(PostContentSchema),
  postsCount: z.number().int().min(0),
})
