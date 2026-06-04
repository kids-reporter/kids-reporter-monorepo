import type { MemberPostWithAnswersItem } from '@/types/api'

import { PostQuestionAnswers } from '../types'

export function parseMemberPostsWithAnswersToPostQuestionAnswers(
  memberPostsWithAnswers: MemberPostWithAnswersItem[]
): PostQuestionAnswers {
  return memberPostsWithAnswers.map((post) => {
    const answers = [...post.choiceAnswers, ...post.essayAnswers]

    return {
      title: post.title,
      slug: post.slug,
      href: `/article/${post.slug}`,
      lastAnsweredTime: post.lastAnsweredTime,
      answers,
    }
  })
}
