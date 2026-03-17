import {
  GetCallBaodaozaiIntroQuery,
  GetCallBaodaozaiIntroQueryVariables,
} from '__generated__/operations/content.generated'

import { sendRestGqlRequest } from '@/utils/send-rest-gql'

export async function getCallBaodaozaiIntroContent(
  variables: GetCallBaodaozaiIntroQueryVariables,
  traceHeaders?: Record<string, string>
): Promise<string | undefined> {
  const data = await sendRestGqlRequest<GetCallBaodaozaiIntroQuery>({
    operation: 'call-baodaozai-intro',
    method: 'GET',
    variables,
    traceHeaders,
  })

  return data?.data?.data?.callBaodaozaiIntro?.content ?? undefined
}
