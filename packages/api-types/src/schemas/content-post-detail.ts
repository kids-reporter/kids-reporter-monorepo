import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'

extendZodWithOpenApi(z)

/**
 * Full sub-subcategory tree for **detail-shaped payloads** (`mapSubSubFull`, article detail,
 * related-post rows with routing slugs). This is intentionally richer than
 * `PostSubSubcategorySchema` in `content.ts` (feed/list post cards), which omits nested
 * slugs to keep list responses smaller and aligned with card UI needs.
 */
export const SubSubcategoryFullItemSchema = z
  .strictObject({
    name: z.string(),
    slug: z.string(),
    subcategory: z
      .strictObject({
        name: z.string(),
        slug: z.string(),
        category: z
          .strictObject({
            name: z.string(),
            slug: z.string(),
            themeColor: z.string().nullable(),
          })
          .optional(),
      })
      .optional(),
  })
  .openapi('SubSubcategoryFullItem')

/** Nested post sub-subs under `projects[].relatedPosts` (`mapSubSubProjectNested`). */
export const PostProjectNestedSubSubSchema = z
  .strictObject({
    name: z.string(),
    subcategory: z
      .strictObject({
        name: z.string(),
        category: z
          .strictObject({
            slug: z.string(),
            themeColor: z.string().nullable(),
          })
          .optional(),
      })
      .optional(),
  })
  .openapi('PostProjectNestedSubSub')

const PostDetailHeroResizedSchema = z.strictObject({
  small: z.string(),
  medium: z.string(),
  large: z.string(),
})

export const PostDetailHeroImageSchema = z
  .strictObject({
    imageFile: z.strictObject({
      width: z.number(),
      height: z.number(),
    }),
    resized: PostDetailHeroResizedSchema,
  })
  .openapi('PostDetailHeroImage')

export const PostDetailAuthorSchema = z
  .strictObject({
    id: z.string(),
    bio: z.string().nullable(),
    name: z.string(),
    slug: z.string(),
    avatar: z
      .strictObject({
        resized: z.strictObject({ tiny: z.string() }),
      })
      .optional(),
  })
  .openapi('PostDetailAuthor')

export const V1ProjectDetailRelatedPostOrderedItemSchema = z
  .strictObject({
    title: z.string(),
    slug: z.string(),
    publishedDate: z.iso.datetime().optional(),
    ogDescription: z.string().nullable().optional(),
    heroImage: z
      .strictObject({
        resized: PostDetailHeroResizedSchema,
      })
      .optional(),
    subSubcategoriesOrdered: z.array(SubSubcategoryFullItemSchema),
  })
  .openapi('ProjectDetailRelatedPostOrderedItem')

const PostDetailProjectNestedPostSchema = z
  .strictObject({
    title: z.string(),
    slug: z.string(),
    ogDescription: z.string().nullable(),
    publishedDate: z.iso.datetime().optional(),
    heroImage: z
      .strictObject({
        resized: z.strictObject({ small: z.string() }),
      })
      .optional(),
    subSubcategoriesOrdered: z.array(PostProjectNestedSubSubSchema),
  })
  .openapi('PostDetailProjectNestedPost')

const PostDetailProjectBlockSchema = z
  .strictObject({
    title: z.string(),
    slug: z.string(),
    relatedPosts: z.array(PostDetailProjectNestedPostSchema),
  })
  .openapi('PostDetailProjectBlock')

const PostDetailNewsReadingSchema = z.strictObject({
  items: z.array(
    z.strictObject({
      name: z.string(),
      embedCode: z.string(),
    })
  ),
})

const PostDetailEssayQuestionSummarySchema = z.strictObject({
  id: z.string(),
  title: z.string(),
  hint: z.string(),
})

const PostDetailChoiceQuestionSchema = z.strictObject({
  id: z.string(),
  title: z.string(),
  options: z.unknown(),
  reason: z.unknown().nullable(),
})

export const V1PostDetailBodySchema = z
  .strictObject({
    opening: z.string().nullable().optional(),
    title: z.string(),
    showBaodaozai: z.boolean(),
    newsReadingGroup: PostDetailNewsReadingSchema.optional(),
    brief: z.unknown().nullable().optional(),
    content: z.unknown().nullable().optional(),
    publishedDate: z.iso.datetime().optional(),
    heroImage: PostDetailHeroImageSchema.optional(),
    heroCaption: z.string().nullable().optional(),
    authors: z.array(PostDetailAuthorSchema),
    authorsJSON: z.unknown().nullable().optional(),
    tagsOrdered: z.array(
      z.strictObject({
        name: z.string(),
        slug: z.string(),
      })
    ),
    TWReporterRelatedPostsJSON: z.unknown().nullable().optional(),
    relatedPostsOrdered: z.array(V1ProjectDetailRelatedPostOrderedItemSchema),
    subtitle: z.string().nullable().optional(),
    subSubcategoriesOrdered: z.array(SubSubcategoryFullItemSchema),
    mainProject: z
      .strictObject({
        title: z.string(),
        slug: z.string(),
      })
      .optional(),
    projects: z.array(PostDetailProjectBlockSchema),
    postEssayQuestions: z.array(PostDetailEssayQuestionSummarySchema),
    postChoiceQuestions: z.array(PostDetailChoiceQuestionSchema),
  })
  .openapi('V1PostDetailBody')

export const V1PostMetaBodySchema = z
  .strictObject({
    publishedDate: z.iso.datetime().optional(),
    ogDescription: z.string().nullable(),
    ogTitle: z.string(),
    ogImage: z
      .strictObject({
        resized: z.strictObject({ small: z.string() }),
      })
      .nullable(),
    subSubcategoriesOrdered: z.array(SubSubcategoryFullItemSchema),
  })
  .openapi('V1PostMetaBody')

export const V1PostEssayQuestionsBodySchema = z
  .strictObject({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    heroImage: z
      .strictObject({
        resized: z.strictObject({ medium: z.string() }),
      })
      .optional(),
    postEssayQuestions: z.array(PostDetailEssayQuestionSummarySchema),
    subSubcategoriesOrdered: z.array(z.strictObject({ name: z.string() })),
  })
  .openapi('V1PostEssayQuestionsBody')

const PostEssayAnswerMemberInFeedSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  nickname: z.string(),
  email: z.string(),
  avatar: z
    .strictObject({
      id: z.string(),
      fileUrl: z.string(),
    })
    .optional(),
})

const PostEssayAnswerInFeedSchema = z
  .strictObject({
    id: z.string(),
    content: z.string(),
    likesCount: z.number().int(),
    createdAt: z.iso.datetime().optional(),
    member: PostEssayAnswerMemberInFeedSchema.optional(),
  })
  .openapi('PostEssayAnswerInFeed')

const PostEssayQuestionWithAnswersInFeedSchema = z
  .strictObject({
    id: z.string(),
    title: z.string(),
    hint: z.string(),
    answers: z.array(PostEssayAnswerInFeedSchema),
  })
  .openapi('PostEssayQuestionWithAnswersInFeed')

export const V1PostsEssayAnswersWithLikesPostSchema = z
  .strictObject({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    heroImage: z
      .strictObject({
        resized: z.strictObject({ medium: z.string() }),
      })
      .optional(),
    subSubcategoriesOrdered: z.array(z.strictObject({ name: z.string() })),
    postEssayQuestions: z.array(PostEssayQuestionWithAnswersInFeedSchema),
  })
  .openapi('V1PostsEssayAnswersWithLikesPost')

/** Flat 200 body for `GET /v1/posts/essay-answers-with-likes` (no `{ posts }` wrapper). */
export const V1PostsEssayAnswersWithLikesResponseSchema = z
  .array(V1PostsEssayAnswersWithLikesPostSchema)
  .openapi('V1PostsEssayAnswersWithLikesResponse')
