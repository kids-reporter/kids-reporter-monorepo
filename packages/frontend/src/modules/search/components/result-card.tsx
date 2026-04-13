import { cn } from '@kids-reporter/routing-ui'
import Link from 'next/link'

import { Loading } from '@/components/types'
import { ContentType } from '@/constants'
import { getFormattedDate } from '@/utils'

import type { SearchCardContent } from '../types'

const fallbackImg = '/assets/images/404.png'

function ResultCard({ content }: { content: SearchCardContent }) {
  if (!content?.url) {
    return null
  }

  const dateText = content.publishedDate
    ? getFormattedDate(content.publishedDate)
    : ''
  const countText =
    content?.postCount !== undefined && content.postCount > 0
      ? `共 ${content.postCount} 篇文章`
      : ''
  const topicMetaText =
    content.type === ContentType.TOPIC && dateText && countText
      ? `${dateText} 最後更新｜${countText}`
      : ''

  const isTagOrAuthor =
    content.type === ContentType.TAG || content.type === ContentType.AUTHOR

  return (
    <Link
      href={content.url}
      className="group flex w-full flex-col items-start gap-3 tablet:flex-row tablet:gap-6"
    >
      <div className="order-2 flex w-full min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          {content.category ? (
            <span className="inline-flex items-center rounded-full bg-neutral-200 px-3 py-1 prose-p2-bold text-neutral-900">
              {content.category}
            </span>
          ) : null}

          {content.type === ContentType.TOPIC ? (
            topicMetaText ? (
              <span className="prose-p2 text-neutral-500">{topicMetaText}</span>
            ) : null
          ) : dateText ? (
            <span className="prose-p2 text-neutral-500">{dateText}</span>
          ) : countText ? (
            <span className="prose-p2 text-neutral-500">{countText}</span>
          ) : null}

          {content.type !== ContentType.TOPIC && dateText && countText ? (
            <>
              <span className="prose-p2 text-neutral-500" aria-hidden="true">
                {'｜'}
              </span>
              <span className="prose-p2 text-neutral-500">{countText}</span>
            </>
          ) : null}
        </div>

        <div className="flex min-w-0 flex-col gap-1">
          <h2
            className={cn(
              isTagOrAuthor ? 'line-clamp-1' : 'line-clamp-2',
              'w-full overflow-hidden text-left prose-h5-small tracking-[1px] text-neutral-900 transition-colors duration-300 group-hover:text-red-400 tablet:prose-h5-large'
            )}
          >
            {content.type === ContentType.TAG ? '#' : ''}
            {content.title}
          </h2>
          {content.desc ? (
            <p
              className={cn(
                isTagOrAuthor ? 'line-clamp-3' : 'line-clamp-2',
                'w-full overflow-hidden text-left prose-p1 tracking-[0.8px] text-neutral-700'
              )}
            >
              {content.desc}
            </p>
          ) : null}
        </div>
      </div>

      <div className="relative order-1 h-[183px] w-full shrink-0 overflow-hidden rounded-[40px] tablet:order-3 tablet:h-[160px] tablet:w-[284px] tablet:rounded-2xl">
        <img
          className="size-full object-cover transition-transform duration-300 group-hover:scale-120"
          src={content.image ?? fallbackImg}
          loading={Loading.LAZY}
          alt=""
        />
        {content?.postCount !== undefined && content.postCount > 0 ? (
          <img
            className="absolute top-[9px] right-[9px] size-11 tablet:top-2 tablet:right-2 tablet:size-10"
            src="/assets/images/multiple_articles.svg"
            loading={Loading.LAZY}
            alt=""
          />
        ) : null}
      </div>
    </Link>
  )
}

export default ResultCard
