import {
  GetPopularKeywordsQuery,
  GetPopularKeywordsQueryVariables,
} from '__generated__/operations/content.generated'

import { getPopularKeywordsContentApi } from '@/api/content-api/popular-keywords'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export const getPopularKeywords = async (
  variables?: GetPopularKeywordsQueryVariables,
  traceHeaders?: Record<string, string>
) => {
  if (envVars.useContentApi) {
    try {
      const keywords = await getPopularKeywordsContentApi({ traceHeaders })
      return keywords as NonNullable<
        GetPopularKeywordsQuery['editorPicksSettings']
      >[number]['popularKeywordsOrdered']
    } catch (err) {
      logContentApiFallback('getPopularKeywords', err)
    }
  }
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
