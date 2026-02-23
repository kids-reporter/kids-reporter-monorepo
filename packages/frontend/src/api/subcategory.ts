import {
  GetSubcategoriesQuery,
  GetSubcategoryPostsQuery,
  GetSubcategoryPostsQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getSubcategoryPosts = async (
  variables: GetSubcategoryPostsQueryVariables
) => {
  const response = await sendRestGqlRequest<GetSubcategoryPostsQuery>({
    operation: 'subcategory-posts',
    method: 'GET',
    variables,
  })
  return response?.data?.data?.subcategory
}

export const getSubcategories = async () => {
  const response = await sendRestGqlRequest<GetSubcategoriesQuery>({
    operation: 'subcategories',
    method: 'GET',
  })
  return response?.data?.data?.subcategories
}
