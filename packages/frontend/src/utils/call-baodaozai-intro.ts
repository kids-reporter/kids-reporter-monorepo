import type { CallBaodaozaiIntro } from '@/types/api'

export const DEFAULT_CALL_BAODAOZAI_INTRO: Omit<
  CallBaodaozaiIntro,
  'id' | 'page'
> = {
  content: '',
  buttonStatus: 'showIntro',
  buttonText: '開始介紹',
  buttonUrl: '',
}

export function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function resolveCallBaodaozaiIntro(
  intro?: Partial<CallBaodaozaiIntro> | null
): Pick<
  CallBaodaozaiIntro,
  'content' | 'buttonStatus' | 'buttonText' | 'buttonUrl'
> {
  return {
    content: intro?.content ?? DEFAULT_CALL_BAODAOZAI_INTRO.content,
    buttonStatus:
      intro?.buttonStatus ?? DEFAULT_CALL_BAODAOZAI_INTRO.buttonStatus,
    buttonText: intro?.buttonText || DEFAULT_CALL_BAODAOZAI_INTRO.buttonText,
    buttonUrl: intro?.buttonUrl ?? DEFAULT_CALL_BAODAOZAI_INTRO.buttonUrl,
  }
}
