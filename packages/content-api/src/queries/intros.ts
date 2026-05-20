import {
  V1CallBaodaozaiIntroPathParamsSchema,
  V1CallBaodaozaiIntroResponseSchema,
} from '@kids-reporter/api-types'
import { prisma } from '@kids-reporter/db'
import type { z } from 'zod'

type CallBaodaozaiIntroPage = z.infer<
  typeof V1CallBaodaozaiIntroPathParamsSchema
>['page']

type V1CallBaodaozaiIntroResponse = z.infer<
  typeof V1CallBaodaozaiIntroResponseSchema
>

/** `GET /v1/call-baodaozai-intros/:page` */
export async function fetchCallBaodaozaiIntro(
  page: CallBaodaozaiIntroPage
): Promise<V1CallBaodaozaiIntroResponse | null> {
  const intro = await prisma.callBaodaozaiIntro.findFirst({
    where: { page },
    select: { id: true, page: true, content: true },
  })
  if (!intro) return null
  const result = {
    id: intro.id,
    page: intro.page,
    content: intro.content,
  }
  return result
}
