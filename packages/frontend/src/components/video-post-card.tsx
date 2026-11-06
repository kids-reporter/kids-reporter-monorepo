import { cn } from '@kids-reporter/routing-ui'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import { FALLBACK_IMG } from '@/constants'
import { PlayIcon, PlayIconLarge } from '@/icons'
import { formatVideoDurationLabel } from '@/utils/format-video-duration'

import { PostSummary } from './types'

const ImageWithFallback = dynamic(
  () => import('@/components/image-with-fallback')
)

type VideoPostCardProps = {
  post: PostSummary
  className?: string
}

function VideoPostCard({ post, className }: VideoPostCardProps) {
  const durationLabel = formatVideoDurationLabel(post.videoDuration ?? '')
  const classNames = 'group relative flex h-full flex-col'
  const body = (
    <div className="flex h-full flex-col overflow-hidden rounded-[30px] bg-white shadow-[0px_4px_10px_rgba(0,0,0,0.05)]">
      <div className="relative aspect-video w-full overflow-hidden rounded-t-[30px]">
        <ImageWithFallback
          src={post.image ?? FALLBACK_IMG}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-120"
        />
        <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <PlayIcon className="desktop:hidden" />
          <PlayIconLarge className="hidden desktop:block" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4 tablet:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-[30px] bg-neutral-200 px-2 py-1 prose-p3 tablet:px-2.5 tablet:py-1.5 desktop:prose-p2">
            影片
          </span>
          {durationLabel ? (
            <span className="prose-p3 text-neutral-500 desktop:prose-p2">
              {durationLabel}
            </span>
          ) : null}
        </div>
        <h3 className="line-clamp-2 prose-h5-small text-neutral-900 not-italic transition-colors duration-300 group-hover:text-red-400 desktop:prose-h5-large">
          {post.title}
        </h3>
        <p className="line-clamp-4 prose-p2 text-neutral-600 desktop:prose-p1">
          {post.desc}
        </p>
      </div>
    </div>
  )

  return (
    <div
      className={cn(
        'min-h-30 w-[calc(100vw-48px)] flex-shrink-0 snap-start tablet:min-h-auto tablet:w-auto',
        className
      )}
    >
      {post.externalUrl ? (
        <a
          href={post.externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={classNames}
        >
          {body}
        </a>
      ) : (
        <Link href={post.url} className={classNames}>
          {body}
        </Link>
      )}
    </div>
  )
}

export default VideoPostCard
