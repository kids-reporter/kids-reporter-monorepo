import {
  GetLatestPostsQuery,
  GetLatestPostsQueryVariables,
  GetPostEssayQuestionsQuery,
  GetPostMetaQuery,
  GetPostMetaQueryVariables,
  GetPostQuery,
  GetPostQueryVariables,
  GetPostsEssayAnswersWithLikesQuery,
  GetPostsEssayAnswersWithLikesQueryVariables,
  GetPostsQuery,
  GetPostsQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getLatestPosts = async (
  variables: GetLatestPostsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  const response = await sendRestGqlRequest<GetLatestPostsQuery>({
    operation: 'latest-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.posts
}

export const getPost = async (
  variables: GetPostQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  const response = await sendRestGqlRequest<GetPostQuery>({
    operation: 'post-detail',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.post
}

export const getPostMeta = async (
  variables: GetPostMetaQueryVariables,
  traceHeaders?: Record<string, string>
): Promise<GetPostMetaQuery['post']> => {
  const response = await sendRestGqlRequest<GetPostMetaQuery>({
    operation: 'post-meta',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.post
}

export const getPostsEssayAnswersWithLikes = async (
  variables: GetPostsEssayAnswersWithLikesQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  const response = await sendRestGqlRequest<GetPostsEssayAnswersWithLikesQuery>(
    {
      operation: 'posts-essay-answers-with-likes',
      method: 'GET',
      variables,
      traceHeaders,
    }
  )
  return response?.data?.data?.posts
}

export const getPostEssayQuestionsByPostSlug = async ({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: Record<string, string>
}) => {
  const response = await sendRestGqlRequest<GetPostEssayQuestionsQuery>({
    operation: 'post-essay-questions',
    method: 'GET',
    variables: { where: { slug } },
    traceHeaders,
  })
  return response?.data?.data?.post
}

export const getPostsPaged = async (
  variables: GetPostsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  const postsRes = await sendRestGqlRequest<GetPostsQuery>({
    operation: 'posts-paged',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return postsRes?.data?.data?.posts
}
