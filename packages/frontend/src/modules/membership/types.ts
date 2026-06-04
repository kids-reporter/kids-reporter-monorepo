import { z } from 'zod'

import {
  MemberReadingChoiceAnswer,
  MemberReadingEssayAnswer,
} from '@/types/api'

export type PostQuestionAnswers = {
  title: string
  slug: string
  href: string
  answers: (MemberReadingChoiceAnswer | MemberReadingEssayAnswer)[]
  lastAnsweredTime: string
}[]

export const accountFormSchema = z.object({
  name: z.string().min(1, '請輸入全名'),
  nickname: z.string().optional(),
  contactEmail: z.union([z.email('請輸入有效的電子郵件格式'), z.literal('')]),
  avatarUrl: z.url().optional(),
})

export type AccountFormData = z.infer<typeof accountFormSchema>
