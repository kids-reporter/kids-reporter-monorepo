import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { updateMemberProfile } from '@/api/member'
import type { MemberProfile, MemberProfilePatch } from '@/types/api'

export const useUpdateMemberProfileMutation = ({
  accessToken,
  memberId,
  options,
}: {
  accessToken: string
  memberId: string
  options?: UseMutationOptions<
    MemberProfile | undefined,
    Error,
    Pick<{ data: MemberProfilePatch }, 'data'>
  >
}) => {
  return useMutation({
    mutationFn: (variables: Pick<{ data: MemberProfilePatch }, 'data'>) =>
      updateMemberProfile({ memberId, accessToken, data: variables.data }),
    ...options,
  })
}
