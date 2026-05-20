type MemberPostWithAnswersPost = {
  id: string
  title: string
  slug: string
  publishedDate: string
  essayAnswers: {
    id: string
    content: string
    likesCount: number
    createdAt: string
    updatedAt: string
    question: {
      id: string
      title: string
      hint: string | null
      post: {
        id: string
      }
    }
  }[]
  choiceAnswers: {
    id: string
    choiceIndex: number
    correct: boolean
    createdAt: string
    updatedAt: string
    question: {
      id: string
      title: string
      options: { content: string; isCorrectAnswer: boolean }[]
      reason: string | null
      post: {
        id: string
      }
    }
  }[]
  lastAnsweredTime: string
}

/** Content API: flat `{ posts, nextCursor }`. GraphQL: nested under `getMemberPostsWithAnswers`. */
export type MemberPostsWithAnswersPayload = {
  posts: MemberPostWithAnswersPost[]
  nextCursor: string | null
}

/** Gateway GraphQL response shape (wrapping key). */
export type GetMemberPostsWithAnswersQuerySchema = {
  getMemberPostsWithAnswers: MemberPostsWithAnswersPayload
}
