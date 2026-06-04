import type {
  V1AllPostEssayAnswersQuery,
  V1CreatePostChoiceAnswerBody,
  V1CreatePostEssayAnswerBody,
  V1CreatePostEssayAnswerLikeBody,
  V1PostEssayQuestionAnswersRequest,
} from '@kids-reporter/api-types'

import type {
  AllPostEssayAnswersItem,
  CreatePostChoiceAnswerResponse,
  CreatePostEssayAnswerLikeResponse,
  CreatePostEssayAnswerResponse,
  PostChoiceAnswer,
  PostEssayAnswer,
  PostEssayQuestionWithAnswers,
  UpdatePostChoiceAnswerResponse,
  UpdatePostEssayAnswerResponse,
} from '@/types/api'
import type { TraceHeaders } from '@/types/trace-headers'
import {
  ContentApiRequestError,
  sendContentApiRequest,
} from '@/utils/send-content-api'

export async function getPostChoiceAnswersByMemberIdContentApi({
  accessToken,
  postSlug,
  traceHeaders,
}: {
  accessToken: string
  postSlug?: string
  traceHeaders?: TraceHeaders
}): Promise<PostChoiceAnswer[]> {
  const body = await sendContentApiRequest<PostChoiceAnswer[]>({
    path: '/v1/members/me/post-choice-answers',
    authToken: accessToken,
    query: { postSlug: postSlug ?? undefined },
    traceHeaders,
  })
  if (!Array.isArray(body)) {
    throw new Error('content-api: expected array for post-choice-answers')
  }
  return body
}

export async function createPostChoiceAnswerContentApi(
  body: V1CreatePostChoiceAnswerBody,
  accessToken: string,
  traceHeaders?: TraceHeaders
): Promise<CreatePostChoiceAnswerResponse | undefined> {
  return sendContentApiRequest<CreatePostChoiceAnswerResponse>({
    path: '/v1/members/me/post-choice-answers',
    method: 'POST',
    authToken: accessToken,
    body,
    traceHeaders,
  })
}

export async function updatePostChoiceAnswerContentApi(
  variables: { id: string | number; data: { choiceIndex?: number } },
  accessToken: string,
  traceHeaders?: TraceHeaders
): Promise<UpdatePostChoiceAnswerResponse | undefined> {
  const id = variables.id
  const patch = variables.data
  return sendContentApiRequest<UpdatePostChoiceAnswerResponse>({
    path: `/v1/members/me/post-choice-answers/${encodeURIComponent(String(id))}`,
    method: 'PATCH',
    authToken: accessToken,
    body:
      typeof patch.choiceIndex === 'number'
        ? { choiceIndex: patch.choiceIndex }
        : {},
    traceHeaders,
  })
}

export async function getPostEssayAnswersByMemberIdContentApi({
  accessToken,
  postSlug,
  traceHeaders,
}: {
  accessToken: string
  postSlug?: string
  traceHeaders?: TraceHeaders
}): Promise<PostEssayAnswer[]> {
  const body = await sendContentApiRequest<PostEssayAnswer[]>({
    path: '/v1/members/me/post-essay-answers',
    authToken: accessToken,
    query: { postSlug: postSlug ?? undefined },
    traceHeaders,
  })
  if (!Array.isArray(body)) {
    throw new Error('content-api: expected array for post-essay-answers')
  }
  return body
}

export async function getAllPostEssayAnswersContentApi(
  variables: Pick<V1AllPostEssayAnswersQuery, 'orderBy' | 'take'>,
  traceHeaders?: TraceHeaders
): Promise<AllPostEssayAnswersItem[]> {
  const body = await sendContentApiRequest<AllPostEssayAnswersItem[]>({
    path: '/v1/post-essay-answers',
    query: {
      take: variables.take ?? undefined,
      orderBy: variables.orderBy ?? 'createdAt:desc',
    },
    traceHeaders,
  })
  if (!Array.isArray(body)) {
    throw new Error('content-api: expected array for all post-essay-answers')
  }
  return body
}

export async function createPostEssayAnswerContentApi(
  body: V1CreatePostEssayAnswerBody,
  accessToken: string,
  traceHeaders?: TraceHeaders
): Promise<CreatePostEssayAnswerResponse | undefined> {
  return sendContentApiRequest<CreatePostEssayAnswerResponse>({
    path: '/v1/members/me/post-essay-answers',
    method: 'POST',
    authToken: accessToken,
    body,
    traceHeaders,
  })
}

export async function updatePostEssayAnswerContentApi(
  variables: { id: string | number; data: { content: string } },
  accessToken: string,
  traceHeaders?: TraceHeaders
): Promise<UpdatePostEssayAnswerResponse | undefined> {
  const id = variables.id
  const patch = variables.data
  return sendContentApiRequest<UpdatePostEssayAnswerResponse>({
    path: `/v1/members/me/post-essay-answers/${encodeURIComponent(String(id))}`,
    method: 'PATCH',
    authToken: accessToken,
    body: { content: patch.content },
    traceHeaders,
  })
}

export async function getPostEssayQuestionEssayAnswersContentApi(
  request: V1PostEssayQuestionAnswersRequest,
  traceHeaders?: TraceHeaders
): Promise<PostEssayQuestionWithAnswers['answers']> {
  const { questionId, answerTake, answerSkip, answerOrderBy } = request
  try {
    const body = await sendContentApiRequest<PostEssayQuestionWithAnswers>({
      path: `/v1/post-essay-questions/${questionId}`,
      query: {
        answerTake,
        answerSkip: answerSkip ?? undefined,
        answerOrderBy: answerOrderBy ?? 'createdAt:desc',
      },
      traceHeaders,
    })
    return body.answers ?? []
  } catch (e) {
    if (e instanceof ContentApiRequestError && e.status === 404) {
      return []
    }
    throw e
  }
}

export async function createPostEssayAnswerLikeContentApi(
  body: V1CreatePostEssayAnswerLikeBody,
  accessToken: string,
  traceHeaders?: TraceHeaders
): Promise<CreatePostEssayAnswerLikeResponse | undefined> {
  return sendContentApiRequest<CreatePostEssayAnswerLikeResponse>({
    path: '/v1/members/me/post-essay-answer-likes',
    method: 'POST',
    authToken: accessToken,
    body,
    traceHeaders,
  })
}

export async function deletePostEssayAnswerLikeContentApi(
  id: string | number,
  accessToken: string,
  traceHeaders?: TraceHeaders
) {
  if (id === '' || id == null) {
    throw new Error('deletePostEssayAnswerLikeContentApi: id is required')
  }
  return sendContentApiRequest<{ id: string }>({
    path: `/v1/members/me/post-essay-answer-likes/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
    authToken: accessToken,
    traceHeaders,
  })
}
