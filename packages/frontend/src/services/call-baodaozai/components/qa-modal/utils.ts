import {
  BaodaozaiChoiceQuestion,
  BaodaozaiQuestion,
  BaodaozaiQuestions,
  QaBaodaozaiState,
} from '../../types'
import { QAModalMode } from './types'

type EssayStep = {
  type: 'essay'
  title: string
  tips: string
  questionIndex: number
  defaultAnswer?: string
  onNext: () => void
  onPass: () => void
}

type ChoiceStep = {
  type: 'choice'
  title: string
  options: BaodaozaiChoiceQuestion['options']
  questionIndex: number
  onNext: () => void
  onPass: () => void
}

type EssayResultStep = {
  type: 'essay-result'
  questionIndex: number
  onNext: () => void
}

type ChoiceResultStep = {
  type: 'choice-result'
  correctAnswerContent: BaodaozaiChoiceQuestion['options'][number]['content']
  correctAnswerIndex: number
  reason: BaodaozaiChoiceQuestion['reason']
  questionIndex: number
  onNext: () => void
}

export type ModalStep =
  | EssayStep
  | ChoiceStep
  | EssayResultStep
  | ChoiceResultStep

const parseQuestionToStep = ({
  question,
  questionIndex,
  isLastQuestion,
  onNext,
  onPass,
  onSubmit,
  mode = 'default',
}: {
  question: BaodaozaiQuestion
  questionIndex: number
  isLastQuestion: boolean
  onNext: () => void
  onPass: (questionIndex: number) => void
  onSubmit: () => void
  mode?: QAModalMode
}): ModalStep => {
  if (question.type === 'essay') {
    return {
      type: 'essay',
      title: question.title,
      tips: question.hint,
      questionIndex,
      onNext: mode === 'update' ? onSubmit : onNext,
      onPass: isLastQuestion ? onSubmit : () => onPass(questionIndex),
      defaultAnswer: question.defaultAnswer,
    }
  }

  return {
    type: 'choice',
    title: question.title,
    options: question.options,
    questionIndex,
    onNext,
    onPass: isLastQuestion ? onSubmit : () => onPass(questionIndex),
  }
}

const parseAnswerToResultStep = ({
  question,
  questionIndex,
  onNext,
  onSubmit,
  isLastQuestion,
}: {
  question: BaodaozaiQuestion
  questionIndex: number
  onNext: () => void
  onSubmit: () => void
  isLastQuestion: boolean
}): ModalStep => {
  if (question.type === 'essay') {
    return {
      type: 'essay-result',
      questionIndex,
      onNext: isLastQuestion ? onSubmit : onNext,
    }
  }

  const correctAnswerIndex = question.options.findIndex(
    (option) => option.isCorrectAnswer
  )

  return {
    type: 'choice-result',
    correctAnswerContent: question.options[correctAnswerIndex].content,
    correctAnswerIndex,
    reason: question.reason,
    questionIndex,
    onNext: isLastQuestion ? onSubmit : onNext,
  }
}

export const getModalStepsFromQuestions = ({
  questions,
  onNext,
  onPass,
  onSubmit,
  mode = 'default',
}: {
  questions: BaodaozaiQuestions
  onNext: () => void
  onPass: (questionIndex: number) => void
  onSubmit: () => void
  mode?: QAModalMode
}): ModalStep[] => {
  return questions.reduce<ModalStep[]>((steps, question, index) => {
    const questionStep = parseQuestionToStep({
      question,
      questionIndex: index,
      isLastQuestion: index === questions.length - 1,
      onNext,
      onPass,
      onSubmit,
      mode,
    })
    if (mode === 'update') {
      return [...steps, questionStep]
    }
    const resultStep = parseAnswerToResultStep({
      question,
      questionIndex: index,
      onNext,
      onSubmit,
      isLastQuestion: index === questions.length - 1,
    })
    return [...steps, questionStep, resultStep]
  }, [])
}

export const getDefaultAnswerFromQuestions = (
  questions: BaodaozaiQuestions
): Record<number, string> => {
  return questions.reduce<Record<number, string>>(
    (answers, question, index) => {
      if (question.type === 'essay' && question.defaultAnswer) {
        return { ...answers, [index]: question.defaultAnswer }
      }
      return answers
    },
    {}
  )
}

export const mapQaActionToEyesAndMouthArtboard = (
  action: QaBaodaozaiState
): { eyes: string; mouth: string } => {
  switch (action) {
    case 'enlighten-ask':
      return { eyes: 'eyes-confuse', mouth: 'mouth-omouth' }
    case 'enlighten-send':
      return { eyes: 'eyes-look-horizontal', mouth: 'mouth-smile' }
    case 'enlighten-fault':
      return { eyes: 'eyes-watery', mouth: 'mouth-smile' }
    case 'enlighten-correct':
      return { eyes: 'eyes-look-horizontal', mouth: 'mouth-teeth' }
    default:
      return { eyes: 'eyes-look-horizontal', mouth: 'mouth-smile' }
  }
}
