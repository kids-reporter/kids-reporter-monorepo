import {
  GetTagMetaQuery,
  GetTagPostsQuery,
  GetTagPostsQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export async function getTagMetaBySlug({
  slug,
}: {
  slug: string
}): Promise<GetTagMetaQuery['tag']> {
  const res = await sendRestGqlRequest<GetTagMetaQuery>({
    operation: 'tag-meta',
    method: 'GET',
    variables: {
      where: {
        slug,
      },
    },
  })

  return res?.data?.data?.tag
}

export async function getTagPostsBySlugPaged(
  variables: GetTagPostsQueryVariables,
  traceHeaders?: Headers | Record<string, string | undefined>
): Promise<GetTagPostsQuery['tag']> {
  const res = await sendRestGqlRequest<GetTagPostsQuery>({
    operation: 'tag-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })

  return res?.data?.data?.tag
}
