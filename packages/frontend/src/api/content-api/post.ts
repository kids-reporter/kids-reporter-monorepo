import {
  V1PostDetailBodySchema,
  V1PostEssayQuestionsBodySchema,
  V1PostMetaBodySchema,
  V1PostsEssayAnswersWithLikesResponseSchema,
  V1PostsResponseSchema,
} from '@kids-reporter/api-types'

import type {
  PostDetail,
  PostEssayQuestionsDetail,
  PostMeta,
  PostsEssayAnswersWithLikesPost,
  V1PostBySlugRequest,
  V1PostMetaBySlugRequest,
  V1PostsEssayAnswersWithLikesQuery,
} from '@/types/api'
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

export async function getPostContentApi({
  variables,
  traceHeaders,
}: {
  variables: V1PostBySlugRequest
  traceHeaders?: Record<string, string>
}): Promise<PostDetail | undefined> {
  const { slug, take, postEssayQuestionsTake, postChoiceQuestionsTake } =
    variables
  if (!slug) {
    throw new Error('content-api getPost requires slug')
  }
  try {
    const response = await sendContentApiRequest({
      path: `/v1/posts/${encodeURIComponent(slug)}`,
      method: 'GET',
      query: {
        take: take ?? undefined,
        postEssayQuestionsTake: postEssayQuestionsTake ?? undefined,
        postChoiceQuestionsTake: postChoiceQuestionsTake ?? undefined,
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
    return parsed.data
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
  variables: V1PostMetaBySlugRequest
  traceHeaders?: Record<string, string>
}): Promise<PostMeta | undefined> {
  const { slug } = variables
  if (!slug) {
    throw new Error('content-api getPostMeta requires slug')
  }
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
    return parsed.data
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}

export async function getPostsEssayAnswersWithLikesContentApi({
  variables,
  traceHeaders,
}: {
  variables: V1PostsEssayAnswersWithLikesQuery
  traceHeaders?: Record<string, string>
}): Promise<PostsEssayAnswersWithLikesPost[] | undefined> {
  const response = await sendContentApiRequest({
    path: '/v1/posts/essay-answers-with-likes',
    method: 'GET',
    query: {
      take: variables.take ?? undefined,
      skip: variables.skip ?? undefined,
      orderBy: variables.orderBy ?? 'publishedDate:desc',
      answerTake: variables.answerTake ?? undefined,
      answerOrderBy: variables.answerOrderBy ?? 'likesCount:desc',
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
  return parsed.data
}

export async function getPostEssayQuestionsByPostSlugContentApi({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: Record<string, string>
}): Promise<PostEssayQuestionsDetail | undefined> {
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
    return parsed.data
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return undefined
    }
    throw e
  }
}
