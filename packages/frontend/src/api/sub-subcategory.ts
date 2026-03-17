import {
  GetSubSubcategoryPostsQuery,
  GetSubSubcategoryPostsQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getSubSubcategoryPosts = async (
  variables: GetSubSubcategoryPostsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  const response = await sendRestGqlRequest<GetSubSubcategoryPostsQuery>({
    operation: 'sub-subcategory-posts',
    method: 'GET',
    variables,
    traceHeaders,
  })
  return response?.data?.data?.subSubcategory
}
