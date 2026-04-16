import {
  GetPopularKeywordsQuery,
  GetPopularKeywordsQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getPopularKeywords = async (
  variables?: GetPopularKeywordsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  const response = await sendRestGqlRequest<GetPopularKeywordsQuery>({
    operation: 'popular-keywords',
    method: 'GET',
    variables: variables ?? {},
    traceHeaders,
  })
  return (
    response?.data?.data?.editorPicksSettings?.[0]?.popularKeywordsOrdered ?? []
  )
}
