import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { getCategoryPosts } from '@/api/category'
import {
  getPostEssayQuestionsByPostSlug,
  getPostsEssayAnswersWithLikes,
} from '@/api/post'
import { PostWithTwoTopLikesAnswersPerQuestion } from '@/modules/idea-hub/types'
import type {
  PostEssayAnswerOrderBy,
  PostOrderBy,
  PostsEssayAnswersWithLikesPost,
  V1CategoryPostsRequest,
  V1PostsEssayAnswersWithLikesQuery,
} from '@/types/api'

const POSTS_ESSAY_ANSWERS_WITH_LIKES_QUERY_KEY =
  'posts-essay-answers-with-likes'

export function usePostsEssayAnswersWithLikesInfinityQuery({
  orderBy = 'publishedDate:desc',
  take,
  answerOrderBy,
  answerTake,
  select,
}: {
  orderBy?: PostOrderBy
  take: number
  answerOrderBy: PostEssayAnswerOrderBy
  answerTake: number
  select?: (
    data: InfiniteData<PostsEssayAnswersWithLikesPost[] | undefined>
  ) => PostWithTwoTopLikesAnswersPerQuestion['posts']
}) {
  return useInfiniteQuery({
    queryKey: usePostsEssayAnswersWithLikesInfinityQuery.getQueryKey({
      orderBy,
      take,
      answerOrderBy,
      answerTake,
    }),
    queryFn: ({ pageParam }) =>
      getPostsEssayAnswersWithLikes({
        orderBy,
        take,
        skip: pageParam,
        answerOrderBy,
        answerTake,
      }),
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const hasNextPage = (lastPage?.length ?? 0) === take
      return hasNextPage ? lastPageParam + take : undefined
    },
    initialPageParam: 0,
    select,
    refetchOnMount: 'always',
  })
}

usePostsEssayAnswersWithLikesInfinityQuery.getQueryKey = ({
  orderBy,
  take,
  answerOrderBy,
  answerTake,
}: Pick<
  V1PostsEssayAnswersWithLikesQuery,
  'orderBy' | 'take' | 'answerOrderBy' | 'answerTake'
>) => [
  POSTS_ESSAY_ANSWERS_WITH_LIKES_QUERY_KEY,
  orderBy,
  take,
  answerOrderBy,
  answerTake,
]

const POST_ESSAY_QUESTIONS_BY_POST_SLUG_QUERY_KEY =
  'post-essay-questions-by-post-slug'

export function usePostEssayQuestionsByPostSlugQuery({
  slug,
}: {
  slug: string
}) {
  return useQuery({
    queryKey: usePostEssayQuestionsByPostSlugQuery.getQueryKey({ slug }),
    queryFn: () => getPostEssayQuestionsByPostSlug({ slug }),
    enabled: !!slug,
  })
}

usePostEssayQuestionsByPostSlugQuery.getQueryKey = ({
  slug,
}: {
  slug: string
}) => [POST_ESSAY_QUESTIONS_BY_POST_SLUG_QUERY_KEY, slug]

const CATEGORY_POSTS_QUERY_KEY = 'category-posts'

export function useCategoryPostsQuery({
  slug,
  take,
  skip,
}: V1CategoryPostsRequest & { take: number; skip: number }) {
  return useQuery({
    queryKey: useCategoryPostsQuery.getQueryKey({ slug, take, skip }),
    queryFn: () => getCategoryPosts({ slug, take, skip }),
  })
}

useCategoryPostsQuery.getQueryKey = ({
  slug,
  take,
  skip,
}: V1CategoryPostsRequest & { take: number; skip: number }) => [
  CATEGORY_POSTS_QUERY_KEY,
  slug,
  take,
  skip,
]
