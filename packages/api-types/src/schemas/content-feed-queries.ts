import { z } from 'zod'

/** Path `{slug}` for category / subcategory / sub-subcategory / tag / author feed routes. */
export const V1FeedSlugPathParamsSchema = z.object({
  slug: z.string(),
})

export const V1CategoryPostsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional(),
  skip: z.coerce.number().int().min(0).max(5000).optional(),
})

export const V1CategoryBySlugMetadataQuerySchema = z.object({
  subcategorySlug: z.string().optional(),
})

export const V1SubSubcategoryBySlugPostsQuerySchema = z.object({
  take: z.coerce.number().int().min(1).max(50).optional(),
  skip: z.coerce.number().int().min(0).max(5000).optional(),
  orderBy: z
    .enum(['publishedDate:desc'])
    .optional()
    .default('publishedDate:desc'),
})

export const V1TagBySlugPostsQuerySchema =
  V1SubSubcategoryBySlugPostsQuerySchema

export const V1AuthorBySlugPostsQuerySchema =
  V1SubSubcategoryBySlugPostsQuerySchema
