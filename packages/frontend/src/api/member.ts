import {
  GetMemberProfileQuery,
  GetMemberProfileQueryVariables,
  UpdateMemberProfileMutation,
  UpdateMemberProfileMutationVariables,
} from '__generated__/operations/members.generated'

import {
  getMemberProfileMeContentApi,
  updateMemberProfileMeContentApi,
} from '@/api/content-api/member-profile'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getMemberProfileByTwreporterUserId = async ({
  twreporterUserId,
  accessToken,
}: {
  twreporterUserId: string
  accessToken: string
}) => {
  if (envVars.useContentApi) {
    try {
      return await getMemberProfileMeContentApi({ accessToken })
    } catch (err) {
      logContentApiFallback('getMemberProfileByTwreporterUserId', err)
    }
  }

  const variables: GetMemberProfileQueryVariables = {
    where: {
      twreporter_user_id: twreporterUserId,
    },
  }

  const response = await sendRestGqlRequest<GetMemberProfileQuery>({
    operation: 'member-profile',
    method: 'GET',
    variables,
    authToken: accessToken,
  })

  return response?.data?.data?.member
}

export const getMemberProfileByMemberId = async ({
  memberId,
  accessToken,
  abortSignal,
}: {
  memberId: string
  accessToken: string
  abortSignal?: AbortSignal
}) => {
  if (envVars.useContentApi) {
    try {
      const me = await getMemberProfileMeContentApi({
        accessToken,
        signal: abortSignal,
      })
      if (me.id === memberId) {
        return me
      }
      logContentApiFallback(
        'getMemberProfileByMemberId',
        new Error('content-api /v1/members/me id mismatch; using gateway')
      )
    } catch (err) {
      logContentApiFallback('getMemberProfileByMemberId', err)
    }
  }

  const variables: GetMemberProfileQueryVariables = {
    where: {
      id: memberId,
    },
  }

  const response = await sendRestGqlRequest<GetMemberProfileQuery>({
    operation: 'member-profile',
    method: 'GET',
    variables,
    authToken: accessToken,
    signal: abortSignal,
  })

  return response?.data?.data?.member
}

export const updateMemberProfile = async ({
  memberId,
  accessToken,
  data,
}: {
  memberId: string
  accessToken: string
  data: UpdateMemberProfileMutationVariables['data']
}) => {
  if (envVars.useContentApi) {
    try {
      const updated = await updateMemberProfileMeContentApi({
        accessToken,
        data: {
          ...(data.name !== undefined ? { name: data.name } : {}),
          ...(data.nickname !== undefined ? { nickname: data.nickname } : {}),
          ...(data.contactEmail !== undefined
            ? { contactEmail: data.contactEmail }
            : {}),
          ...(data.showBaodaozai !== undefined
            ? { showBaodaozai: data.showBaodaozai }
            : {}),
          ...(data.essayQuestionCount !== undefined
            ? { essayQuestionCount: data.essayQuestionCount }
            : {}),
        },
      })
      if (updated.id !== memberId) {
        logContentApiFallback(
          'updateMemberProfile',
          new Error(
            'content-api PATCH /v1/members/me id mismatch; using gateway'
          )
        )
      } else {
        return {
          updateMember: {
            id: updated.id,
            name: updated.name,
            nickname: updated.nickname,
            contactEmail: updated.contactEmail,
            showBaodaozai: updated.showBaodaozai,
            essayQuestionCount: updated.essayQuestionCount,
            avatar: updated.avatar ? { id: updated.avatar.id } : null,
          },
        } as UpdateMemberProfileMutation
      }
    } catch (err) {
      logContentApiFallback('updateMemberProfile', err)
    }
  }

  const response = await sendRestGqlRequest<UpdateMemberProfileMutation>({
    operation: 'update-member-profile',
    method: 'POST',
    variables: {
      where: { id: memberId },
      data,
    },
    authToken: accessToken,
  })

  return response?.data?.data
}
