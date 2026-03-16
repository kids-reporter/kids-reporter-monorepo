'use client'
import { Button } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import Link from 'next/link'

import ImageWithFallback from '@/components/image-with-fallback'

type TopicCardProp = {
  url: string
  image: string
  title: string
  subtitle: string
}

function TopicCard({ url, image, title, subtitle }: TopicCardProp) {
  return (
    <div className="relative mx-auto flex h-full w-[calc(100%-48px)] flex-col overflow-hidden rounded-[40px] bg-neutral-white px-5 pt-5 pb-20 tablet:w-160 tablet:flex-row tablet:gap-6 tablet:rounded-[64px] tablet:px-10 tablet:py-12 desktop:w-208 desktop:gap-10 desktop:rounded-[80px] desktop:px-14 desktop:py-18 hd:w-272 hd:rounded-[96px] hd:px-14 hd:py-24">
      <ImageWithFallback
        className="aspect-[287/162] w-full rounded-[24px] object-cover tablet:h-[171px] tablet:w-[304px] desktop:h-[234px] desktop:w-[416px] desktop:rounded-[32px] hd:h-[300px] hd:w-[533px]"
        src={image}
      />

      <div className="mt-5 flex flex-1 flex-col tablet:mt-0 tablet:h-59 desktop:h-72">
        <div className="mb-2 flex items-center gap-2 desktop:mb-3 desktop:gap-3">
          <Image
            className="desktop:hidden"
            src={'/assets/images/home/topic_icon.svg'}
            loading="eager"
            alt="專題"
            width={32}
            height={32}
          />
          <Image
            className="hidden desktop:block"
            src={'/assets/images/home/topic_icon_large.svg'}
            loading="eager"
            alt="專題"
            width={40}
            height={40}
          />
          <h6 className="prose-h6-small text-neutral-900 desktop:prose-h5-large">
            專題
          </h6>
        </div>

        <h3 className="mb-2 line-clamp-2 prose-h3-small font-swei! text-neutral-900 desktop:mb-3 desktop:prose-h4-large hd:prose-h3-large">
          {title}
        </h3>
        <p className="line-clamp-2 prose-p1-bold desktop:prose-h6-large">
          {subtitle}
        </p>

        <Button
          variant="secondary"
          size={44}
          asChild
          className="mt-4 w-max desktop:mt-8 hd:mt-auto"
        >
          <Link href={url}>了解更多</Link>
        </Button>
      </div>
    </div>
  )
}

export default TopicCard
