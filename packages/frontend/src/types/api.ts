import {
  type AccessTokenResponse,
  CallBaodaozaiIntroItemSchema,
  EditorPicksSettingItemSchema,
  type MemberProfile,
  type MemberProfilePatch,
  type PostContent,
  type RestErrorBody,
  SubcategoryItemSchema,
  type V1AllPostEssayAnswersQuery,
  V1AllPostEssayAnswersResponseSchema,
  V1AuthorBySlugMetaResponseSchema,
  V1AuthorBySlugPostsResponseSchema,
  type V1AuthorPostsRequest,
  type V1CallBaodaozaiIntroPathParams,
  V1CategoryBySlugCategoryPostsResponseSchema,
  V1CategoryBySlugMetadataResponseSchema,
  V1CategoryBySlugSubcategoriesThemeResponseSchema,
  type V1CategoryMetadataRequest,
  type V1CategoryPostsRequest,
  type V1CategorySubcategoriesThemeRequest,
  type V1CreatePostChoiceAnswerBody,
  V1CreatePostChoiceAnswerResponseSchema,
  type V1CreatePostEssayAnswerBody,
  type V1CreatePostEssayAnswerLikeBody,
  V1CreatePostEssayAnswerLikeResponseSchema,
  V1CreatePostEssayAnswerResponseSchema,
  V1EditorPicksSettingsResponseSchema,
  V1EssayAnswersHasLikedItemSchema,
  type V1EssayAnswersHasLikedQuery,
  V1EssayAnswersHasLikedResponseSchema,
  V1MemberAvatarSchema,
  V1MemberPostChoiceAnswersResponseSchema,
  V1MemberPostEssayAnswersResponseSchema,
  type V1MemberPostsWithAnswersQuery,
  V1MemberPostsWithAnswersResponseSchema,
  type V1PatchPostChoiceAnswerBody,
  type V1PatchPostEssayAnswerBody,
  V1PopularKeywordsResponseSchema,
  type V1PostBySlugRequest,
  V1PostDetailBodySchema,
  type V1PostEssayQuestionAnswersRequest,
  V1PostEssayQuestionsBodySchema,
  V1PostEssayQuestionWithAnswersResponseSchema,
  V1PostMetaBodySchema,
  type V1PostMetaBySlugRequest,
  V1PostsEssayAnswersWithLikesPostSchema,
  type V1PostsEssayAnswersWithLikesQuery,
  V1PostsEssayAnswersWithLikesResponseSchema,
  type V1PostsQuery,
  V1PostsResponseSchema,
  V1ProjectBySlugDetailResponseSchema,
  V1ProjectBySlugMetaResponseSchema,
  V1ProjectRelatedPostsCountResponseSchema,
  V1ProjectsItemSchema,
  type V1ProjectsQuery,
  V1ProjectsResponseSchema,
  V1SitemapEntrySchema,
  V1SubcategoryBySlugPostsResponseSchema,
  type V1SubcategoryPostsRequest,
  V1SubSubcategoryBySlugPostsResponseSchema,
  type V1SubSubcategoryPostsRequest,
  V1TagBySlugMetaResponseSchema,
  V1TagBySlugPostsResponseSchema,
  type V1TagPostsRequest,
  V1UpdatePostChoiceAnswerResponseSchema,
  V1UpdatePostEssayAnswerResponseSchema,
} from '@kids-reporter/api-types'
import type { z } from 'zod'

export type {
  AccessTokenResponse,
  MemberProfile,
  MemberProfilePatch,
  PostContent,
  RestErrorBody,
  V1AllPostEssayAnswersQuery,
  V1AuthorPostsRequest,
  V1CallBaodaozaiIntroPathParams,
  V1CategoryMetadataRequest,
  V1CategoryPostsRequest,
  V1CategorySubcategoriesThemeRequest,
  V1CreatePostChoiceAnswerBody,
  V1CreatePostEssayAnswerBody,
  V1CreatePostEssayAnswerLikeBody,
  V1EssayAnswersHasLikedQuery,
  V1MemberPostsWithAnswersQuery,
  V1PatchPostChoiceAnswerBody,
  V1PatchPostEssayAnswerBody,
  V1PostBySlugRequest,
  V1PostEssayQuestionAnswersRequest,
  V1PostMetaBySlugRequest,
  V1PostsEssayAnswersWithLikesQuery,
  V1PostsQuery,
  V1ProjectsQuery,
  V1SubcategoryPostsRequest,
  V1SubSubcategoryPostsRequest,
  V1TagPostsRequest,
}

// Shared contract (from api-types)
export type Post = PostContent

// Frontend-only (inferred here)

/** Nullable field helper (replaces GraphQL `Maybe`). */
export type Maybe<T> = T | null | undefined

export type PostDetail = z.infer<typeof V1PostDetailBodySchema>
export type PostMeta = z.infer<typeof V1PostMetaBodySchema>
export type PostEssayQuestionsDetail = z.infer<
  typeof V1PostEssayQuestionsBodySchema
>

export type PostsListResponse = z.infer<typeof V1PostsResponseSchema>

export type PostOrderBy = NonNullable<V1PostsQuery['orderBy']>

export type PostEssayAnswerOrderBy = NonNullable<
  V1PostsEssayAnswersWithLikesQuery['answerOrderBy']
>

export type PostsEssayAnswersWithLikesPost = z.infer<
  typeof V1PostsEssayAnswersWithLikesPostSchema
>
export type PostsEssayAnswersWithLikesResponse = z.infer<
  typeof V1PostsEssayAnswersWithLikesResponseSchema
>

export type EditorPicksSetting = z.infer<typeof EditorPicksSettingItemSchema>
export type EditorPicksSettingsResponse = z.infer<
  typeof V1EditorPicksSettingsResponseSchema
>

export type PopularKeyword = z.infer<
  typeof V1PopularKeywordsResponseSchema
>[number]

export type CallBaodaozaiIntro = z.infer<typeof CallBaodaozaiIntroItemSchema>
export type CallBaodaozaiIntroPageType = CallBaodaozaiIntro['page']

export type ProjectListItem = z.infer<typeof V1ProjectsItemSchema>
export type ProjectsListResponse = z.infer<typeof V1ProjectsResponseSchema>

export type ProjectDetail = z.infer<typeof V1ProjectBySlugDetailResponseSchema>
export type ProjectMeta = z.infer<typeof V1ProjectBySlugMetaResponseSchema>
export type ProjectRelatedPostsCount = z.infer<
  typeof V1ProjectRelatedPostsCountResponseSchema
>

export type CategoryPostsResponse = z.infer<
  typeof V1CategoryBySlugCategoryPostsResponseSchema
>
export type CategoryMetadataResponse = z.infer<
  typeof V1CategoryBySlugMetadataResponseSchema
>
export type CategorySubcategoriesThemeResponse = z.infer<
  typeof V1CategoryBySlugSubcategoriesThemeResponseSchema
>

export type SubcategoryItem = z.infer<typeof SubcategoryItemSchema>

export type SubcategoryPostsResponse = z.infer<
  typeof V1SubcategoryBySlugPostsResponseSchema
>
export type SubSubcategoryPostsResponse = z.infer<
  typeof V1SubSubcategoryBySlugPostsResponseSchema
>

export type TagMetaResponse = z.infer<typeof V1TagBySlugMetaResponseSchema>
export type TagPostsResponse = z.infer<typeof V1TagBySlugPostsResponseSchema>

export type AuthorMetaResponse = z.infer<
  typeof V1AuthorBySlugMetaResponseSchema
>
export type AuthorPostsResponse = z.infer<
  typeof V1AuthorBySlugPostsResponseSchema
>

export type SitemapEntry = z.infer<typeof V1SitemapEntrySchema>

export type MemberAvatar = z.infer<typeof V1MemberAvatarSchema>

export type MemberPostsWithAnswersPayload = z.infer<
  typeof V1MemberPostsWithAnswersResponseSchema
>
export type MemberPostWithAnswersItem =
  MemberPostsWithAnswersPayload['posts'][number]

export type MemberEssayAnswerHasLikedItem = z.infer<
  typeof V1EssayAnswersHasLikedItemSchema
>
export type MemberEssayAnswersHasLikedResponse = z.infer<
  typeof V1EssayAnswersHasLikedResponseSchema
>

export type PostEssayQuestionWithAnswers = z.infer<
  typeof V1PostEssayQuestionWithAnswersResponseSchema
>

export type AllPostEssayAnswersItem = z.infer<
  typeof V1AllPostEssayAnswersResponseSchema
>[number]

export type QnaMemberPublic = NonNullable<AllPostEssayAnswersItem['member']>

export type PostEssayAnswer = z.infer<
  typeof V1MemberPostEssayAnswersResponseSchema
>[number]
export type PostChoiceAnswer = z.infer<
  typeof V1MemberPostChoiceAnswersResponseSchema
>[number]

export type MemberReadingEssayAnswer =
  MemberPostWithAnswersItem['essayAnswers'][number]
export type MemberReadingChoiceAnswer =
  MemberPostWithAnswersItem['choiceAnswers'][number]

export type CreatePostChoiceAnswerResponse = z.infer<
  typeof V1CreatePostChoiceAnswerResponseSchema
>
export type UpdatePostChoiceAnswerResponse = z.infer<
  typeof V1UpdatePostChoiceAnswerResponseSchema
>
export type CreatePostEssayAnswerResponse = z.infer<
  typeof V1CreatePostEssayAnswerResponseSchema
>
export type UpdatePostEssayAnswerResponse = z.infer<
  typeof V1UpdatePostEssayAnswerResponseSchema
>
export type CreatePostEssayAnswerLikeResponse = z.infer<
  typeof V1CreatePostEssayAnswerLikeResponseSchema
>
