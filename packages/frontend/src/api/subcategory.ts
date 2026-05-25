import {
  GetSubcategoriesQuery,
  GetSubcategoryPostsQuery,
  GetSubcategoryPostsQueryVariables,
} from '__generated__/operations/content.generated'

import { getSubcategoriesContentApi } from '@/api/content-api/subcategories'
import { getSubcategoryPostsContentApi } from '@/api/content-api/subcategory-posts'
import envVars from '@/environment-variables'
import type { TraceHeaders } from '@/types/trace-headers'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getSubcategoryPosts = async (
  variables: GetSubcategoryPostsQueryVariables,
  traceHeaders?: TraceHeaders
) => {
  const slug = variables.where?.slug
  if (envVars.useContentApi && slug) {
    try {
      return await getSubcategoryPostsContentApi({
        slug,
        take: variables.take ?? undefined,
        skip: variables.skip ?? undefined,
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getSubcategoryPosts', err)
    }
  }
  const response = await sendRestGqlRequest<GetSubcategoryPostsQuery>({
    operation: 'subcategory-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.subcategory
}

export const getSubcategories = async (traceHeaders?: TraceHeaders) => {
  if (envVars.useContentApi) {
    try {
      return await getSubcategoriesContentApi({ traceHeaders })
    } catch (err) {
      logContentApiFallback('getSubcategories', err)
    }
  }

  const response = await sendRestGqlRequest<GetSubcategoriesQuery>({
    operation: 'subcategories',
    method: 'GET',
    traceHeaders,
  })
  return response?.data?.data?.subcategories
}
