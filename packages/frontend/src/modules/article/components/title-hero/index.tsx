import { cn } from '@kids-reporter/routing-ui'
import Image from 'next/image'
import Link from 'next/link'
import { ComponentProps } from 'react'

import { FontSizeLevel } from '@/constants'

import HeroImage from './hero-image'

type TitleHeroProps = {
  topicBreadcrumb?: {
    title: string
    link: string
  }
  heroImageProps: ComponentProps<typeof HeroImage>
  title: string
  subtitle?: string
  fontSizeLevel: FontSizeLevel
}

function TitleHero({
  topicBreadcrumb,
  heroImageProps,
  title,
  subtitle,
  fontSizeLevel,
}: TitleHeroProps) {
  return (
    <div className="mt-6 desktop:mt-10 hd:mt-12">
      <div className="flex max-w-[790px] flex-col tablet:mx-[129px] desktop:w-[672px] hd:mx-auto hd:w-auto">
        {topicBreadcrumb && (
          <Link
            href={topicBreadcrumb.link}
            className="group relative mb-6 flex w-min items-center gap-2 bg-blue-100 py-2 pl-6 transition-colors duration-200 hover:bg-blue-200 tablet:rounded-l-[8px] tablet:pl-2 hd:mb-8"
          >
            <div className="flex size-8 items-center justify-center">
              <Image
                src="/assets/images/article/topic-breadcrumb.svg"
                alt="topic-breadcrumb-icon"
                width={23}
                height={27}
                loading="lazy"
              />
            </div>
            <span className="pr-2 prose-p1-bold text-nowrap">
              {topicBreadcrumb.title}
            </span>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="25"
              height="48"
              viewBox="0 0 25 48"
              fill="none"
              className="absolute top-0 -right-6 text-blue-100 transition-colors duration-200 group-hover:text-blue-200"
            >
              <path
                d="M0 0H0.686291C2.80802 0 4.84285 0.842855 6.34315 2.34315L22.3431 18.3431C25.4673 21.4673 25.4673 26.5327 22.3431 29.6569L6.34315 45.6569C4.84286 47.1571 2.80802 48 0.686291 48H0V0Z"
                fill="currentColor"
              />
            </svg>
          </Link>
        )}
        <header className="mx-6 flex flex-col gap-1 tablet:mx-0 tablet:gap-2">
          {subtitle && (
            <h4
              className={cn(
                'prose-h4-small text-blue-400 desktop:prose-h4-large',
                fontSizeLevel === FontSizeLevel.LARGE &&
                  'text-[27.5px] desktop:text-[35px]'
              )}
            >
              {subtitle}
            </h4>
          )}
          <h1
            className={cn(
              'prose-h2-small font-swei! text-neutral-900 desktop:prose-h2-large',
              fontSizeLevel === FontSizeLevel.LARGE &&
                'text-[35px] desktop:text-[50px]'
            )}
          >
            {title}
          </h1>
        </header>
      </div>

      <HeroImage {...heroImageProps} />
    </div>
  )
}

export default TitleHero
