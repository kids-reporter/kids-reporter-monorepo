import {
  getMemberProfileMeContentApi,
  updateMemberProfileMeContentApi,
} from '@/api/content-api/member-profile'
import type { MemberProfile, MemberProfilePatch } from '@/types/api'

export const getMemberProfileByTwreporterUserId = async ({
  accessToken,
}: {
  twreporterUserId: string
  accessToken: string
}): Promise<MemberProfile | undefined> => {
  return getMemberProfileMeContentApi({ accessToken })
}

export const getMemberProfileByMemberId = async ({
  memberId,
  accessToken,
  abortSignal,
}: {
  memberId: string
  accessToken: string
  abortSignal?: AbortSignal
}): Promise<MemberProfile | undefined> => {
  const me = await getMemberProfileMeContentApi({
    accessToken,
    signal: abortSignal,
  })
  if (me.id === memberId) {
    return me
  }
  return undefined
}

export const updateMemberProfile = async ({
  memberId,
  accessToken,
  data,
}: {
  memberId: string
  accessToken: string
  data: MemberProfilePatch
}): Promise<MemberProfile | undefined> => {
  const updated = await updateMemberProfileMeContentApi({
    accessToken,
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.nickname !== undefined ? { nickname: data.nickname } : {}),
      ...(data.contactEmail !== undefined
        ? { contactEmail: data.contactEmail }
        : {}),
      ...(data.birthday !== undefined ? { birthday: data.birthday } : {}),
      ...(data.locationCountry !== undefined
        ? { locationCountry: data.locationCountry }
        : {}),
      ...(data.locationRegion !== undefined
        ? { locationRegion: data.locationRegion }
        : {}),
      ...(data.identity !== undefined ? { identity: data.identity } : {}),
      ...(data.showBaodaozai !== undefined
        ? { showBaodaozai: data.showBaodaozai }
        : {}),
      ...(data.essayQuestionCount !== undefined
        ? { essayQuestionCount: data.essayQuestionCount }
        : {}),
    },
  })
  if (updated.id !== memberId) {
    return undefined
  }
  return updated
}
