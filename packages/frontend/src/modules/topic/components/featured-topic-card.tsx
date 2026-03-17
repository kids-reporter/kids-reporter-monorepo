import { Button } from '@kids-reporter/routing-ui'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import { FALLBACK_IMG } from '@/constants'
import { ArrowRight } from '@/icons'
import { getFormattedDate } from '@/utils'

import { TopicSummary } from '../types'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback'),
  { ssr: false }
)

function FeaturedTopicCard({
  topic,
  articleCount,
}: {
  topic: TopicSummary
  articleCount: number
}) {
  const dateStr = getFormattedDate(topic.publishedDate) ?? ''
  const metaText = `${dateStr} 最後更新｜共 ${articleCount} 篇文章`
  return (
    <Link href={topic.url}>
      <div className="group relative h-[300px] w-full overflow-hidden rounded-t-[30px] tablet:h-[360px] tablet:rounded-[30px]">
        <ImageWithFallback
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-120"
          src={topic.image ?? FALLBACK_IMG}
          loading="lazy"
        />
        <p className="text-p2 absolute top-5 left-5 prose-p1 text-white text-shadow-[0_2px_6px_rgba(0,0,0,0.35)] tablet:top-[34px] tablet:left-8 tablet:text-shadow-[0_2px_8px_rgba(0,0,0,0.80)] desktop:top-8 desktop:left-8">
          {metaText}
        </p>
        <div
          className="absolute right-0 bottom-0 left-0 h-36 bg-linear-to-t from-black/50 to-transparent tablet:h-[168px]"
          aria-hidden
        />
        <div className="absolute right-5 bottom-5 left-5 flex flex-col gap-2 tablet:right-8 tablet:bottom-8 tablet:left-8 desktop:right-8 desktop:bottom-8 desktop:left-8">
          <h2 className="prose-h3-small font-swei text-white text-shadow-[0_2px_6px_rgba(0,0,0,0.35)] tablet:prose-h3-large tablet:text-shadow-[0_2px_8px_rgba(0,0,0,0.80)]">
            {topic.title}
          </h2>
          <div className="flex items-center gap-4 tablet:gap-8">
            <p className="line-clamp-3 min-w-0 flex-1 prose-p1 text-white text-shadow-[0_2px_6px_rgba(0,0,0,0.35)] tablet:text-shadow-[0_2px_8px_rgba(0,0,0,0.80)]">
              {topic.desc}
            </p>
            <Button className="size-11 shrink-0 rounded-full border-2 border-neutral-white p-0">
              <ArrowRight />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default FeaturedTopicCard
