import { GetPostsEssayAnswersWithLikesQuery } from '__generated__/operations/content.generated'
import {
  CategoryWhereUniqueInput,
  PostEssayAnswerOrderByInput,
  PostOrderByInput,
  PostWhereInput,
} from '__generated__/types'
import { InfiniteData, useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { getCategoryPosts } from '@/api/category'
import {
  getPostEssayQuestionsByPostSlug,
  getPostsEssayAnswersWithLikes,
} from '@/api/post'
import { PostWithTwoTopLikesAnswersPerQuestion } from '@/modules/idea-hub/types'

const POSTS_ESSAY_ANSWERS_WITH_LIKES_QUERY_KEY =
  'posts-essay-answers-with-likes'

export function usePostsEssayAnswersWithLikesInfinityQuery({
  orderBy,
  take,
  answerOrderBy,
  answerTake,
  where,
  select,
}: {
  orderBy: PostOrderByInput[]
  take: number
  answerOrderBy: PostEssayAnswerOrderByInput[]
  answerTake: number
  where: PostWhereInput
  select?: (
    data: InfiniteData<GetPostsEssayAnswersWithLikesQuery['posts']>
  ) => PostWithTwoTopLikesAnswersPerQuestion['posts']
}) {
  return useInfiniteQuery({
    queryKey: usePostsEssayAnswersWithLikesInfinityQuery.getQueryKey({
      orderBy,
      take,
      where,
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
        where,
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
  where,
  answerOrderBy,
  answerTake,
}: {
  orderBy: PostOrderByInput[]
  take: number
  where: PostWhereInput
  answerOrderBy: PostEssayAnswerOrderByInput[]
  answerTake: number
}) => [
  POSTS_ESSAY_ANSWERS_WITH_LIKES_QUERY_KEY,
  orderBy,
  take,
  where,
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
  where,
  take,
  skip,
}: {
  where: CategoryWhereUniqueInput
  take: number
  skip: number
}) {
  return useQuery({
    queryKey: useCategoryPostsQuery.getQueryKey({ where, take, skip }),
    queryFn: () => getCategoryPosts({ where, take, skip }),
  })
}

useCategoryPostsQuery.getQueryKey = ({
  where,
  take,
  skip,
}: {
  where: CategoryWhereUniqueInput
  take: number
  skip: number
}) => [CATEGORY_POSTS_QUERY_KEY, where, take, skip]
