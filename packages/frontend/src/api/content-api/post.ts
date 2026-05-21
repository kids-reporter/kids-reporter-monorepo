import {
  GetPostEssayQuestionsQuery,
  GetPostMetaQuery,
  GetPostMetaQueryVariables,
  GetPostQuery,
  GetPostQueryVariables,
  GetPostsEssayAnswersWithLikesQuery,
  GetPostsEssayAnswersWithLikesQueryVariables,
} from '__generated__/operations/content.generated'
import {
  V1PostDetailBodySchema,
  V1PostEssayQuestionsBodySchema,
  V1PostMetaBodySchema,
  V1PostsEssayAnswersWithLikesResponseSchema,
  V1PostsResponseSchema,
} from '@kids-reporter/api-types'

import {
  ContentApiRequestError,
  contentApiResponseParseError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

async function fetchPostsV1({
  take,
  skip,
  traceHeaders,
}: {
  take?: number
  skip?: number
  traceHeaders?: Record<string, string>
}) {
  const response = await sendContentApiRequest({
    path: '/v1/posts',
    method: 'GET',
    query: {
      take,
      skip,
      orderBy: 'publishedDate:desc',
    },
    traceHeaders,
  })

  const parsed = V1PostsResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for /v1/posts',
      parsed.error
    )
  }
  return parsed.data.posts
}

export async function getLatestPostsContentApi({
  take,
  traceHeaders,
}: {
  take?: number
  traceHeaders?: Record<string, string>
}) {
  return fetchPostsV1({ take, traceHeaders })
}

export async function getPostsPagedContentApi({
  take,
  skip,
  traceHeaders,
}: {
  take?: number
  skip?: number
  traceHeaders?: Record<string, string>
}) {
  return fetchPostsV1({ take, skip, traceHeaders })
}

function postSlugFromWhere(where: GetPostQueryVariables['where']): string {
  const slug =
    where && typeof where === 'object' && 'slug' in where
      ? (where as { slug?: string }).slug
      : undefined
  if (typeof slug !== 'string' || !slug) {
    throw new Error('content-api getPost requires where.slug')
  }
  return slug
}

function postSlugFromMetaWhere(
  where: GetPostMetaQueryVariables['where']
): string {
  const slug =
    where && typeof where === 'object' && 'slug' in where
      ? (where as { slug?: string }).slug
      : undefined
  if (typeof slug !== 'string' || !slug) {
    throw new Error('content-api getPostMeta requires where.slug')
  }
  return slug
}

export async function getPostContentApi({
  variables,
  traceHeaders,
}: {
  variables: GetPostQueryVariables
  traceHeaders?: Record<string, string>
}) {
  const slug = postSlugFromWhere(variables.where)
  try {
    const response = await sendContentApiRequest({
      path: `/v1/posts/${encodeURIComponent(slug)}`,
      method: 'GET',
      query: {
        take: variables.take ?? undefined,
        postEssayQuestionsTake: variables.postEssayQuestionsTake ?? undefined,
        postChoiceQuestionsTake: variables.postChoiceQuestionsTake ?? undefined,
      },
      traceHeaders,
    })
    const parsed = V1PostDetailBodySchema.safeParse(response)
    if (!parsed.success) {
      throw contentApiResponseParseError(
        'content-api response schema mismatch for post by slug',
        parsed.error
      )
    }
    return parsed.data as GetPostQuery['post']
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

export async function getPostMetaContentApi({
  variables,
  traceHeaders,
}: {
  variables: GetPostMetaQueryVariables
  traceHeaders?: Record<string, string>
}) {
  const slug = postSlugFromMetaWhere(variables.where)
  try {
    const response = await sendContentApiRequest({
      path: `/v1/posts/${encodeURIComponent(slug)}/meta`,
      method: 'GET',
      traceHeaders,
    })
    const parsed = V1PostMetaBodySchema.safeParse(response)
    if (!parsed.success) {
      throw contentApiResponseParseError(
        'content-api response schema mismatch for post meta',
        parsed.error
      )
    }
    return parsed.data as GetPostMetaQuery['post']
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

function essayAnswerOrderByToFlat(
  orderBy: GetPostsEssayAnswersWithLikesQueryVariables['answerOrderBy']
): 'likesCount:desc' | 'createdAt:desc' {
  const first = Array.isArray(orderBy) ? orderBy[0] : orderBy
  if (
    first &&
    typeof first === 'object' &&
    'likesCount' in first &&
    first.likesCount === 'desc'
  ) {
    return 'likesCount:desc'
  }
  return 'createdAt:desc'
}

export async function getPostsEssayAnswersWithLikesContentApi({
  variables,
  traceHeaders,
}: {
  variables: GetPostsEssayAnswersWithLikesQueryVariables
  traceHeaders?: Record<string, string>
}) {
  const response = await sendContentApiRequest({
    path: '/v1/posts/essay-answers-with-likes',
    method: 'GET',
    query: {
      take: variables.take ?? undefined,
      skip: variables.skip ?? undefined,
      orderBy: 'publishedDate:desc',
      answerTake: variables.answerTake ?? undefined,
      answerOrderBy: essayAnswerOrderByToFlat(variables.answerOrderBy),
    },
    traceHeaders,
  })
  const parsed = V1PostsEssayAnswersWithLikesResponseSchema.safeParse(response)
  if (!parsed.success) {
    throw contentApiResponseParseError(
      'content-api response schema mismatch for essay-answers-with-likes',
      parsed.error
    )
  }
  return parsed.data as GetPostsEssayAnswersWithLikesQuery['posts']
}

export async function getPostEssayQuestionsByPostSlugContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: Record<string, string>
}) {
  try {
    const response = await sendContentApiRequest({
      path: `/v1/posts/${encodeURIComponent(slug)}/essay-questions`,
      method: 'GET',
      traceHeaders,
    })
    const parsed = V1PostEssayQuestionsBodySchema.safeParse(response)
    if (!parsed.success) {
      throw contentApiResponseParseError(
        'content-api response schema mismatch for post essay-questions',
        parsed.error
      )
    }
    return parsed.data as GetPostEssayQuestionsQuery['post']
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}
