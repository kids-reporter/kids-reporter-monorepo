/**
 * Request variable types (path params, query strings, bodies, client composites).
 * Inferred from Zod schemas — single source of truth for api/ and content-api layers.
 */
import type { z } from 'zod'

import {
  V1AuthorAvatarPathParamsSchema,
  V1CallBaodaozaiIntroPathParamsSchema,
  V1EditorPicksSettingsQuerySchema,
  V1MemberPostsWithAnswersQuerySchema,
  V1PostBySlugPathParamsSchema,
  V1PostBySlugQuerySchema,
  V1PostsEssayAnswersWithLikesQuerySchema,
  V1PostsQuerySchema,
  V1ProjectsQuerySchema,
  V1SitemapsQuerySchema,
} from './schemas/content.js'
import {
  V1AuthorBySlugPostsQuerySchema,
  V1CategoryBySlugMetadataQuerySchema,
  V1CategoryPostsQuerySchema,
  V1FeedSlugPathParamsSchema,
  V1SubSubcategoryBySlugPostsQuerySchema,
  V1TagBySlugPostsQuerySchema,
} from './schemas/content-feed-queries.js'
import { V1EssayAnswersHasLikedQuerySchema } from './schemas/member-essay-answers-has-liked.js'
import {
  V1AllPostEssayAnswersQuerySchema,
  V1CreatePostChoiceAnswerBodySchema,
  V1CreatePostEssayAnswerBodySchema,
  V1CreatePostEssayAnswerLikeBodySchema,
  V1MemberPostChoiceAnswersQuerySchema,
  V1MemberPostEssayAnswersQuerySchema,
  V1PatchPostChoiceAnswerBodySchema,
  V1PatchPostEssayAnswerBodySchema,
  V1PostChoiceAnswerPathIdSchema,
  V1PostEssayAnswerLikePathIdSchema,
  V1PostEssayAnswerPathIdSchema,
  V1PostEssayQuestionAnswersParamsSchema,
  V1PostEssayQuestionAnswersQuerySchema,
} from './schemas/qna.js'
import type { V1MemberProfilePatchBody } from './shared-types.js'

// --- Posts / content ---

export type V1PostsQuery = z.infer<typeof V1PostsQuerySchema>
export type V1PostBySlugPathParams = z.infer<
  typeof V1PostBySlugPathParamsSchema
>
export type V1PostBySlugQuery = z.infer<typeof V1PostBySlugQuerySchema>
export type V1PostsEssayAnswersWithLikesQuery = z.infer<
  typeof V1PostsEssayAnswersWithLikesQuerySchema
>
export type V1SitemapsQuery = z.infer<typeof V1SitemapsQuerySchema>
export type V1ProjectsQuery = z.infer<typeof V1ProjectsQuerySchema>
export type V1EditorPicksSettingsQuery = z.infer<
  typeof V1EditorPicksSettingsQuerySchema
>
export type V1MemberPostsWithAnswersQuery = z.infer<
  typeof V1MemberPostsWithAnswersQuerySchema
>
export type { V1MemberProfilePatchBody }
export type V1AuthorAvatarPathParams = z.infer<
  typeof V1AuthorAvatarPathParamsSchema
>
export type V1CallBaodaozaiIntroPathParams = z.infer<
  typeof V1CallBaodaozaiIntroPathParamsSchema
>

export const V1PostBySlugRequestSchema = V1PostBySlugPathParamsSchema.merge(
  V1PostBySlugQuerySchema
)
export type V1PostBySlugRequest = z.infer<typeof V1PostBySlugRequestSchema>

export type V1PostMetaBySlugRequest = Pick<V1PostBySlugRequest, 'slug'>

// --- Feeds ---

export type V1FeedSlugPathParams = z.infer<typeof V1FeedSlugPathParamsSchema>
export type V1CategoryPostsQuery = z.infer<typeof V1CategoryPostsQuerySchema>
export type V1CategoryBySlugMetadataQuery = z.infer<
  typeof V1CategoryBySlugMetadataQuerySchema
>
export type V1SubSubcategoryBySlugPostsQuery = z.infer<
  typeof V1SubSubcategoryBySlugPostsQuerySchema
>
export type V1TagBySlugPostsQuery = z.infer<typeof V1TagBySlugPostsQuerySchema>
export type V1AuthorBySlugPostsQuery = z.infer<
  typeof V1AuthorBySlugPostsQuerySchema
>

export const V1CategoryPostsRequestSchema = V1FeedSlugPathParamsSchema.merge(
  V1CategoryPostsQuerySchema
)
export type V1CategoryPostsRequest = z.infer<
  typeof V1CategoryPostsRequestSchema
>

export const V1CategoryMetadataRequestSchema = V1FeedSlugPathParamsSchema.merge(
  V1CategoryBySlugMetadataQuerySchema
)
export type V1CategoryMetadataRequest = z.infer<
  typeof V1CategoryMetadataRequestSchema
>

export const V1CategorySubcategoriesThemeRequestSchema =
  V1FeedSlugPathParamsSchema
export type V1CategorySubcategoriesThemeRequest = z.infer<
  typeof V1CategorySubcategoriesThemeRequestSchema
>

export const V1SubcategoryPostsRequestSchema = V1FeedSlugPathParamsSchema.merge(
  V1CategoryPostsQuerySchema
)
export type V1SubcategoryPostsRequest = z.infer<
  typeof V1SubcategoryPostsRequestSchema
>

export const V1SubSubcategoryPostsRequestSchema =
  V1FeedSlugPathParamsSchema.merge(V1SubSubcategoryBySlugPostsQuerySchema)
export type V1SubSubcategoryPostsRequest = z.infer<
  typeof V1SubSubcategoryPostsRequestSchema
>

export const V1TagPostsRequestSchema = V1FeedSlugPathParamsSchema.merge(
  V1TagBySlugPostsQuerySchema
)
export type V1TagPostsRequest = z.infer<typeof V1TagPostsRequestSchema>

export const V1AuthorPostsRequestSchema = V1FeedSlugPathParamsSchema.merge(
  V1AuthorBySlugPostsQuerySchema
)
export type V1AuthorPostsRequest = z.infer<typeof V1AuthorPostsRequestSchema>

export const V1AuthorMetaRequestSchema = V1FeedSlugPathParamsSchema
export type V1AuthorMetaRequest = z.infer<typeof V1AuthorMetaRequestSchema>

export const V1TagMetaRequestSchema = V1FeedSlugPathParamsSchema
export type V1TagMetaRequest = z.infer<typeof V1TagMetaRequestSchema>

export const V1ProjectBySlugRequestSchema = V1FeedSlugPathParamsSchema
export type V1ProjectBySlugRequest = z.infer<
  typeof V1ProjectBySlugRequestSchema
>

// --- QnA ---

export type V1AllPostEssayAnswersQuery = z.infer<
  typeof V1AllPostEssayAnswersQuerySchema
>
export type V1PostEssayQuestionAnswersParams = z.infer<
  typeof V1PostEssayQuestionAnswersParamsSchema
>
export type V1PostEssayQuestionAnswersQuery = z.infer<
  typeof V1PostEssayQuestionAnswersQuerySchema
>

export const V1PostEssayQuestionAnswersRequestSchema =
  V1PostEssayQuestionAnswersParamsSchema.merge(
    V1PostEssayQuestionAnswersQuerySchema
  )
export type V1PostEssayQuestionAnswersRequest = z.infer<
  typeof V1PostEssayQuestionAnswersRequestSchema
>

export type V1MemberPostChoiceAnswersQuery = z.infer<
  typeof V1MemberPostChoiceAnswersQuerySchema
>
export type V1MemberPostEssayAnswersQuery = z.infer<
  typeof V1MemberPostEssayAnswersQuerySchema
>

export type V1CreatePostChoiceAnswerBody = z.infer<
  typeof V1CreatePostChoiceAnswerBodySchema
>
export type V1PatchPostChoiceAnswerBody = z.infer<
  typeof V1PatchPostChoiceAnswerBodySchema
>
export type V1CreatePostEssayAnswerBody = z.infer<
  typeof V1CreatePostEssayAnswerBodySchema
>
export type V1PatchPostEssayAnswerBody = z.infer<
  typeof V1PatchPostEssayAnswerBodySchema
>
export type V1CreatePostEssayAnswerLikeBody = z.infer<
  typeof V1CreatePostEssayAnswerLikeBodySchema
>

export type V1PostChoiceAnswerPathId = z.infer<
  typeof V1PostChoiceAnswerPathIdSchema
>
export type V1PostEssayAnswerPathId = z.infer<
  typeof V1PostEssayAnswerPathIdSchema
>
export type V1PostEssayAnswerLikePathId = z.infer<
  typeof V1PostEssayAnswerLikePathIdSchema
>

// --- Member activity ---

export type V1EssayAnswersHasLikedQuery = z.infer<
  typeof V1EssayAnswersHasLikedQuerySchema
>
