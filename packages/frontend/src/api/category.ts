import {
  GetCategoryMetadataQuery,
  GetCategoryMetadataQueryVariables,
  GetCategoryPostsQuery,
  GetCategoryPostsQueryVariables,
  GetCategorySubcategoriesAndThemeColorQuery,
  GetCategorySubcategoriesAndThemeColorQueryVariables,
} from '__generated__/operations/content.generated'

import {
  getCategoryMetadataContentApi,
  getCategoryPostsContentApi,
  getCategorySubcategoriesThemeContentApi,
} from '@/api/content-api/category-collection'
import envVars from '@/environment-variables'
import type { TraceHeaders } from '@/types/trace-headers'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getCategoryPosts = async (
  variables: GetCategoryPostsQueryVariables,
  traceHeaders?: TraceHeaders
) => {
  const slug = variables.where?.slug
  if (envVars.useContentApi && slug) {
    try {
      return await getCategoryPostsContentApi({
        slug,
        take: variables.take ?? undefined,
        skip: variables.skip ?? undefined,
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getCategoryPosts', err)
    }
  }
  const response = await sendRestGqlRequest<GetCategoryPostsQuery>({
    operation: 'category-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.category
}

export const getCategoryMetadata = async (
  variables: GetCategoryMetadataQueryVariables,
  traceHeaders?: TraceHeaders
) => {
  const slug = variables.categoryWhere?.slug
  const subRaw = variables.subcategoryWhere?.slug
  const subcategorySlug =
    subRaw && typeof subRaw === 'object' && 'equals' in subRaw
      ? (subRaw as { equals?: string }).equals
      : undefined
  if (envVars.useContentApi && slug) {
    try {
      return await getCategoryMetadataContentApi({
        slug,
        subcategorySlug: subcategorySlug ?? undefined,
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getCategoryMetadata', err)
    }
  }
  const response = await sendRestGqlRequest<GetCategoryMetadataQuery>({
    operation: 'category-metadata',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.category
}

export const getCategorySubcategoriesAndThemeColor = async (
  variables: GetCategorySubcategoriesAndThemeColorQueryVariables,
  traceHeaders?: TraceHeaders
) => {
  const slug = variables.where?.slug
  if (envVars.useContentApi && slug) {
    try {
      return await getCategorySubcategoriesThemeContentApi({
        slug,
        traceHeaders,
      })
    } catch (err) {
      logContentApiFallback('getCategorySubcategoriesAndThemeColor', err)
    }
  }
  const response =
    await sendRestGqlRequest<GetCategorySubcategoriesAndThemeColorQuery>({
      operation: 'category-subcategories-and-theme-color',
      method: 'GET',
      variables,
      traceHeaders,
    })
  return response?.data?.data?.category
}
