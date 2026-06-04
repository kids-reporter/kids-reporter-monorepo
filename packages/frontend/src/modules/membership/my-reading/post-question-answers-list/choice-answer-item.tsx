import { cn } from '@kids-reporter/routing-ui'

import { CorrectIcon, IncorrectIcon } from '@/icons/miscellaneous'
import type { MemberReadingChoiceAnswer } from '@/types/api'

function ChoiceAnswerItem({ answer }: { answer: MemberReadingChoiceAnswer }) {
  const options =
    answer.question?.options && Array.isArray(answer.question.options)
      ? (answer.question.options as Array<{
          content: string
          isCorrectAnswer: boolean
        }>)
      : []
  const selectedOption =
    answer.choiceIndex !== null && answer.choiceIndex !== undefined
      ? options[answer.choiceIndex]
      : null
  const correctOptionIndex = options.findIndex((opt) => opt.isCorrectAnswer)

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <div
          className={cn(
            'flex h-auto min-h-[58px] w-[58px] shrink-0 items-center justify-center rounded-l-xl',
            answer.correct ? 'bg-yellow-400' : 'bg-[#C20D23]'
          )}
        >
          <div className="text-white">
            {answer.correct ? <CorrectIcon /> : <IncorrectIcon />}
          </div>
        </div>
        <div className="flex flex-1 items-center rounded-r-xl bg-white px-4 py-4">
          <p className="prose-p1-medium text-neutral-900">
            {selectedOption
              ? `${(answer.choiceIndex ?? 0) + 1}. ${selectedOption.content}`
              : '未選擇'}
          </p>
        </div>
      </div>

      {!answer.correct && answer.question && correctOptionIndex >= 0 && (
        <div className="mt-3 flex flex-col gap-1">
          <p className="prose-p2-bold text-neutral-900">
            正確答案：
            {correctOptionIndex + 1}. {options[correctOptionIndex]?.content}
          </p>
          <p className="prose-p2 text-neutral-800">
            {String(answer.question?.reason ?? '')}
          </p>
        </div>
      )}
    </div>
  )
}

export default ChoiceAnswerItem
