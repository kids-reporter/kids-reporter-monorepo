import {
  GetCategoryMetadataQuery,
  GetCategoryMetadataQueryVariables,
  GetCategoryPostsQuery,
  GetCategoryPostsQueryVariables,
  GetCategorySubcategoriesAndThemeColorQuery,
  GetCategorySubcategoriesAndThemeColorQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getCategoryPosts = async (
  variables: GetCategoryPostsQueryVariables
) => {
  const response = await sendRestGqlRequest<GetCategoryPostsQuery>({
    operation: 'category-posts',
    method: 'GET',
    variables,
  })
  return response?.data?.data?.category
}

export const getCategoryMetadata = async (
  variables: GetCategoryMetadataQueryVariables
) => {
  const response = await sendRestGqlRequest<GetCategoryMetadataQuery>({
    operation: 'category-metadata',
    method: 'GET',
    variables,
  })
  return response?.data?.data?.category
}

export const getCategorySubcategoriesAndThemeColor = async (
  variables: GetCategorySubcategoriesAndThemeColorQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  const response =
    await sendRestGqlRequest<GetCategorySubcategoriesAndThemeColorQuery>({
      operation: 'category-subcategories-and-theme-color',
      method: 'GET',
      variables,
      traceHeaders,
    })
  return response?.data?.data?.category
}
