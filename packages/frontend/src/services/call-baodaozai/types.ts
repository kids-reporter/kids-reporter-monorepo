export type GeneralBaodaozaiState =
  | 'default'
  | 'idle-sleep'
  | 'idle-read'
  | 'idle-enlighten'
  | 'dialog-speaker'
  | 'dialog-read'
  | 'dialog-enlighten'

export type QaBaodaozaiState =
  | 'default'
  | 'enlighten-send'
  | 'enlighten-fault'
  | 'enlighten-correct'
  | 'enlighten-ask'

export type BaodaozaiAction = GeneralBaodaozaiState

export type BaodaozaiActionSetter = ({
  setHide,
  setIsActionEntered,
  setIsIdleReadStoned,
  setAction,
}: {
  setHide: (hide: boolean) => void
  setIsActionEntered: (isEntered: boolean) => void
  setIsIdleReadStoned: (isIdleReadStoned: boolean) => void
  setAction: (action: BaodaozaiAction) => void
}) => void

export type BaodaozaiEssayQuestion = {
  id: string
  type: 'essay'
  title: string
  hint: string
  defaultAnswer?: string
}

export type BaodaozaiChoiceQuestion = {
  id: string
  type: 'choice'
  title: string
  reason: string
  options: {
    content: string
    isCorrectAnswer: boolean
  }[]
}

export type BaodaozaiQuestion = BaodaozaiEssayQuestion | BaodaozaiChoiceQuestion

export type BaodaozaiQuestions = BaodaozaiQuestion[]
