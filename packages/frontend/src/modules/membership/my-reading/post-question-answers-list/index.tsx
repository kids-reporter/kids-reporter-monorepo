import { cn } from '@kids-reporter/routing-ui'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/accordion'
import { getFormattedDate } from '@/utils/get-formatted-date'

import { PostQuestionAnswers } from '../../types'
import QuestionAnswersListContent from './question-answers-list-content'

type PostQuestionAnswersListProps = {
  postQuestionAnswers: PostQuestionAnswers
  isLoading: boolean
  onBackToFirstPage: (slug: string) => void
  openedAccordionItemValue: string | undefined
}

function PostQuestionAnswersList({
  postQuestionAnswers,
  isLoading,
  onBackToFirstPage,
  openedAccordionItemValue,
}: PostQuestionAnswersListProps) {
  if (isLoading) {
    return (
      <div className="flex min-h-50 w-full items-center justify-center">
        <p className="prose-p1 text-neutral-500">載入中...</p>
      </div>
    )
  }

  if (postQuestionAnswers.length === 0) {
    return (
      <div className="flex w-full items-center justify-center py-[74px]">
        <p className="text-center prose-p1 text-neutral-700">
          你還沒有任何回答紀錄
          <br />
          歡迎前往文章頁進行互動測驗
        </p>
      </div>
    )
  }

  return (
    <Accordion
      type="multiple"
      className="flex w-full flex-col gap-0 border-y-2 border-y-neutral-200"
      defaultValue={
        openedAccordionItemValue ? [openedAccordionItemValue] : undefined
      }
    >
      {postQuestionAnswers.map((group) => {
        return (
          <AccordionItem
            key={group.slug}
            value={group.slug}
            className="border-b-[2px] border-b-neutral-200 last:border-b-0"
          >
            <AccordionTrigger
              className={cn(
                'group flex cursor-pointer items-center gap-4 rounded-none py-5 transition-all duration-300 desktop:px-4',
                'bg-transparent hover:bg-black/5 active:bg-black/10',
                'focus-visible:outline-none'
              )}
            >
              <div className="flex flex-1 flex-col gap-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="prose-p2 text-neutral-500">
                    {getFormattedDate(group.lastAnsweredTime, '/')}
                  </span>
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 prose-p3-bold transition-all duration-300 group-hover:bg-neutral-300 group-active:bg-neutral-300',
                      'bg-neutral-200 text-neutral-600'
                    )}
                  >
                    共作答 {group.answers.length} 題
                  </span>
                </div>
                <h3 className="prose-p1-bold text-neutral-900 desktop:prose-h6-large">
                  {group.title}
                </h3>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-10">
              <QuestionAnswersListContent
                href={group.href}
                answers={group.answers}
                postSlug={group.slug}
                onBackToFirstPage={onBackToFirstPage}
              />
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}

export default PostQuestionAnswersList
