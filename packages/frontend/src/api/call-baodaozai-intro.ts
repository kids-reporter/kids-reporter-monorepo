import { getCallBaodaozaiIntroContentApi } from '@/api/content-api/call-baodaozai-intro'
import type { CallBaodaozaiIntroPageType } from '@/types/api'

export async function getCallBaodaozaiIntroContent(
  variables: { page: CallBaodaozaiIntroPageType },
  traceHeaders?: Record<string, string>
): Promise<string | undefined> {
  const { page } = variables
  if (typeof page !== 'string' || !page) {
    return undefined
  }
  return getCallBaodaozaiIntroContentApi({ page, traceHeaders })
}
