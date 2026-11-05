import Link from 'next/link'

import Divider from '@/components/divider'
import { ArticleShortcutIcon, GroupIcon, LightbulbIcon } from '@/icons'
import { trackMyReadingArticleClick } from '@/utils/gtm'

import { PostQuestionAnswers } from '../../types'
import ChoiceAnswerItem from './choice-answer-item'
import EssayAnswerItem from './essay-answer-item'

type QuestionAnswersListContentProps = {
  answers: PostQuestionAnswers[number]['answers']
  href: string
  articleId: string
  postSlug: string
  position: number
  onBackToFirstPage: (slug: string) => void
}

function QuestionAnswersListContent({
  href,
  answers,
  articleId,
  postSlug,
  position,
  onBackToFirstPage,
}: QuestionAnswersListContentProps) {
  if (answers.length === 0) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <p className="prose-p1 text-neutral-500">尚無回答記錄</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-4">
      {answers.map((answer) => {
        const questionTitle = answer.question?.title
        const isEssayAnswer = 'likesCount' in answer
        const isChoiceAnswer = 'choiceIndex' in answer
        return (
          <div
            key={answer.id}
            className="flex w-full flex-col gap-3 rounded-2xl bg-neutral-200 p-5"
          >
            <div className="flex items-start gap-2">
              <div className="mt-px flex h-6 w-6 shrink-0 items-center justify-center text-neutral-900">
                <LightbulbIcon />
              </div>
              <h3 className="flex-1 prose-p1-bold text-neutral-900">
                {questionTitle}
              </h3>
            </div>

            <div className="flex flex-col gap-3">
              {isEssayAnswer && (
                <EssayAnswerItem
                  answer={answer}
                  postSlug={postSlug}
                  onBackToFirstPage={onBackToFirstPage}
                />
              )}
              {isChoiceAnswer && <ChoiceAnswerItem answer={answer} />}
            </div>
          </div>
        )
      })}
      <div className="mt-3 flex items-center justify-center gap-5">
        <Link
          href={href}
          className="flex items-center gap-1 text-neutral-900 transition-colors duration-200 hover:bg-neutral-white/50 hover:text-red-400 active:text-red-500"
          onClick={() =>
            trackMyReadingArticleClick({
              section: 'answers',
              articleId,
              articleSlug: postSlug,
              position,
            })
          }
        >
          <ArticleShortcutIcon />
          <span>閱讀完整文章</span>
        </Link>
        <Divider direction="vertical" className="h-4 bg-neutral-900" />
        <Link
          href="/idea-hub"
          className="flex items-center gap-1 text-neutral-900 transition-colors duration-200 hover:bg-neutral-white/50 hover:text-red-400 active:text-red-500"
        >
          <GroupIcon />
          <span>前往讀者討論</span>
        </Link>
      </div>
    </div>
  )
}

export default QuestionAnswersListContent
