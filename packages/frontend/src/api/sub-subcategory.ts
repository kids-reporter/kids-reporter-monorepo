import {
  GetSubSubcategoryPostsQuery,
  GetSubSubcategoryPostsQueryVariables,
} from '__generated__/operations/content.generated'

import { getSubSubcategoryPostsContentApi } from '@/api/content-api/sub-subcategory-posts'
import envVars from '@/environment-variables'
import type { TraceHeaders } from '@/types/trace-headers'
import { firstOrderByEntry } from '@/utils/first-order-by'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getSubSubcategoryPosts = async (
  variables: GetSubSubcategoryPostsQueryVariables,
  traceHeaders?: TraceHeaders
) => {
  const slug = variables.where?.slug
  const order = firstOrderByEntry(variables.orderBy ?? undefined)
  const orderOk =
    !order ||
    (order.publishedDate === 'desc' && !order.id && !order.title && !order.slug)

  if (envVars.useContentApi && slug && orderOk) {
    try {
      return await getSubSubcategoryPostsContentApi({
        slug,
        take: variables.take ?? undefined,
        skip: variables.skip ?? undefined,
        orderBy: 'publishedDate:desc',
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getSubSubcategoryPosts', err)
    }
  }

  const response = await sendRestGqlRequest<GetSubSubcategoryPostsQuery>({
    operation: 'sub-subcategory-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.subSubcategory
}
