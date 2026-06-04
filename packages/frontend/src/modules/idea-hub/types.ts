import type { PostsEssayAnswersWithLikesPost } from '@/types/api'
import { RecursiveNonNullable } from '@/types/utils'

export type IdeaHubPostWithAnswers =
  RecursiveNonNullable<PostsEssayAnswersWithLikesPost>

export type PostWithTwoTopLikesAnswersPerQuestion = {
  posts: IdeaHubPostWithAnswers[]
}
