import {
  GetAuthorAvatarQuery,
  GetAuthorMetaQuery,
  GetAuthorPostsQuery,
  GetAuthorPostsQueryVariables,
} from '__generated__/operations/content.generated'

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

export async function getAuthorMetaBySlug({
  slug,
}: {
  slug: string
}): Promise<GetAuthorMetaQuery['author']> {
  const res = await sendRestGqlRequest<GetAuthorMetaQuery>({
    operation: 'author-meta',
    method: 'GET',
    variables: {
      where: {
        slug,
      },
    },
  })

  return res?.data?.data?.author
}

export async function getAuthorPostsBySlugPaged(
  variables: GetAuthorPostsQueryVariables,
  traceHeaders?: Headers | Record<string, string | undefined>
): Promise<GetAuthorPostsQuery['author']> {
  const res = await sendRestGqlRequest<GetAuthorPostsQuery>({
    operation: 'author-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })

  return res?.data?.data?.author
}
