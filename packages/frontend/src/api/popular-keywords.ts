import {
  GetPopularKeywordsQuery,
  GetPopularKeywordsQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getPopularKeywords = async (
  variables?: GetPopularKeywordsQueryVariables
) => {
  const response = await sendRestGqlRequest<GetPopularKeywordsQuery>({
    operation: 'popular-keywords',
    method: 'GET',
    variables: variables ?? {},
  })
  return response?.data?.data?.popularKeywords
}
