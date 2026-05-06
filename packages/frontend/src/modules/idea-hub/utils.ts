import { Member } from '__generated__/types'

import { DEFAULT_TEXT_HOLDER } from '@/constants/input-field'
import maskEmail from '@/utils/mask-email'

type MemberDisplay = Partial<Pick<Member, 'nickname' | 'name' | 'email'>>

export const getMemberDisplayName = (
  member: MemberDisplay | undefined,
  shouldMaskEmail = false
) => {
  if (!member) return DEFAULT_TEXT_HOLDER
  if (member.nickname) {
    return member.nickname
  }
  if (member.name) {
    return member.name
  }
  if (member.email) {
    return shouldMaskEmail ? maskEmail(member.email) : member.email
  }
  return DEFAULT_TEXT_HOLDER
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
