import { cn } from '@kids-reporter/routing-ui'

import { TitlePosition } from '../types'

type PositionedTitleProps = {
  title: string
  subtitle?: string
  titlePosition: TitlePosition
  publishedDate: string
  articleCount: number
}

const getTitleClassname = (titlePosition: TitlePosition) => {
  switch (titlePosition) {
    case 'left-center':
      return 'left-6 mr-6 top-1/2 -translate-y-1/2 text-left tablet:left-8 tablet:mr-8 tablet:max-w-[582px] desktop:left-12 desktop:mr-12 desktop:max-w-[608px] hd:left-30 hd:mr-30 hd:max-w-[648px]'
    case 'center-bottom':
      return 'bottom-35 left-1/2 -translate-x-1/2 text-center w-[calc(100%-48px)] tablet:max-w-[582px] tablet:w-[calc(100%-64px)] desktop:bottom-40 desktop:max-w-[608px] desktop:w-[calc(100%-96px)] hd:max-w-[648px] hd:w-[calc(100%-240px)]'
    case 'left-bottom':
      return 'bottom-35 left-6 mr-6 text-left tablet:left-8 tablet:mr-8 tablet:max-w-[582px] desktop:bottom-40 desktop:left-12 desktop:mr-12 desktop:max-w-[608px] hd:left-30 hd:mr-30 hd:max-w-[648px]'
    case 'center':
    default:
      return 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-[calc(100%-48px)] tablet:max-w-[582px] tablet:w-[calc(100%-64px)] desktop:max-w-[608px] desktop:w-[calc(100%-96px)] hd:max-w-[648px] hd:w-[calc(100%-240px)]'
  }
}

function PositionedTitle({
  title,
  subtitle,
  titlePosition,
  publishedDate,
  articleCount,
}: PositionedTitleProps) {
  return (
    <div
      className={cn(
        'absolute text-neutral-white',
        getTitleClassname(titlePosition)
      )}
      style={{
        textShadow: '0 2px 10px rgba(0, 0, 0, 0.60)',
      }}
    >
      {titlePosition.startsWith('left') && (
        <p className="mb-4 prose-p1-bold">{`${publishedDate} 最後更新 | 共 ${articleCount} 篇文章`}</p>
      )}

      <h1 className="mb-2 prose-h1-small font-swei! desktop:prose-h1-large">
        {title}
      </h1>
      {subtitle && (
        <h5 className="prose-h5-small desktop:prose-h5-large">{subtitle}</h5>
      )}
      {!titlePosition.startsWith('left') && (
        <p className="mt-10 prose-p1-bold">{`${publishedDate} 最後更新 | 共 ${articleCount} 篇文章`}</p>
      )}
    </div>
  )
}

export default PositionedTitle
