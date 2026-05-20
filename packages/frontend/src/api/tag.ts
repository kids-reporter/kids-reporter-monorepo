import {
  GetTagMetaQuery,
  GetTagPostsQuery,
  GetTagPostsQueryVariables,
} from '__generated__/operations/content.generated'

import {
  getTagMetaContentApi,
  getTagPostsContentApi,
} from '@/api/content-api/tag-collection'
import envVars from '@/environment-variables'
import type { TraceHeaders } from '@/types/trace-headers'
import { firstOrderByEntry } from '@/utils/first-order-by'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export async function getTagMetaBySlug({
  slug,
  traceHeaders,
}: {
  slug: string
  traceHeaders?: TraceHeaders
}): Promise<GetTagMetaQuery['tag']> {
  if (envVars.useContentApi) {
    try {
      return await getTagMetaContentApi({ slug, traceHeaders })
    } catch (err) {
      logContentApiFallback('getTagMetaBySlug', err)
    }
  }
  const res = await sendRestGqlRequest<GetTagMetaQuery>({
    operation: 'tag-meta',
    method: 'GET',
    variables: {
      where: {
        slug,
      },
    },
    traceHeaders,
  })

  return res?.data?.data?.tag
}

export async function getTagPostsBySlugPaged(
  variables: GetTagPostsQueryVariables,
  traceHeaders?: TraceHeaders
): Promise<GetTagPostsQuery['tag']> {
  const slug = variables.where?.slug
  const order = firstOrderByEntry(variables.orderBy ?? undefined)
  const orderOk =
    !order ||
    (order.publishedDate === 'desc' && !order.id && !order.title && !order.slug)

  if (envVars.useContentApi && slug && orderOk) {
    try {
      return await getTagPostsContentApi({
        slug,
        take: variables.take ?? undefined,
        skip: variables.skip ?? undefined,
        orderBy: 'publishedDate:desc',
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getTagPostsBySlugPaged', err)
    }
  }

  const res = await sendRestGqlRequest<GetTagPostsQuery>({
    operation: 'tag-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })

  return res?.data?.data?.tag
}
