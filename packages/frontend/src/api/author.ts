import { GetAuthorAvatarQuery } from '__generated__/operations/content.generated'

import { DEFAULT_AVATAR } from '@/constants'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export async function getAuthorAvatarBySlug({
  slug,
}: {
  slug: string
}): Promise<string> {
  const res = await sendRestGqlRequest<GetAuthorAvatarQuery>({
    operation: 'author-avatar',
    method: 'GET',
    variables: {
      where: {
        slug,
      },
    },
  })

  return res?.data?.data?.author?.avatar?.resized?.tiny ?? DEFAULT_AVATAR
}
