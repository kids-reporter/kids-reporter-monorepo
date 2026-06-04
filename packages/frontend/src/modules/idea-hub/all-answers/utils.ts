import { InfiniteData } from '@tanstack/react-query'

import type { PostsEssayAnswersWithLikesPost } from '@/types/api'

import { PostWithTwoTopLikesAnswersPerQuestion } from '../types'

export function transformInfinitePostsEssayAnswersWithLikesDataToPosts(
  data: InfiniteData<PostsEssayAnswersWithLikesPost[]>
): PostWithTwoTopLikesAnswersPerQuestion['posts'] {
  if (!data?.pages) return []
  const allPosts: PostWithTwoTopLikesAnswersPerQuestion['posts'] = []

  data.pages.forEach((page) => {
    if (!page) return

    page.forEach((post) => {
      if (!post) return

      const questionsWithAnswers =
        post.postEssayQuestions
          ?.map((question) => ({
            id: question.id,
            title: question.title || '',
            hint: question.hint || '',
            answers:
              question.answers?.map((answer) => {
                const member = answer?.member
                return {
                  id: answer.id,
                  createdAt: answer.createdAt || '',
                  content: answer.content || '',
                  likesCount: answer.likesCount || 0,
                  member: {
                    id: member?.id || '',
                    name: member?.name || '',
                    nickname: member?.nickname || '',
                    email: member?.email || '',
                    avatar: {
                      fileUrl: member?.avatar?.fileUrl || '',
                      id: member?.avatar?.id || '',
                    },
                  },
                }
              }) ?? [],
          }))
          .filter((question) => question.answers.length > 0) || []

      if (questionsWithAnswers.length === 0) return
      const postId = post.id || post.slug
      if (!postId) {
        throw new Error(
          `Post is missing both id and slug. Data integrity issue detected. Post title: ${
            post.title ?? 'N/A'
          }.`
        )
      }
      allPosts.push({
        id: postId,
        slug: post.slug || '',
        title: post.title || '',
        heroImage: {
          resized: {
            medium: post.heroImage?.resized?.medium || '',
          },
        },
        subSubcategoriesOrdered:
          post.subSubcategoriesOrdered?.map((cat) => ({
            name: cat?.name || '',
          })) || [],
        postEssayQuestions: questionsWithAnswers,
      })
    })
  })

  return allPosts
}
