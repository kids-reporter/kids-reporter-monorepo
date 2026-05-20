import {
  GetCallBaodaozaiIntroQuery,
  GetCallBaodaozaiIntroQueryVariables,
} from '__generated__/operations/content.generated'

import { getCallBaodaozaiIntroContentApi } from '@/api/content-api/call-baodaozai-intro'
import envVars from '@/environment-variables'
import { logContentApiFallback } from '@/utils/log-content-api-fallback'
import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export async function getCallBaodaozaiIntroContent(
  variables: GetCallBaodaozaiIntroQueryVariables,
  traceHeaders?: Record<string, string>
): Promise<string | undefined> {
  if (envVars.useContentApi) {
    const page = variables.where?.page
    if (typeof page === 'string' && page) {
      try {
        return await getCallBaodaozaiIntroContentApi({
          page,
          traceHeaders,
        })
      } catch (err) {
        logContentApiFallback('getCallBaodaozaiIntroContent', err)
      }
    }
  }
  const data = await sendRestGqlRequest<GetCallBaodaozaiIntroQuery>({
    operation: 'call-baodaozai-intro',
    method: 'GET',
    variables,
    traceHeaders,
  })

  return data?.data?.data?.callBaodaozaiIntro?.content ?? undefined
}
