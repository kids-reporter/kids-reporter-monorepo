import { Member } from '__generated__/types'

import { DEFAULT_TEXT_HOLDER } from '@/constants/input-field'

type MemberDisplay = Partial<Pick<Member, 'nickname' | 'name' | 'email'>>

export const getMemberDisplayName = (member: MemberDisplay | undefined) => {
  if (!member) return DEFAULT_TEXT_HOLDER
  return member.nickname || member.name || member.email || DEFAULT_TEXT_HOLDER
}

export const formatChineseDate = (dateStr: string) => {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  return date.getMonth() + 1 + '月' + date.getDate() + '日'
}

export const getDisplayLikesCount = (likesCount: number | null | undefined) => {
  if (!likesCount) return '0'
  if (likesCount > 99) return '99+'
  return likesCount > 0 ? likesCount.toString() : '0'
}
