import { ArticleIntroductionDraftRenderer } from '@kids-reporter/draft-renderer'
import { cn } from '@kids-reporter/routing-ui'
import { RawDraftContentState } from 'draft-js'
import Link from 'next/link'

import Divider from '@/components/divider'
import { FontSizeLevel } from '@/constants'
import { AbstractDecoratorIcon, AbstractDecoratorIconLarge } from '@/icons'
import { getFormattedDate } from '@/utils'

type AuthorGroup = {
  title: string
  authors: {
    name: string
    link: string
  }[]
}

type ArticleSummaryProps = {
  subSubcategoryName: string
  subSubcategoryURL: string
  publishedDate: string
  content: RawDraftContentState
  authors: AuthorGroup[]
  fontSizeLevel: FontSizeLevel
}

function ArticleSummary({
  subSubcategoryName,
  subSubcategoryURL,
  publishedDate,
  content,
  authors,
  fontSizeLevel,
}: ArticleSummaryProps) {
  return (
    <div className="relative mx-4 mt-10 mb-10 flex flex-col gap-4 rounded-3xl bg-neutral-100 p-6 tablet:mx-[93px] tablet:mt-20 tablet:mb-15 tablet:gap-6 tablet:p-9 desktop:p-12">
      <div className="flex items-center justify-between gap-6">
        <Link
          href={subSubcategoryURL}
          className="inline-flex items-center rounded-full bg-red-400 px-3 py-1 prose-p2-bold text-white transition-colors duration-200 hover:bg-red-500"
        >
          {subSubcategoryName}
        </Link>
        <span className="prose-p2 text-neutral-600">
          刊出日期 {getFormattedDate(publishedDate)}
        </span>
      </div>

      <div
        className={cn(
          'prose-article-bold text-neutral-700',
          fontSizeLevel === FontSizeLevel.LARGE && 'text-[22.5px]'
        )}
      >
        <ArticleIntroductionDraftRenderer rawContentState={content} />
      </div>

      <Divider className="bg-neutral-400" />

      {authors.length > 0 && (
        <div className="flex flex-col gap-4">
          {authors.map((authorGroup) => (
            <div key={authorGroup.title} className="flex items-center gap-1">
              <span
                className={cn(
                  'prose-p2 text-neutral-600',
                  fontSizeLevel === FontSizeLevel.LARGE && 'text-[17.5px]'
                )}
              >
                {authorGroup.title}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="15"
                height="13"
                viewBox="0 0 15 13"
                fill="none"
                className="text-neutral-900"
              >
                <path
                  d="M0.703828 11.7031L14.1438 0.703125"
                  stroke="currentColor"
                  strokeLinecap="square"
                />
              </svg>
              <div
                className={cn(
                  'flex flex-wrap items-center gap-0 prose-p2-bold text-neutral-900',
                  fontSizeLevel === FontSizeLevel.LARGE && 'text-[17.5px]'
                )}
              >
                {authorGroup.authors.map((author, authorIndex) => (
                  <span key={author.name}>
                    {author.link ? (
                      <Link
                        href={author.link}
                        className="transition-colors duration-200 hover:underline"
                      >
                        {author.name}
                      </Link>
                    ) : (
                      author.name
                    )}
                    {authorIndex < authorGroup.authors.length - 1 && (
                      <span>、</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="absolute -right-2 -bottom-3 tablet:hidden">
        <AbstractDecoratorIcon />
      </div>
      <div className="absolute -right-4 -bottom-8 hidden tablet:block">
        <AbstractDecoratorIconLarge />
      </div>
    </div>
  )
}

export default ArticleSummary
