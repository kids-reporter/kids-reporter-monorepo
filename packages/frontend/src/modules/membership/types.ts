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
  birthday: z.string().optional(),
  locationCountry: z.union([z.enum(['taiwan', 'other']), z.literal('')]),
  locationRegion: z.string().optional(),
  identity: z.enum(['student', 'parent', 'teacher', 'public'], {
    message: '請選擇身份別',
  }),
  avatarUrl: z.url().optional(),
})

export type AccountFormData = z.infer<typeof accountFormSchema>
