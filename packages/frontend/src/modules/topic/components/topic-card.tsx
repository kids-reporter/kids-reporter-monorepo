import dynamic from 'next/dynamic'
import Link from 'next/link'

import { FALLBACK_IMG } from '@/constants'
import { getFormattedDate } from '@/utils'

import { TopicSummary } from '../types'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback'),
  { ssr: false }
)

function TopicCard({
  url,
  image,
  title,
  publishedDate,
  desc,
  relatedPosts,
}: TopicSummary) {
  const articleCount = relatedPosts?.length ?? 0
  const metaText = `${getFormattedDate(publishedDate) ?? ''} 最後更新｜共 ${articleCount} 篇文章`

  return (
    <Link href={url} className="group block">
      <article className="flex flex-col overflow-hidden rounded-[30px] border-0 bg-neutral-white">
        {/* Image: Figma heights 184 / 191 / 252 / 297; gradient 96px mobile-tablet, 120px desktop+ */}
        <div className="relative h-[184px] w-full shrink-0 overflow-hidden tablet:h-[191px] desktop:h-[252px] hd:h-[297px]">
          <ImageWithFallback
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.2]"
            src={image ?? FALLBACK_IMG}
            loading="lazy"
          />
          <div
            className="pointer-events-none absolute right-0 bottom-0 left-0 h-[96px] bg-linear-to-t from-black/50 to-transparent desktop:h-[120px]"
            aria-hidden
          />
          {/* Title: Figma pb/px mobile 20/20, tablet 20/24, desktop 24/32 */}
          <div className="absolute right-0 bottom-0 left-0 flex items-end px-[20px] pb-[20px] tablet:px-[24px] tablet:pb-[20px] desktop:px-[32px] desktop:pb-[24px]">
            <h2
              className="line-clamp-2 prose-h4-small font-swei! text-neutral-white desktop:prose-h4-large desktop:text-[28px]"
              style={{ textShadow: '0px 2px 3px rgba(0,0,0,0.80)' }}
            >
              {title}
            </h2>
          </div>
        </div>
        {/* Content: Figma p 20 mobile; pt 20 pb 24 px 24 tablet; pt 24 pb 32 px 32 desktop; gap 12px; h-168 desktop */}
        <div className="flex flex-col gap-[12px] p-[20px] tablet:px-[24px] tablet:pt-[20px] tablet:pb-[24px] desktop:h-[168px] desktop:px-[32px] desktop:pt-[24px] desktop:pb-[32px]">
          <div className="flex min-h-0 flex-1 flex-col gap-[8px] desktop:min-h-0">
            <p className="line-clamp-3 min-w-0 overflow-hidden prose-p1 text-ellipsis text-neutral-700">
              {desc}
            </p>
          </div>
          <p className="shrink-0 prose-p2 text-neutral-500">{metaText}</p>
        </div>
      </article>
    </Link>
  )
}

export default TopicCard
