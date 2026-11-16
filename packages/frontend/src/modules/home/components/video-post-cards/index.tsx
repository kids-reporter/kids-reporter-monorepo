'use client'

import { Button } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import Link from 'next/link'

import { useVideoPostsQuery } from '@/api-utils/react-query/hooks/post'
import VideoPostCard from '@/components/video-post-card'
import { getPostSummaries } from '@/utils'
import { STORYTELLING_VIDEO_PATH } from '@/utils/category'

import VideoPostCardsIllustrations from './illustrations'

const VIDEO_POSTS_TAKE = 3

function VideoPostCards() {
  const { data } = useVideoPostsQuery({
    take: VIDEO_POSTS_TAKE,
    skip: 0,
  })

  if (!data?.posts.length) {
    return null
  }

  const posts = getPostSummaries(data.posts)

  if (posts.length === 0) {
    return null
  }

  return (
    <div className="relative w-full overflow-x-clip">
      <div className="relative z-2 mx-auto w-full max-w-300">
        <div className="mx-6 my-10 h-[2px] bg-[url('/assets/images/home/category/divider.svg')] bg-center bg-repeat-x tablet:mx-8 tablet:my-12 desktop:mx-12 desktop:my-16 hd:mx-14 hd:my-18" />
        <div className="relative">
          <VideoPostCardsIllustrations />
          <h2 className="relative z-2 mb-6 flex w-full items-center justify-center gap-2 prose-h2-small text-neutral-900 tablet:mb-8 desktop:mb-12 desktop:prose-h2-large">
            <Image
              src="/assets/images/home/category/video_icon_s.svg"
              alt="影片"
              width={44}
              height={44}
              className="desktop:hidden"
            />
            <Image
              src="/assets/images/home/category/video_icon_l.svg"
              alt="影片"
              width={64}
              height={64}
              className="hidden desktop:block"
            />
            影片
          </h2>
          <div className="relative z-2 flex w-full snap-x snap-mandatory scroll-px-12 gap-6 overflow-x-auto px-12 pb-2 scrollbar-none tablet:grid tablet:grid-cols-3 tablet:px-6 desktop:scroll-px-8 desktop:gap-8 desktop:px-12 hd:px-14">
            {posts.map((post) => (
              <VideoPostCard
                key={post.url}
                post={post}
                className="w-[calc(100vw-96px)]"
              />
            ))}
          </div>
          <Button
            variant="secondary"
            size={44}
            asChild
            className="relative z-2 mx-auto mt-4 flex w-max tablet:mt-6 desktop:mt-8"
          >
            <Link href={STORYTELLING_VIDEO_PATH}>看全部</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default VideoPostCards
