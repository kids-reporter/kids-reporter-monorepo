import { getCallBaodaozaiIntroApi } from '@/api/content-api/call-baodaozai-intro'
import type {
  CallBaodaozaiIntro,
  CallBaodaozaiIntroPageType,
} from '@/types/api'

export async function getCallBaodaozaiIntro(
  variables: { page: CallBaodaozaiIntroPageType },
  traceHeaders?: Record<string, string>
): Promise<CallBaodaozaiIntro | undefined> {
  const { page } = variables
  if (typeof page !== 'string' || !page) {
    return undefined
  }
  return getCallBaodaozaiIntroApi({ page, traceHeaders })
}
