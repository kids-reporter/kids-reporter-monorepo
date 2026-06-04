import {
  getLatestPostsContentApi,
  getPostContentApi,
  getPostEssayQuestionsByPostSlugContentApi,
  getPostMetaContentApi,
  getPostsEssayAnswersWithLikesContentApi,
  getPostsPagedContentApi,
} from '@/api/content-api/post'
import type {
  PostContent,
  PostDetail,
  PostEssayQuestionsDetail,
  PostMeta,
  PostsEssayAnswersWithLikesPost,
  V1PostBySlugRequest,
  V1PostMetaBySlugRequest,
  V1PostsEssayAnswersWithLikesQuery,
  V1PostsQuery,
} from '@/types/api'

export const getLatestPosts = async (
  variables: { take?: number | null },
  traceHeaders?: Record<string, string>
): Promise<PostContent[] | undefined> => {
  return getLatestPostsContentApi({
    take: variables.take ?? undefined,
    traceHeaders,
  })
}

export const getPost = async (
  variables: V1PostBySlugRequest,
  traceHeaders?: Record<string, string>
): Promise<PostDetail | undefined> => {
  return getPostContentApi({ variables, traceHeaders })
}

export const getPostMeta = async (
  variables: V1PostMetaBySlugRequest,
  traceHeaders?: Record<string, string>
): Promise<PostMeta | undefined> => {
  return getPostMetaContentApi({ variables, traceHeaders })
}

export const getPostsEssayAnswersWithLikes = async (
  variables: V1PostsEssayAnswersWithLikesQuery,
  traceHeaders?: Record<string, string>
): Promise<PostsEssayAnswersWithLikesPost[] | undefined> => {
  return getPostsEssayAnswersWithLikesContentApi({
    variables,
    traceHeaders,
  })
}

export const getPostEssayQuestionsByPostSlug = async ({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: Record<string, string>
}): Promise<PostEssayQuestionsDetail | undefined> => {
  return getPostEssayQuestionsByPostSlugContentApi({ slug, traceHeaders })
}

export const getPostsPaged = async (
  variables: V1PostsQuery,
  traceHeaders?: Record<string, string>
): Promise<PostContent[] | undefined> => {
  if (variables.orderBy != null && variables.orderBy !== 'publishedDate:desc') {
    return undefined
  }

  return getPostsPagedContentApi({
    take: variables.take ?? undefined,
    skip: variables.skip ?? undefined,
    traceHeaders,
  })
}
