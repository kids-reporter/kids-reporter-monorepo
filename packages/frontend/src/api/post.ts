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

import {
  getLatestPostsContentApi,
  getPostContentApi,
  getPostEssayQuestionsByPostSlugContentApi,
  getPostMetaContentApi,
  getPostsEssayAnswersWithLikesContentApi,
  getPostsPagedContentApi,
} from '@/api/content-api/post'
import envVars from '@/environment-variables'
import { firstOrderByEntry } from '@/utils/first-order-by'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getLatestPosts = async (
  variables: GetLatestPostsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  if (envVars.useContentApi) {
    try {
      const posts = await getLatestPostsContentApi({
        take: variables.take ?? undefined,
        traceHeaders,
      })
      return posts as unknown as GetLatestPostsQuery['posts']
    } catch (err) {
      logContentApiFallback('getLatestPosts', err)
    }
  }
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
  if (envVars.useContentApi) {
    try {
      return await getPostContentApi({ variables, traceHeaders })
    } catch (err) {
      logContentApiFallback('getPost', err)
    }
  }
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
  if (envVars.useContentApi) {
    try {
      return await getPostMetaContentApi({ variables, traceHeaders })
    } catch (err) {
      logContentApiFallback('getPostMeta', err)
    }
  }
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
  if (envVars.useContentApi) {
    try {
      return await getPostsEssayAnswersWithLikesContentApi({
        variables,
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getPostsEssayAnswersWithLikes', err)
    }
  }
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
  if (envVars.useContentApi) {
    try {
      return await getPostEssayQuestionsByPostSlugContentApi({
        slug,
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getPostEssayQuestionsByPostSlug', err)
    }
  }
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
  if (envVars.useContentApi) {
    try {
      const order = firstOrderByEntry(variables.orderBy ?? undefined)
      const orderSupported =
        !order ||
        (order.publishedDate === 'desc' &&
          !order.id &&
          !order.title &&
          !order.slug)

      if (orderSupported) {
        const posts = await getPostsPagedContentApi({
          take: variables.take ?? undefined,
          skip: variables.skip ?? undefined,
          traceHeaders,
        })
        return posts as unknown as GetPostsQuery['posts']
      }
    } catch (err) {
      logContentApiFallback('getPostsPaged', err)
    }
  }

  const postsRes = await sendRestGqlRequest<GetPostsQuery>({
    operation: 'posts-paged',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return postsRes?.data?.data?.posts
}
