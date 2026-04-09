import Link from 'next/link'

import { Loading, PostSummary } from '@/components/types'
import { ContentType } from '@/constants'
import { getFormattedDate } from '@/utils'

import styles from './card.module.css'

const fallbackImg = '/assets/images/404.png'

export type CardProp = {
  className?: string
  content: PostSummary & { type: ContentType; postCount: number }
}

export const Card = ({ className, content }: CardProp) => {
  const top = (
    <div className="flex flex-row">
      <span
        style={{ color: 'var(--theme-color)', lineHeight: '160%' }}
        className="text-left text-sm font-medium tracking-wider md:text-base"
      >
        {content.category}
      </span>
      {content.publishedDate || content.postCount > 0 ? (
        <span
          className="text-sm md:text-base"
          style={{ color: '#A3A3A3', letterSpacing: '0.08em' }}
        >
          ｜
        </span>
      ) : null}
      {content.publishedDate ? (
        <span
          className="text-sm md:text-base"
          style={{ color: '#A3A3A3', letterSpacing: '0.08em' }}
        >
          {`${getFormattedDate(content.publishedDate)}${
            content.type === ContentType.TOPIC ? ' 最後更新·' : ''
          }`}
        </span>
      ) : null}
      {content?.postCount !== undefined && content.postCount > 0 ? (
        <span
          className="text-sm md:text-base"
          style={{ color: '#A3A3A3', letterSpacing: '0.08em' }}
        >
          {`共 ${content.postCount} 篇文章`}
        </span>
      ) : null}
    </div>
  )

  const title = (
    <span
      style={{
        minHeight: 'auto',
        lineHeight: '160%',
        letterSpacing: '0.08em',
      }}
      className={`${styles.title} overflow-hidden text-left text-xl font-bold text-gray-900 not-italic md:min-h-16 md:text-2xl`}
    >
      {content?.type === ContentType.TAG ? '#' : ''}
      {content?.title}
    </span>
  )

  const desc = (
    <span
      style={{
        lineHeight: '160%',
      }}
      className={`${styles.desc} overflow-hidden text-left text-base font-medium tracking-wider text-gray-900 not-italic`}
    >
      {content.desc}
    </span>
  )

  const textPart = (
    <div className="flex flex-col justify-start gap-1 md:gap-1.5">
      {top}
      {title}
      {desc}
    </div>
  )

  const imagePart = (
    <div
      style={{ aspectRatio: '16/9' }}
      className="relative h-full max-w-full shrink-0 overflow-hidden rounded-2xl md:h-40"
    >
      <img
        style={{ borderRadius: '20px' }}
        className={`h-full w-full object-cover align-middle hover:scale-125`}
        src={content.image ?? fallbackImg}
        loading={Loading.LAZY}
      />
      {content?.postCount !== undefined && content.postCount > 0 && (
        <img
          className="absolute top-2 right-2"
          src="/assets/images/multiple_articles.png"
          loading={Loading.LAZY}
        />
      )}
    </div>
  )

  return (
    content && (
      <Link
        href={content.url}
        className={`flex w-full flex-col-reverse justify-start gap-3 rounded-2xl bg-transparent md:flex-row md:gap-5 md:gap-6 ${className ?? ''}`}
      >
        {textPart}
        {imagePart}
      </Link>
    )
  )
}

export default Card
